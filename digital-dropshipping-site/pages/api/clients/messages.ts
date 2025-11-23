import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { guardMessage } from '../../../src/lib/moderation/contactGuard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { projectId, content, senderId } = req.body;

    if (!projectId || !content || !senderId) {
      return res.status(400).json({ error: 'Missing required fields: projectId, content, senderId' });
    }

    // Validate message content using contact guard
    const guardResult = guardMessage(content);
    if (!guardResult.allowed) {
      // Check if this is a pricing/payment violation
      const isPricingViolation = guardResult.reasons.some(reason => 
        reason.toLowerCase().includes('payment') || 
        reason.toLowerCase().includes('bank') ||
        reason.toLowerCase().includes('price') ||
        reason.toLowerCase().includes('cost') ||
        reason.toLowerCase().includes('fee')
      );

      // Create admin notification for pricing/payment violations
      if (isPricingViolation) {
        try {
          // Get user info for the notification
          const userInfo = await queryOne<{ id: number; email: string; name: string | null }>(
            `SELECT id, email, name FROM users WHERE id = ? LIMIT 1`,
            [Number(senderId)]
          );

          // Get project info
          const projectInfo = await queryOne<{ id: number; title: string; client_id: number; freelancer_id: number | null }>(
            `SELECT id, title, client_id, freelancer_id FROM projects WHERE id = ? LIMIT 1`,
            [Number(projectId)]
          );

          // Create admin notification
          await query(
            `INSERT INTO admin_notifications (
              type, 
              title, 
              message, 
              metadata, 
              user_id, 
              project_id,
              severity,
              is_read,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'FALSE', NOW())`,
            [
              'moderation_pricing_violation',
              'Client attempted to share pricing/payment information',
              `Client "${userInfo?.name || userInfo?.email || 'Unknown'}" attempted to send a message containing pricing or payment information in project "${projectInfo?.title || 'Unknown'}". This violates platform policy to keep all payments within Uniti.`,
              JSON.stringify({
                projectId: Number(projectId),
                projectTitle: projectInfo?.title || 'Unknown',
                sender: 'client',
                senderUserId: Number(senderId),
                senderEmail: userInfo?.email || 'Unknown',
                senderName: userInfo?.name || userInfo?.email || 'Unknown',
                blockedContent: content.substring(0, 200), // First 200 chars
                detectedContent: guardResult.detectedContent,
                reasons: guardResult.reasons,
                violationType: 'pricing_payment'
              }),
              Number(senderId),
              Number(projectId),
              'high'
            ]
          );
        } catch (notifError) {
          // Log error but don't fail the request
          console.error('Failed to create admin notification:', notifError);
        }
      } else {
        // Create notification for other violations too
        try {
          const userInfo = await queryOne<{ id: number; email: string; name: string | null }>(
            `SELECT id, email, name FROM users WHERE id = ? LIMIT 1`,
            [Number(senderId)]
          );

          const projectInfo = await queryOne<{ id: number; title: string }>(
            `SELECT id, title FROM projects WHERE id = ? LIMIT 1`,
            [Number(projectId)]
          );

          await query(
            `INSERT INTO admin_notifications (
              type, 
              title, 
              message, 
              metadata, 
              user_id, 
              project_id,
              severity,
              is_read,
              created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'FALSE', NOW())`,
            [
              'moderation_blocked_message',
              'Client attempted to share restricted content',
              `Client "${userInfo?.name || userInfo?.email || 'Unknown'}" attempted to send a message containing restricted content: ${guardResult.reasons.join(', ')}`,
              JSON.stringify({
                projectId: Number(projectId),
                projectTitle: projectInfo?.title || 'Unknown',
                sender: 'client',
                senderUserId: Number(senderId),
                senderEmail: userInfo?.email || 'Unknown',
                senderName: userInfo?.name || userInfo?.email || 'Unknown',
                blockedContent: content.substring(0, 200),
                detectedContent: guardResult.detectedContent,
                reasons: guardResult.reasons
              }),
              Number(senderId),
              Number(projectId),
              'medium'
            ]
          );
        } catch (notifError) {
          console.error('Failed to create admin notification:', notifError);
        }
      }

      // Return user-friendly error message
      const errorMessage = isPricingViolation
        ? 'Payment information cannot be shared in messages. For your security and protection, all payments must be processed through Uniti\'s secure payment system. Please use the project\'s payment features instead.'
        : 'For safety, keep contact & payments inside Uniti. Messages cannot contain phone numbers, email addresses, external links, or personal contact details.';

      return res.status(400).json({
        error: errorMessage,
        reasons: guardResult.reasons,
        detectedContent: guardResult.detectedContent,
        violationType: isPricingViolation ? 'pricing_payment' : 'contact_info'
      });
    }

    // Verify the project exists and the user is the client
    const project = await queryOne<{
      id: number;
      client_id: number;
      freelancer_id: number | null;
      owner_id: number;
    }>(
      `SELECT p.id, p.client_id, p.freelancer_id, c.owner_id
       FROM projects p
       JOIN clients c ON c.id = p.client_id
       WHERE p.id = ?`,
      [Number(projectId)]
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Verify the sender is the client owner
    if (project.owner_id !== Number(senderId)) {
      return res.status(403).json({ error: 'Not authorized to send messages for this project' });
    }

    // Find or create conversation for this project
    let conversation = await queryOne<{ id: number }>(
      `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!conversation) {
      // Create conversation
      const convResult = await query(
        `INSERT INTO conversations (project_id, created_at, updated_at)
         VALUES (?, NOW(), NOW())`,
        [Number(projectId)]
      );
      const convId = (convResult as any).insertId;

      // Add participants
      await query(
        `INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
         VALUES (?, ?, 'client', NOW())`,
        [convId, Number(senderId)]
      );

      if (project.freelancer_id) {
        // Get freelancer's user_id
        const freelancer = await queryOne<{ user_id: number }>(
          `SELECT user_id FROM freelancers WHERE id = ?`,
          [project.freelancer_id]
        );
        if (freelancer) {
          await query(
            `INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
             VALUES (?, ?, 'freelancer', NOW())`,
            [convId, freelancer.user_id]
          );
        }
      }

      conversation = { id: convId };
    }

    // Insert message
    const result = await query(
      `INSERT INTO messages 
       (conversation_id, project_id, sender_id, body, message_type, is_read, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'text', 'FALSE', NOW(), NOW())`,
      [conversation.id, Number(projectId), Number(senderId), content]
    );

    const messageId = (result as any).insertId;

    // Update conversation updated_at
    await query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = ?`,
      [conversation.id]
    );

    return res.status(200).json({
      success: true,
      messageId: String(messageId),
      message: {
        id: String(messageId),
        sender: 'client',
        content,
        timestamp: new Date().toISOString(),
        read: false
      }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

