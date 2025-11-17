import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../src/lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    await query(
      `UPDATE admin_notifications 
       SET is_read = 'TRUE', read_at = NOW() 
       WHERE id = ?`,
      [Number(notificationId)]
    );

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      error: 'Failed to mark notification as read',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

