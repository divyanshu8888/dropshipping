import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../src/lib/mysql';
import { requireAdmin, internalError, parsePositiveInt } from '../../../src/lib/apiAuth';

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
    const { notificationId, markAllRead } = req.body;

    if (markAllRead) {
      // Mark all unread notifications as read
      await query(
        `UPDATE admin_notifications 
         SET is_read = 'TRUE', read_at = NOW() 
         WHERE is_read = 'FALSE'`
      );
      
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    if (!notificationId) {
      return res.status(400).json({ error: 'Missing notificationId' });
    }

    // Why: Number() accepted floats/negatives; require a positive integer id.
    const notificationIdNum = parsePositiveInt(notificationId);
    if (notificationIdNum === null) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    await query(
      `UPDATE admin_notifications
       SET is_read = 'TRUE', read_at = NOW()
       WHERE id = ?`,
      [notificationIdNum]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'mark-notification-read', error);
  }
}

