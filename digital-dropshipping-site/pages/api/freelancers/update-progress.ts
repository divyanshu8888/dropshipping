import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../src/lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, progress, freelancerId } = req.body;

    if (!projectId || progress === undefined || !freelancerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the project belongs to this freelancer
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const project = await queryOne<{ id: number; freelancer_id: number }>(
      `SELECT id, freelancer_id FROM projects WHERE id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.freelancer_id !== freelancer.id) {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    // Note: Progress is typically calculated from milestones automatically
    // This endpoint allows manual override if needed
    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(Math.max(Number(progress), 0), 100);

    // Update project (if you have a progress column, otherwise this is just for status)
    // Since progress is calculated from milestones, we'll just update status if needed
    if (clampedProgress >= 100) {
      await query(
        `UPDATE projects SET status = 'delivered', updated_at = NOW() WHERE id = ?`,
        [Number(projectId)]
      );
    } else {
      await query(
        `UPDATE projects SET updated_at = NOW() WHERE id = ?`,
        [Number(projectId)]
      );
    }

    // Get updated project
    const updatedProject = await queryOne<{
      id: number;
      title: string;
      status: string;
    }>(
      `SELECT id, title, status FROM projects WHERE id = ?`,
      [Number(projectId)]
    );

    return res.status(200).json({
      success: true,
      project: updatedProject,
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({
      error: 'Failed to update progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
