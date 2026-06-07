import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, projectId, message, proposedRate, currency = 'AUD' } = req.body;

  if (!userId) return res.status(401).json({ error: 'Not authenticated' });
  if (!projectId) return res.status(400).json({ error: 'projectId is required' });
  if (!message?.trim()) return res.status(400).json({ error: 'Cover letter is required' });

  try {
    // Get freelancer record from user id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(userId)]
    );
    if (!freelancer) return res.status(404).json({ error: 'Freelancer profile not found' });

    // Check project exists and is open
    const project = await queryOne<{ id: number; status: string }>(
      `SELECT id, status FROM projects WHERE id = ? LIMIT 1`,
      [Number(projectId)]
    );
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ error: 'Project is no longer accepting proposals' });

    // Check for duplicate
    const existing = await queryOne<{ id: number }>(
      `SELECT id FROM proposals WHERE project_id = ? AND freelancer_id = ? LIMIT 1`,
      [Number(projectId), freelancer.id]
    );
    if (existing) return res.status(409).json({ error: 'You have already applied to this project' });

    const totalCents = proposedRate ? Math.round(Number(proposedRate) * 100) : 0;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    await query(
      `INSERT INTO proposals (project_id, freelancer_id, status, total_cents, currency, message, valid_until, submitted_at)
       VALUES (?, ?, 'sent', ?, ?, ?, ?, NOW())`,
      [
        Number(projectId),
        freelancer.id,
        totalCents,
        currency,
        message.trim(),
        validUntil.toISOString().slice(0, 10),
      ]
    );

    return res.status(201).json({ success: true, message: 'Proposal submitted successfully' });
  } catch (error: any) {
    console.error('Error submitting proposal:', error);
    return res.status(500).json({ error: 'Failed to submit proposal', details: error.message });
  }
}
