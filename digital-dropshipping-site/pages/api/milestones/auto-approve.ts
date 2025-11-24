import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../src/lib/mysql';

/**
 * Auto-approval endpoint for milestones
 * 
 * This should be called by a cron job or scheduled task daily.
 * Milestones in 'submitted' status for > 5 business days are auto-approved.
 * 
 * Business days = Monday-Friday (excludes weekends and holidays)
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests (or GET for manual testing)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Calculate 5 business days ago
    // Business days = Monday-Friday (exclude weekends)
    const now = new Date();
    let businessDaysAgo = new Date(now);
    let daysToSubtract = 5;
    let daysSubtracted = 0;

    // Go back 5 business days (excluding weekends)
    while (daysSubtracted < daysToSubtract) {
      businessDaysAgo.setDate(businessDaysAgo.getDate() - 1);
      const dayOfWeek = businessDaysAgo.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysSubtracted++;
      }
    }

    const cutoffDate = businessDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

    // Find milestones that have been in 'submitted' status for > 5 business days
    // Use submitted_at if available, otherwise fall back to updated_at
    const submittedMilestones = await query<{
      id: number;
      contract_id: number;
      project_id: number;
      client_id: number;
      submitted_at: string | null;
      updated_at: string;
    }>(
      `SELECT 
        m.id,
        m.contract_id,
        c.project_id,
        p.client_id,
        m.submitted_at,
        m.updated_at
      FROM milestones m
      INNER JOIN contracts c ON m.contract_id = c.id
      INNER JOIN projects p ON c.project_id = p.id
      WHERE m.status = 'submitted'
        AND (m.submitted_at <= ? OR (m.submitted_at IS NULL AND m.updated_at <= ?))
      ORDER BY COALESCE(m.submitted_at, m.updated_at) ASC`,
      [cutoffDate, cutoffDate]
    );

    if (!submittedMilestones || submittedMilestones.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No milestones eligible for auto-approval',
        autoApproved: 0
      });
    }

    const autoApprovedIds: number[] = [];
    const errors: string[] = [];

    // Auto-approve each milestone
    for (const milestone of submittedMilestones) {
      try {
        // Update milestone to approved, which will auto-release funds
        // The milestone update endpoint will automatically change 'approved' to 'released'
        // But for auto-approval, we directly set to 'released' to complete the flow
        await query(
          `UPDATE milestones 
           SET status = 'released', updated_at = NOW() 
           WHERE id = ?`,
          [milestone.id]
        );

        autoApprovedIds.push(milestone.id);

        // Update project status and progress (same logic as manual approval)
        const allMilestones = await query<{
          id: number;
          status: string;
        }>(
          `SELECT m.id, m.status
           FROM milestones m
           INNER JOIN contracts c ON m.contract_id = c.id
           WHERE c.project_id = ?`,
          [milestone.project_id]
        );

        if (allMilestones && allMilestones.length > 0) {
          const totalMilestones = allMilestones.length;
          const completedMilestones = allMilestones.filter(m => 
            ['approved', 'released'].includes(m.status)
          ).length;
          const allCompleted = completedMilestones === totalMilestones;

          const project = await queryOne<{
            id: number;
            status: string;
            completed_at: string | null;
            started_at: string | null;
          }>(
            `SELECT id, status, completed_at, started_at FROM projects WHERE id = ?`,
            [milestone.project_id]
          );

          if (project) {
            let newProjectStatus = project.status;

            if (allCompleted) {
              if (project.status !== 'completed' && project.status !== 'delivered') {
                newProjectStatus = 'delivered';
              }
            } else if (completedMilestones > 0) {
              if (project.status === 'contracted' || project.status === 'open' || project.status === 'in_review') {
                newProjectStatus = 'in_progress';
              }
            }

            if (newProjectStatus !== project.status) {
              await query(
                `UPDATE projects 
                 SET status = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [newProjectStatus, milestone.project_id]
              );

              if (newProjectStatus === 'in_progress' && !project.started_at) {
                await query(
                  `UPDATE projects 
                   SET started_at = NOW() 
                   WHERE id = ? AND started_at IS NULL`,
                  [milestone.project_id]
                );
              }

              if ((newProjectStatus === 'delivered' || newProjectStatus === 'completed') && !project.completed_at) {
                await query(
                  `UPDATE projects 
                   SET completed_at = NOW() 
                   WHERE id = ? AND completed_at IS NULL`,
                  [milestone.project_id]
                );
              }
            }
          }
        }
      } catch (error: any) {
        errors.push(`Failed to auto-approve milestone ${milestone.id}: ${error.message}`);
        console.error(`Error auto-approving milestone ${milestone.id}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Auto-approved ${autoApprovedIds.length} milestone(s)`,
      autoApproved: autoApprovedIds.length,
      milestoneIds: autoApprovedIds,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Error in auto-approval process:', error);
    return res.status(500).json({
      error: 'Failed to process auto-approvals',
      details: error.message
    });
  }
}

