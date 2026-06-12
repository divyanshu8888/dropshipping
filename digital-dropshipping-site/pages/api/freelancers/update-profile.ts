import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { requireRole, internalError } from '../../../src/lib/apiAuth';
import { checkFields } from '../../../src/lib/moderation/contentFilter';
import { moderateAndQueue } from '../../../src/lib/moderation/aiModeration';

// Why: profiles are client-facing — a one-line bio or empty pitch hurts conversion
// and the apply gate. Minimums force a real "who I am" description.
export const BIO_MIN = 50;
export const DESCRIPTION_MIN = 150;

// Allow freelancers to update their own profile details
// Accepts a subset of columns from the freelancers table
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity must come from the session cookie; body freelancerId is ignored.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  try {
    const {
      display_name,
      headline,
      title,
      bio,
      description,
      country,
      skills, // array of strings or comma separated string
      hourly_rate_cents,
      // Why: `availability` is intentionally NOT accepted here. That column stores the
      // structured string owned by /api/freelancers/update-availability (the Calendar tab);
      // accepting it here let profile saves overwrite "available|..." and flip users to busy.
    } = req.body || {};

    // Why: only the freelancer record owned by the session user may be updated.
    const ownRecord = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [user.id]
    );

    if (!ownRecord) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerId = ownRecord.id;

    // Why: enforce minimum quality server-side, not just in the form.
    if (typeof bio === 'string' && bio.trim() && bio.trim().length < BIO_MIN) {
      return res.status(400).json({
        error: `Your bio is too short. Write at least ${BIO_MIN} characters about who you are and what you do.`,
      });
    }
    if (typeof description === 'string' && description.trim() && description.trim().length < DESCRIPTION_MIN) {
      return res.status(400).json({
        error: `Your description is too short. Write at least ${DESCRIPTION_MIN} characters — your experience, the projects you take on, and how you work.`,
      });
    }

    // Why: never publish abusive or questionable text on a public profile.
    const contentCheck = checkFields({
      'display name': display_name,
      headline,
      title,
      bio,
      description,
      skills: Array.isArray(skills) ? skills.join(', ') : skills,
    });
    if (!contentCheck.ok) {
      // Log the attempt so admins can spot repeat offenders (never block on logging).
      try {
        await query(
          `INSERT INTO admin_notifications (type, title, message, user_id, severity, is_read, created_at)
           VALUES ('content_flagged', ?, ?, ?, ?, 'FALSE', NOW())`,
          [
            `Profile content ${contentCheck.tier}`,
            `User #${user.id} tried to save ${contentCheck.tier} content in profile ${contentCheck.field} (matched: "${contentCheck.match}")`,
            user.id,
            contentCheck.tier === 'blocked' ? 'high' : 'medium',
          ],
        );
      } catch { /* notifications table may not exist */ }

      const messages: Record<string, string> = {
        blocked: `Your ${contentCheck.field} contains language that isn't allowed on Unitiv. Please rephrase it.`,
        confidential: `Your ${contentCheck.field} contains a ${contentCheck.match}. Contact, payment, and ID details can't appear on public profiles — clients reach you through Unitiv.`,
        questionable: `Your ${contentCheck.field} contains content that can't be published on a professional profile. Please rephrase it — if you believe this is a mistake, contact support.`,
      };
      return res.status(400).json({
        error: messages[contentCheck.tier],
        code: 'CONTENT_REJECTED',
        field: contentCheck.field,
      });
    }

    // Why: AI pass judges MEANING (novel insults, coded hate, context) that the
    // word filter can't; flagged saves are rejected and queued for admin review.
    const aiVerdict = await moderateAndQueue('profile', user.id, {
      headline,
      title,
      bio,
      description,
    });
    if (aiVerdict.flagged) {
      return res.status(400).json({
        error:
          'Your profile text was flagged by automated content review and sent to our moderators. Please rephrase it — or contact support if you believe this is a mistake.',
        code: 'AI_FLAGGED',
      });
    }

    // Normalize skills to JSON string
    let skillsJson: string | null = null;
    if (Array.isArray(skills)) {
      skillsJson = JSON.stringify(skills.map((s) => String(s).trim()).filter(Boolean));
    } else if (typeof skills === 'string') {
      const parts = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      skillsJson = JSON.stringify(parts);
    }

    const fields: string[] = [];
    const params: any[] = [];

    const setField = (column: string, value: any) => {
      fields.push(`${column} = ?`);
      params.push(value);
    };

    if (typeof display_name === 'string') setField('display_name', display_name.trim());
    if (typeof headline === 'string') setField('headline', headline.trim());
    if (typeof title === 'string') setField('title', title.trim());
    if (typeof bio === 'string') setField('bio', bio.trim());
    if (typeof description === 'string') setField('description', description.trim());
    if (typeof country === 'string') setField('country', country.trim());
    if (skillsJson !== null) setField('skills', skillsJson);
    if (Number.isFinite(Number(hourly_rate_cents))) setField('hourly_rate_cents', Number(hourly_rate_cents));

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

    const sql = `
      UPDATE freelancers
         SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = ?
       LIMIT 1
    `;
    params.push(freelancerId);

    await query(sql, params);

    const [updated] = await query<any>(`SELECT * FROM freelancers WHERE id = ? LIMIT 1`, [freelancerId]);

    return res.status(200).json({ success: true, freelancer: updated });
  } catch (error) {
    return internalError(res, 'freelancers/update-profile', error);
  }
}


