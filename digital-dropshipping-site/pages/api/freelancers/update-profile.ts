import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';

// Allow freelancers to update their own profile details
// Accepts a subset of columns from the freelancers table
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      freelancerId,
      display_name,
      headline,
      title,
      bio,
      description,
      country,
      skills, // array of strings or comma separated string
      hourly_rate_cents,
      availability,
    } = req.body || {};

    if (!freelancerId) {
      return res.status(400).json({ error: 'Missing freelancerId' });
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
    if (typeof availability === 'string') setField('availability', availability.trim());

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
    console.error('Error updating freelancer profile:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}


