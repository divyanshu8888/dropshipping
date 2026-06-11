import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute, safeQuery } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError } from '../../../src/lib/apiAuth';

type UserRow = { id: string; email: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const { action, eventId, assignedTo, metadata } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    let result;

    switch (action) {
      case 'pin':
        await safeExecute(
          `UPDATE events SET is_pinned = 1, updated_at = NOW() WHERE id = ?`,
          [eventId],
          'event-pin'
        );
        result = { message: 'Event pinned successfully' };
        break;

      case 'unpin':
        await safeExecute(
          `UPDATE events SET is_pinned = 0, updated_at = NOW() WHERE id = ?`,
          [eventId],
          'event-unpin'
        );
        result = { message: 'Event unpinned successfully' };
        break;

      case 'assign':
        if (!assignedTo) {
          return res.status(400).json({ error: 'Assignee email is required for assignment' });
        }
        const assignees = await safeQuery<UserRow>(
          `SELECT id, email FROM users WHERE email = ? LIMIT 1`,
          [assignedTo],
          'event-assign-user'
        );
        const assigneeUser = assignees[0];
        if (!assigneeUser) {
          return res.status(400).json({ error: 'Assignee user not found' });
        }
        await safeExecute(
          `UPDATE events SET assigned_to = ?, updated_at = NOW() WHERE id = ?`,
          [assigneeUser.id, eventId],
          'event-assign'
        );
        result = { message: `Event assigned to ${assigneeUser.email}` };
        break;

      case 'archive':
        await safeExecute(
          `UPDATE events SET status = 'archived', updated_at = NOW() WHERE id = ?`,
          [eventId],
          'event-archive'
        );
        result = { message: 'Event archived successfully' };
        break;

      case 'create': {
        const {
          event_type,
          entity_type,
          entity_id,
          user_id,
          title,
          description,
          priority,
          event_metadata
        } = req.body;

        await safeExecute(
          `INSERT INTO events (
            event_type, entity_type, entity_id, user_id, title, description,
            priority, metadata, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [
            event_type,
            entity_type,
            entity_id,
            user_id,
            title,
            description,
            priority || 'medium',
            JSON.stringify(event_metadata || {})
          ],
          'event-create'
        );

        result = { message: 'Event created successfully' };
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await safeExecute(
      `INSERT INTO audit_log (event_type, table_name, record_id, new_data, user_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        `event_${action}`,
        'events',
        String(eventId ?? ''),
        JSON.stringify({
          action,
          assignedTo,
          metadata,
          timestamp: new Date().toISOString()
        }),
        'admin'
      ],
      'event-audit'
    );

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'manage-event', error);
  }
}
