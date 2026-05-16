import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../../src/lib/mysql';

// Valid milestone statuses
const VALID_STATUSES = ['pending', 'funded', 'in_progress', 'submitted', 'approved', 'released', 'rejected'];

// Statuses that clients can set (clients can edit to any valid status)
const CLIENT_ALLOWED_STATUSES = VALID_STATUSES;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user info - check if user is a client
    const user = await queryOne<{ id: number; role: string }>(
      `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is a client (database stores roles in lowercase)
    const userRole = user.role?.toUpperCase();
    if (userRole !== 'CLIENT') {
      return res.status(403).json({ error: 'Only clients can update milestone status' });
    }

    // Get client ID from user_id (clients table has owner_id that references users)
    const client = await queryOne<{ id: number }>(
      `SELECT id FROM clients WHERE owner_id = ? LIMIT 1`,
      [user.id]
    );

    if (!client) {
      console.error('Client record not found for user:', user.id);
      return res.status(403).json({ 
        error: 'Client record not found. Please ensure your account is properly set up as a client.' 
      });
    }

    const clientId = client.id;

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Milestone ID is required' });
    }

    const milestoneId = Number.parseInt(id, 10);
    if (Number.isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID' });
    }

    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Check if client is allowed to set this status
    if (!CLIENT_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({ error: `Clients can only set status to: ${CLIENT_ALLOWED_STATUSES.join(' or ')}` });
    }

    // Get the milestone and verify it belongs to a project owned by this client
    const milestone = await queryOne<{
      id: number;
      contract_id: number;
      status: string;
      project_id: number;
      client_id: number;
    }>(
      `SELECT m.id, m.contract_id, m.status, c.project_id, p.client_id
       FROM milestones m
       INNER JOIN contracts c ON m.contract_id = c.id
       INNER JOIN projects p ON c.project_id = p.id
       WHERE m.id = ? AND p.client_id = ?`,
      [milestoneId, clientId]
    );

    if (!milestone) {
      console.error('Milestone not found or permission denied:', { milestoneId, clientId, userId: user.id });
      return res.status(404).json({ 
        error: 'Milestone not found or you do not have permission to update it',
        details: `Milestone ID: ${milestoneId}, Client ID: ${clientId}`
      });
    }

    // Enforce workflow: Clients can approve/reject submitted milestones
    // Or manually set status for administrative purposes
    // Best practice: Only allow transitions that make sense
    
    // Workflow enforcement (optional - can be relaxed for admin flexibility):
    // For strict enforcement, import and use milestoneWorkflow.ts:
    /*
    import { isValidTransition } from '../../../../src/lib/milestoneWorkflow';
    
    if (!isValidTransition(milestone.status as MilestoneStatus, status as MilestoneStatus)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${milestone.status} to ${status}`,
        allowedTransitions: getNextValidStatuses(milestone.status as MilestoneStatus)
      });
    }
    */
    
    // Current implementation: Allow flexible transitions for admin purposes
    // Recommended transitions:
    // - 'submitted' → 'approved' or 'rejected'
    // - 'approved' → 'released' (auto)
    // - 'rejected' → 'submitted' (resubmit)

    // Update the milestone status with workflow logic
    let finalStatus = status;
    let updateQuery = `UPDATE milestones SET status = ?, updated_at = NOW()`;
    const updateParams: any[] = [status];

    // Set submitted_at when milestone is submitted
    if (status === 'submitted' && milestone.status !== 'submitted') {
      updateQuery += `, submitted_at = NOW()`;
    }

    // Auto-release funds when approved (change to 'released' automatically)
    // Note: In production, you might want to integrate with payment processor here
    if (status === 'approved') {
      // Auto-release: Change status to 'released' immediately after approval
      // This represents funds being released from escrow
      finalStatus = 'released';
      updateParams[0] = 'released';
    }

    updateQuery += ` WHERE id = ?`;
    updateParams.push(milestoneId);

    try {
      await query(updateQuery, updateParams);
    } catch (updateError: any) {
      console.error('Database update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update milestone in database',
        details: updateError.message || 'Unknown database error'
      });
    }
    
    // Verify the update was successful
    const verificationMilestone = await queryOne<{ id: number; status: string }>(
      `SELECT id, status FROM milestones WHERE id = ?`,
      [milestoneId]
    );

    if (!verificationMilestone) {
      console.error('Milestone not found after update');
      return res.status(500).json({ error: 'Failed to update milestone in database - milestone not found after update' });
    }

    if (verificationMilestone.status !== finalStatus) {
      console.error('Status mismatch:', { expected: finalStatus, actual: verificationMilestone.status });
      return res.status(500).json({ 
        error: `Failed to update milestone status. Expected: ${finalStatus}, but got: ${verificationMilestone.status}` 
      });
    }

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
          'funded': `Funded milestone "${milestoneInfo.title}"`,
          'approved': `Approved milestone "${milestoneInfo.title}"`,
          'rejected': `Rejected milestone "${milestoneInfo.title}"`,
          'released': `Released payment for milestone "${milestoneInfo.title}"`
        };

        const message = statusMessages[finalStatus];
        if (message) {
          await query(
            `INSERT INTO messages (conversation_id, sender_id, body, message_type, is_read) 
             VALUES (?, ?, ?, 'milestone', 'FALSE')`,
            [conversation.id, user.id, message]
          );
        }
      }
    }

    // Update project status and progress based on milestone states
    // Get all milestones for this project
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
      const completedMilestones = allMilestones.filter(m =>
        ['approved', 'released'].includes(m.status)
      ).length;
      const hasApproved = completedMilestones > 0;

      // Get current project status
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
        // 1. Projects should NOT automatically go to 'delivered' - only freelancer can set it manually
        // 2. If at least one milestone is approved -> project should be 'in_progress'
        // 3. If milestone is submitted (by freelancer) -> project should be 'in_progress'
        // 4. When all milestones are completed, project stays 'in_progress' until freelancer marks it 'delivered'
        
        if (hasApproved || finalStatus === 'submitted' || finalStatus === 'released') {
          // At least one milestone approved/released or submitted - project is in progress
          if (project.status === 'contracted' || project.status === 'open' || project.status === 'in_review') {
            newProjectStatus = 'in_progress';
          }
        }

        // Update project status if it changed
        if (newProjectStatus !== project.status) {
    await query(
            `UPDATE projects 
       SET status = ?, updated_at = NOW() 
       WHERE id = ?`,
            [newProjectStatus, milestone.project_id]
          );

          // Set started_at if project is moving to in_progress for the first time
          if (newProjectStatus === 'in_progress' && !project.started_at) {
            await query(
              `UPDATE projects 
               SET started_at = NOW() 
               WHERE id = ? AND started_at IS NULL`,
              [milestone.project_id]
            );
          }

          // Note: completed_at should only be set when freelancer manually marks project as 'delivered'
          // This is handled in the freelancer's update-project-status API
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

