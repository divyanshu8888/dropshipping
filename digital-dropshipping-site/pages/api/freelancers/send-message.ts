import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { guardMessage } from '../../../src/lib/moderation/contactGuard';
import { requireAuth, internalError } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity must come from the session cookie; body userId/clientUserId are ignored.
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const { projectId, content, sender } = req.body;

    if (!projectId || !content || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Why: only a participant (project freelancer or client owner) may message this project.
    const participant = await queryOne<{ id: number }>(
      `SELECT p.id
       FROM projects p
       LEFT JOIN freelancers f ON f.id = p.freelancer_id
       LEFT JOIN clients cl ON cl.id = p.client_id
       WHERE p.id = ? AND (f.user_id = ? OR cl.owner_id = ?)
       LIMIT 1`,
      [Number(projectId), user.id, user.id]
    );

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to send messages for this project' });
    }

    // Use the new contact guard for validation
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

      // Log blocked message attempt to admin notifications
      try {
        // Get project and user info for the notification
        const project = await queryOne<{ id: number; title: string; freelancer_id: number; client_id: number }>(
          `SELECT id, title, freelancer_id, client_id FROM projects WHERE id = ? LIMIT 1`,
          [Number(projectId)]
        );

        // Why: report the authenticated sender, not a client-supplied id.
        const senderUserId = user.id;
        const userInfo = await queryOne<{ id: number; email: string; display_name: string | null; name: string | null }>(
          `SELECT id, email, display_name, name FROM users WHERE id = ? LIMIT 1`,
          [senderUserId]
        );

        // Create admin notification record with specific type for pricing violations
        const notificationType = isPricingViolation ? 'moderation_pricing_violation' : 'moderation_blocked_message';
        const notificationTitle = isPricingViolation
          ? `Freelancer attempted to share pricing/payment information`
          : `Blocked message attempt: ${sender === 'freelancer' ? 'Freelancer' : 'Client'} tried to share contact info`;
        const notificationMessage = isPricingViolation
          ? `Freelancer "${userInfo?.display_name || userInfo?.name || userInfo?.email || 'Unknown'}" attempted to send a message containing pricing or payment information in project "${project?.title || 'Unknown'}". This violates platform policy to keep all payments within Unitiv.`
          : `User attempted to send a message containing restricted content: ${guardResult.reasons.join(', ')}. Detected: ${guardResult.detectedContent || 'N/A'}`;

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
            notificationType,
            notificationTitle,
            notificationMessage,
            JSON.stringify({
              projectId: Number(projectId),
              projectTitle: project?.title || 'Unknown',
              sender: sender,
              senderUserId: senderUserId,
              senderEmail: userInfo?.email || 'Unknown',
              senderName: userInfo?.display_name || userInfo?.name || userInfo?.email || 'Unknown',
              blockedContent: content.substring(0, 200), // First 200 chars
              detectedContent: guardResult.detectedContent,
              reasons: guardResult.reasons,
              violationType: isPricingViolation ? 'pricing_payment' : 'contact_info'
            }),
            senderUserId || null,
            Number(projectId),
            'high'
          ]
        );
      } catch (notifError) {
        // Log error but don't fail the request
        console.error('Failed to create admin notification:', notifError);
      }

      // Return user-friendly error message
      const errorMessage = isPricingViolation
        ? 'Payment information cannot be shared in messages. For your security and protection, all payments must be processed through Unitiv\'s secure payment system. Please use the project\'s payment features instead.'
        : 'For safety, keep contact & payments inside Unitiv. Messages cannot contain phone numbers, email addresses, external links, or personal contact details.';

      return res.status(400).json({ 
        error: errorMessage,
        reasons: guardResult.reasons,
        detectedContent: guardResult.detectedContent,
        violationType: isPricingViolation ? 'pricing_payment' : 'contact_info',
        details: isPricingViolation 
          ? 'All payments must be processed through Unitiv to ensure security and compliance. Please use the platform\'s payment system for all transactions.'
          : 'Messages cannot contain phone numbers, email addresses, external links, pricing information, or personal contact details. Please use Unitiv chat, calls, and payments instead.'
      });
    }

    // Get or create conversation for this project
    let conversation = await queryOne<{ id: number }>(
      `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!conversation) {
      // Create new conversation
      await query(
        `INSERT INTO conversations (project_id, title) VALUES (?, ?)`,
        [Number(projectId), `Project Discussion`]
      );
      conversation = await queryOne<{ id: number }>(
        `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
        [Number(projectId)]
      );
    }

    if (!conversation) {
      return res.status(500).json({ error: 'Failed to create or find conversation' });
    }

    // Why: sender identity comes from the authenticated session, never the body.
    const senderUserId = user.id;

    // Insert message
    await query(
      `INSERT INTO messages (conversation_id, sender_id, body, is_read) 
       VALUES (?, ?, ?, 'FALSE')`,
      [conversation.id, Number(senderUserId), content]
    );

    // Fetch the created message
    const message = await queryOne<{
      id: number;
      body: string;
      created_at: Date;
      is_read: string;
    }>(
      `SELECT id, body, created_at, is_read 
       FROM messages 
       WHERE conversation_id = ? AND sender_id = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [conversation.id, Number(senderUserId)]
    );

    if (!message) {
      return res.status(500).json({ error: 'Failed to retrieve created message' });
    }

    return res.status(200).json({
      success: true,
      message: {
        id: String(message.id),
        sender: sender,
        content: message.body,
        timestamp: new Date(message.created_at).toISOString(),
        read: message.is_read === 'TRUE'
      }
    });

  } catch (error) {
    return internalError(res, 'freelancers/send-message', error);
  }
}
