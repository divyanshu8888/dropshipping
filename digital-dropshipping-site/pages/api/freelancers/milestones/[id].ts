import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../../src/lib/mysql';

// Valid milestone statuses
const VALID_STATUSES = ['pending', 'funded', 'in_progress', 'submitted', 'approved', 'released', 'rejected'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.freelancerId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get freelancer ID from user_id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!freelancer) {
      return res.status(403).json({ error: 'Freelancer record not found' });
    }

    const freelancerId = freelancer.id;

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Milestone ID is required' });
    }

    const milestoneId = Number.parseInt(id, 10);
    if (Number.isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID' });
    }

    const { status, dueDate, description } = req.body;
    
    // If updating due date or description (not status)
    if (dueDate !== undefined || description !== undefined) {
      // Check if previous milestone is approved (sequential milestone editing restriction)
      const milestoneWithOrder = await queryOne<{ sort_order: number; contract_id: number }>(
        `SELECT sort_order, contract_id FROM milestones WHERE id = ?`,
        [milestoneId]
      );

      if (milestoneWithOrder && milestoneWithOrder.sort_order > 1) {
        const previousMilestone = await queryOne<{ status: string }>(
          `SELECT status FROM milestones 
           WHERE contract_id = ? AND sort_order = ?`,
          [milestoneWithOrder.contract_id, milestoneWithOrder.sort_order - 1]
        );

        if (!previousMilestone || !['approved', 'released'].includes(previousMilestone.status)) {
          return res.status(403).json({ 
            error: `Cannot edit milestone ${milestoneWithOrder.sort_order}. Previous milestone must be approved first.` 
          });
        }
      }

      // Update due date or description
      const updates: string[] = [];
      const params: any[] = [];

      if (dueDate !== undefined) {
        updates.push('due_date = ?');
        params.push(dueDate || null);
      }

      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description || null);
      }

      if (updates.length > 0) {
        updates.push('updated_at = NOW()');
        params.push(milestoneId);

        await query(
          `UPDATE milestones SET ${updates.join(', ')} WHERE id = ?`,
          params
        );

        // Get updated milestone
        const updatedMilestone = await queryOne<{
          id: number;
          contract_id: number;
          title: string;
          description: string | null;
          amount_cents: number;
          due_date: string | null;
          status: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        }>(
          `SELECT id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at, updated_at
           FROM milestones
           WHERE id = ?`,
          [milestoneId]
        );

        return res.status(200).json({
          success: true,
          milestone: updatedMilestone
        });
      }
    }

    // Status update logic (existing code)
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status, dueDate, or description is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Get the milestone and verify it belongs to a project assigned to this freelancer
    const milestone = await queryOne<{
      id: number;
      contract_id: number;
      status: string;
      project_id: number;
      freelancer_id: number;
    }>(
      `SELECT m.id, m.contract_id, m.status, c.project_id, p.freelancer_id
       FROM milestones m
       INNER JOIN contracts c ON m.contract_id = c.id
       INNER JOIN projects p ON c.project_id = p.id
       WHERE m.id = ? AND p.freelancer_id = ?`,
      [milestoneId, freelancerId]
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or you do not have permission to update it' });
    }

    // Check if previous milestone is approved (sequential milestone editing restriction)
    const milestoneWithOrder = await queryOne<{ sort_order: number; contract_id: number }>(
      `SELECT sort_order, contract_id FROM milestones WHERE id = ?`,
      [milestoneId]
    );

    if (milestoneWithOrder && milestoneWithOrder.sort_order > 1) {
      const previousMilestone = await queryOne<{ status: string }>(
        `SELECT status FROM milestones 
         WHERE contract_id = ? AND sort_order = ?`,
        [milestoneWithOrder.contract_id, milestoneWithOrder.sort_order - 1]
      );

      if (!previousMilestone || !['approved', 'released'].includes(previousMilestone.status)) {
        return res.status(403).json({ 
          error: `Cannot update milestone ${milestoneWithOrder.sort_order}. Previous milestone must be approved first.` 
        });
      }
    }

    // Freelancers can only:
    // - Start work: 'funded' -> 'in_progress'
    // - Submit: 'in_progress' -> 'submitted'
    // - Resubmit after rejection: 'rejected' -> 'in_progress'
    const validFreelancerTransitions: Record<string, string[]> = {
      'funded': ['in_progress'],
      'in_progress': ['submitted'],
      'rejected': ['in_progress']
    };

    if (milestone.status !== status) {
      const allowedTransitions = validFreelancerTransitions[milestone.status];
      if (!allowedTransitions || !allowedTransitions.includes(status)) {
        return res.status(400).json({ 
          error: `Invalid status transition from ${milestone.status} to ${status}`,
          allowedTransitions: allowedTransitions || []
        });
      }
    }

    // Update the milestone status with workflow logic
    let updateQuery = `UPDATE milestones SET status = ?, updated_at = NOW()`;
    const updateParams: any[] = [status];

    // Set submitted_at when milestone is submitted
    if (status === 'submitted' && milestone.status !== 'submitted') {
      updateQuery += `, submitted_at = NOW()`;
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(milestoneId);

    await query(updateQuery, updateParams);

    // Get milestone title and project info for notification
    const milestoneInfo = await queryOne<{ title: string; project_id: number }>(
      `SELECT m.title, c.project_id
       FROM milestones m
       INNER JOIN contracts c ON m.contract_id = c.id
       WHERE m.id = ?`,
      [milestoneId]
    );

    // Get or create conversation for this project
    if (milestoneInfo) {
      let conversation = await queryOne<{ id: number }>(
        `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
        [milestoneInfo.project_id]
      );

      if (!conversation) {
        await query(
          `INSERT INTO conversations (project_id, title) VALUES (?, ?)`,
          [milestoneInfo.project_id, `Project Discussion`]
        );
        conversation = await queryOne<{ id: number }>(
          `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
          [milestoneInfo.project_id]
        );
      }

      // Send notification message to inbox
      if (conversation) {
        const statusMessages: Record<string, string> = {
          'in_progress': `Started work on milestone "${milestoneInfo.title}"`,
          'submitted': `Submitted milestone "${milestoneInfo.title}" for review`,
          'rejected': `Milestone "${milestoneInfo.title}" was rejected and needs resubmission`
        };

        const message = statusMessages[status];
        if (message) {
          await query(
            `INSERT INTO messages (conversation_id, sender_id, body, message_type, is_read) 
             VALUES (?, ?, ?, 'milestone', 'FALSE')`,
            [conversation.id, Number(userId), message]
          );
        }
      }
    }

    // Update project status and progress based on milestone states
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
      const hasApproved = completedMilestones > 0;

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

        // Logic for project status updates:
        // 1. Projects should NOT automatically go to 'delivered' - only freelancer can set it manually via update-project-status API
        // 2. If at least one milestone is approved/submitted -> project should be 'in_progress'
        // 3. When all milestones are completed, project stays 'in_progress' until freelancer marks it 'delivered'
        
        if (hasApproved || status === 'submitted') {
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

          // Note: completed_at should only be set when freelancer manually marks project as 'delivered'
          // This is handled in the update-project-status API
        }
      }
    }

    // Get updated milestone
    const updatedMilestone = await queryOne<{
      id: number;
      contract_id: number;
      title: string;
      description: string | null;
      amount_cents: number;
      due_date: string | null;
      status: string;
      sort_order: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at, updated_at
       FROM milestones
       WHERE id = ?`,
      [milestoneId]
    );

    return res.status(200).json({
      success: true,
      milestone: updatedMilestone
    });

  } catch (error: any) {
    console.error('Error updating milestone status:', error);
    return res.status(500).json({ 
      error: 'Failed to update milestone status',
      details: error.message 
    });
  }
}

