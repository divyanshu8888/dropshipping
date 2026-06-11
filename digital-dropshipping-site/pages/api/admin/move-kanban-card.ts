import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError } from '../../../src/lib/apiAuth';

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
    const { cardId, fromStatus, toStatus } = req.body;

    if (!cardId || !toStatus) {
      return res.status(400).json({ error: 'cardId and toStatus are required' });
    }

    await safeExecute(
      `UPDATE projects
         SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [toStatus, cardId],
      'kanban-move'
    );

    await safeExecute(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        'admin',
        'move_kanban_card',
        'project',
        String(cardId),
        JSON.stringify({
          fromStatus,
          toStatus,
          timestamp: new Date().toISOString()
        })
      ],
      'kanban-move-audit'
    );

    return res.status(200).json({
      success: true,
      message: 'Card moved successfully'
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'move-kanban-card', error);
  }
}
