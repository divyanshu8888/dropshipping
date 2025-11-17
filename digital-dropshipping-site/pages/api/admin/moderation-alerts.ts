import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../src/lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '50', offset = '0', severity, isRead, type } = req.query;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (severity) {
      whereConditions.push('severity = ?');
      params.push(severity);
    }

    if (isRead !== undefined) {
      whereConditions.push('is_read = ?');
      params.push(isRead === 'true' ? 'TRUE' : 'FALSE');
    }

    if (type) {
      whereConditions.push('type = ?');
      params.push(type);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const notifications = await query(
      `SELECT 
        id,
        type,
        title,
        message,
        metadata,
        user_id,
        project_id,
        severity,
        is_read,
        read_at,
        created_at
      FROM admin_notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const total = await query(
      `SELECT COUNT(*) as count FROM admin_notifications ${whereClause}`,
      params
    );

    return res.status(200).json({
      success: true,
      notifications: Array.isArray(notifications) ? notifications : [],
      total: Array.isArray(total) && total.length > 0 ? (total[0] as any).count : 0
    });

  } catch (error) {
    console.error('Error fetching moderation alerts:', error);
    return res.status(500).json({
      error: 'Failed to fetch moderation alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

