import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, status, freelancerId } = req.body;

    if (!projectId || !status || !freelancerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate status
    const validStatuses = ['draft', 'open', 'in_review', 'contracted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify the project belongs to this freelancer
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const project = await queryOne<{ freelancer_id: number }>(
      `SELECT freelancer_id FROM projects WHERE id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.freelancer_id !== freelancer.id) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    // Update project status
    await query(
      `UPDATE projects SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, Number(projectId)]
    );

    // If status is 'delivered' or 'completed', set completed_at timestamp
    if (status === 'delivered' || status === 'completed') {
      await query(
        `UPDATE projects 
         SET completed_at = NOW() 
         WHERE id = ? AND completed_at IS NULL`,
        [Number(projectId)]
      );
    }

    return res.status(200).json({ 
      success: true,
      message: 'Project status updated successfully'
    });

  } catch (error) {
    console.error('Error updating project status:', error);
    return res.status(500).json({
      error: 'Failed to update project status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

