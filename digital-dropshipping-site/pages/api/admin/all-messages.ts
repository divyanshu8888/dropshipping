import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../src/lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin access (you should add proper auth check here)
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const user = await queryOne<{ role: string }>(
      `SELECT role FROM users WHERE id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!user || user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { projectId, conversationId, limit = '100', offset = '0' } = req.query;
    const limitNum = Math.min(Number.parseInt(String(limit), 10) || 100, 500);
    const offsetNum = Math.max(Number.parseInt(String(offset), 10) || 0, 0);

    let messagesQuery = `
      SELECT 
        m.id,
        m.conversation_id,
        m.project_id,
        m.sender_id,
        m.body,
        m.message_type,
        m.file_path,
        m.file_name,
        m.created_at,
        m.updated_at,
        m.is_read,
        u.email as sender_email,
        u.display_name as sender_name,
        u.role as sender_role,
        c.title as conversation_title,
        p.title as project_title,
        p.client_id,
        p.freelancer_id
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      LEFT JOIN conversations c ON m.conversation_id = c.id
      LEFT JOIN projects p ON m.project_id = p.id
      WHERE m.deleted_at IS NULL
    `;

    const params: any[] = [];

    if (projectId) {
      messagesQuery += ` AND m.project_id = ?`;
      params.push(Number(projectId));
    }

    if (conversationId) {
      messagesQuery += ` AND m.conversation_id = ?`;
      params.push(Number(conversationId));
    }

    messagesQuery += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limitNum, offsetNum);

    const messages = await query(messagesQuery, params);

    // Get milestone descriptions
    const milestonesQuery = `
      SELECT 
        m.id as milestone_id,
        m.title as milestone_title,
        m.description,
        m.status,
        m.created_at,
        m.updated_at,
        c.project_id,
        p.title as project_title,
        p.client_id,
        p.freelancer_id,
        f.user_id as freelancer_user_id,
        u_f.email as freelancer_email,
        u_f.display_name as freelancer_name,
        cl.owner_id as client_user_id,
        u_c.email as client_email,
        u_c.display_name as client_name
      FROM milestones m
      INNER JOIN contracts c ON m.contract_id = c.id
      INNER JOIN projects p ON c.project_id = p.id
      LEFT JOIN freelancers f ON p.freelancer_id = f.id
      LEFT JOIN users u_f ON f.user_id = u_f.id
      LEFT JOIN clients cl ON p.client_id = cl.id
      LEFT JOIN users u_c ON cl.owner_id = u_c.id
      WHERE m.description IS NOT NULL AND m.description != ''
      ORDER BY m.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const milestones = await query(milestonesQuery, [limitNum, offsetNum]);

    // Get total counts
    const messagesCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM messages WHERE deleted_at IS NULL`
    ) || { count: 0 };
    
    const milestonesCount = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM milestones WHERE description IS NOT NULL AND description != ''`
    ) || { count: 0 };

    return res.status(200).json({
      messages: messages || [],
      milestones: milestones || [],
      pagination: {
        messagesTotal: messagesCount?.count || 0,
        milestonesTotal: milestonesCount?.count || 0,
        limit: limitNum,
        offset: offsetNum
      }
    });

  } catch (error) {
    console.error('Error fetching all messages:', error);
    return res.status(500).json({
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

