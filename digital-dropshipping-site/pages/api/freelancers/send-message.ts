import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { guardMessage } from '../../../src/lib/moderation/contactGuard';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, content, sender, userId } = req.body;

    if (!projectId || !content || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Use the new contact guard for validation
    const guardResult = guardMessage(content);
    
    if (!guardResult.allowed) {
      // Log blocked message attempt to admin notifications
      try {
        // Get project and user info for the notification
        const project = await queryOne<{ id: number; title: string; freelancer_id: number; client_id: number }>(
          `SELECT id, title, freelancer_id, client_id FROM projects WHERE id = ? LIMIT 1`,
          [Number(projectId)]
        );

        const senderUserId = sender === 'freelancer' ? userId : req.body.clientUserId;
        const userInfo = senderUserId ? await queryOne<{ id: number; email: string; display_name: string | null }>(
          `SELECT id, email, display_name FROM users WHERE id = ? LIMIT 1`,
          [Number(senderUserId)]
        ) : null;

        // Create admin notification record
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
            `Blocked message attempt: ${sender === 'freelancer' ? 'Freelancer' : 'Client'} tried to share contact info`,
            `User attempted to send a message containing restricted content: ${guardResult.reasons.join(', ')}. Detected: ${guardResult.detectedContent || 'N/A'}`,
            JSON.stringify({
              projectId: Number(projectId),
              projectTitle: project?.title || 'Unknown',
              sender: sender,
              senderUserId: senderUserId,
              senderEmail: userInfo?.email || 'Unknown',
              senderName: userInfo?.display_name || userInfo?.email || 'Unknown',
              blockedContent: content.substring(0, 200), // First 200 chars
              detectedContent: guardResult.detectedContent,
              reasons: guardResult.reasons
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

      return res.status(400).json({ 
        error: 'For safety, keep contact & payments inside Uniti.',
        reasons: guardResult.reasons,
        details: 'Messages cannot contain phone numbers, email addresses, external links, pricing information, or personal contact details. Please use Uniti chat, calls, and payments instead.'
      });
    }

    // Get or create conversation for this project
    let conversation = await queryOne<{ id: number }>(
      `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!conversation) {
      // Create new conversation
      const result = await query(
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

    // Get sender user_id - need to get it from the request context or pass it
    // For now, we'll need to get the user from the session
    // This is a simplified version - you may need to get userId from auth context
    const senderUserId = sender === 'freelancer' ? req.body.userId : req.body.clientUserId;
    
    if (!senderUserId) {
      return res.status(400).json({ error: 'Missing sender user ID' });
    }

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
    console.error('Error sending message:', error);
    return res.status(500).json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
