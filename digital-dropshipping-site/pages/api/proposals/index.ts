import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { requireRole, parsePositiveInt, internalError, sanitizeText } from '../../../src/lib/apiAuth';
import { checkRateLimit } from '../../../src/lib/rateLimit';
import { getApplyEligibility, APPLY_COMPLETION_THRESHOLD } from '../../../src/lib/freelancerEligibility';
import { moderateAndQueue } from '../../../src/lib/moderation/aiModeration';

// Why: request body size limit prevents abuse via oversized payloads.
export const config = {
  api: { bodyParser: { sizeLimit: '50kb' } },
};

const ALLOWED_CURRENCIES = ['AUD', 'USD', 'EUR', 'GBP', 'INR'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Why: previously trusted userId from the request body — anyone could submit
  // proposals as any user. Identity now comes from the verified session only.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  // Why: rate limit proposal spam per user.
  const rl = checkRateLimit(`proposals:${user.id}`);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(Math.ceil((rl.retryAfterMs ?? 60000) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { projectId, message, proposedRate, currency = 'AUD' } = req.body ?? {};

  // Why: validate inputs server-side (IDs must be positive ints, text bounded).
  const projectIdNum = parsePositiveInt(projectId);
  if (!projectIdNum) return res.status(400).json({ error: 'A valid projectId is required' });

  const cleanMessage = sanitizeText(message, 5000);
  if (!cleanMessage) return res.status(400).json({ error: 'Cover letter is required' });

  if (!ALLOWED_CURRENCIES.includes(currency)) {
    return res.status(400).json({ error: 'Unsupported currency' });
  }

  const rate = proposedRate === undefined || proposedRate === null || proposedRate === ''
    ? 0
    : Number(proposedRate);
  if (!Number.isFinite(rate) || rate < 0 || rate > 10_000_000) {
    return res.status(400).json({ error: 'Invalid proposed rate' });
  }

  try {
    // Why: server-side gate — verified account + >=90% complete profile required to apply.
    // Client UI mirrors this via /api/freelancers/can-apply, but enforcement lives here.
    const eligibility = await getApplyEligibility(user.id);
    if (!eligibility.freelancerId) {
      return res.status(404).json({ error: 'Freelancer profile not found' });
    }
    if (!eligibility.emailVerified || !eligibility.verified) {
      return res.status(403).json({
        error: 'Verify your account before applying to projects.',
        code: 'VERIFICATION_REQUIRED',
      });
    }
    if (eligibility.completion < APPLY_COMPLETION_THRESHOLD) {
      return res.status(403).json({
        error: `Complete your profile (currently ${eligibility.completion}%) before applying. Missing: ${eligibility.missing.join(', ')}.`,
        code: 'PROFILE_INCOMPLETE',
        completion: eligibility.completion,
        missing: eligibility.missing,
      });
    }
    const freelancer = { id: eligibility.freelancerId };

    // Check project exists and is open
    const project = await queryOne<{ id: number; status: string }>(
      `SELECT id, status FROM projects WHERE id = ? LIMIT 1`,
      [projectIdNum]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ error: 'Project is no longer accepting proposals' });

    // Check for duplicate
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ? LIMIT 1`,
      [projectIdNum, freelancer.id]
    );
    if (existing) return res.status(409).json({ error: 'You have already applied to this project' });

    // Why: cover letters reach clients directly — AI-judge them like all freelancer text.
    const aiVerdict = await moderateAndQueue('proposal', user.id, { coverLetter: cleanMessage });
    if (aiVerdict.flagged) {
      return res.status(400).json({
        error: 'Your cover letter was flagged by automated content review. Please rephrase it and try again.',
        code: 'AI_FLAGGED',
      });
    }

    const totalCents = Math.round(rate * 100);
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    await query(
      `INSERT INTO proposals (project_id, freelancer_id, status, total_cents, currency, message, valid_until, submitted_at)
       VALUES (?, ?, 'sent', ?, ?, ?, ?, NOW())`,
      [
        projectIdNum,
        freelancer.id,
        totalCents,
        currency,
        cleanMessage,
        validUntil.toISOString().slice(0, 10),
      ]
    );

    return res.status(201).json({ success: true, message: 'Proposal submitted successfully' });
  } catch (error) {
    // Why: previously returned error.message to the client (info leak).
    return internalError(res, 'proposals:create', error);
  }
}
