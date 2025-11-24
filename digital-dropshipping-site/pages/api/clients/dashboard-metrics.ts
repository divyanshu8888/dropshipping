import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.clientId || req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get client ID from user_id
    const client = await queryOne<{ id: number }>(
      `SELECT id FROM clients WHERE owner_id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!client) {
      return res.status(200).json({
        success: true,
        metrics: {
          totalProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          totalSpent: 0,
          pendingProjects: 0,
          totalMessages: 0,
          unreadMessages: 0
        }
      });
    }

    const clientId = client.id;

    // Fetch project counts
    // Active = all projects that are NOT finished (completed/delivered)
    // Completed = projects that are finished
    const projectStats = await queryOne<{
      total: number;
      active: number;
      completed: number;
      pending: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status NOT IN ('completed', 'delivered') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status IN ('completed', 'delivered') THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('open', 'in_review') THEN 1 ELSE 0 END) as pending
      FROM projects
      WHERE client_id = ?`,
      [clientId]
    );

    // Calculate total spent from released/approved milestones
    const totalSpentResult = await queryOne<{
      totalSpent: number;
    }>(
      `SELECT 
        COALESCE(SUM(m.amount_cents), 0) as totalSpent
      FROM milestones m
      INNER JOIN contracts c ON m.contract_id = c.id
      INNER JOIN projects p ON c.project_id = p.id
      WHERE p.client_id = ?
        AND m.status IN ('released', 'approved')`,
      [clientId]
    );

    // Fetch message counts
    let messageStats = { total: 0, unread: 0 };
    try {
      const projects = await query<{ id: number }>(
        `SELECT id FROM projects WHERE client_id = ?`,
        [clientId]
      );

      if (projects && projects.length > 0) {
        const projectIds = projects.map(p => p.id);
        const placeholders = projectIds.map(() => '?').join(',');
        
        const conversations = await query<{ id: number }>(
          `SELECT id FROM conversations WHERE project_id IN (${placeholders})`,
          projectIds
        );

        if (conversations && conversations.length > 0) {
          const convIds = conversations.map(c => c.id);
          const convPlaceholders = convIds.map(() => '?').join(',');
          
          const messages = await queryOne<{ total: number; unread: number }>(
            `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN is_read = 0 OR is_read = FALSE THEN 1 ELSE 0 END) as unread
            FROM messages
            WHERE conversation_id IN (${convPlaceholders})
            AND sender_id != ?`,
            [...convIds, Number(userId)]
          );

          if (messages) {
            messageStats = {
              total: messages.total || 0,
              unread: messages.unread || 0
            };
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching message stats:', e);
    }

    return res.status(200).json({
      success: true,
      metrics: {
        totalProjects: projectStats?.total || 0,
        activeProjects: projectStats?.active || 0,
        completedProjects: projectStats?.completed || 0,
        totalSpent: totalSpentResult?.totalSpent ? Number(totalSpentResult.totalSpent) / 100 : 0,
        pendingProjects: projectStats?.pending || 0,
        totalMessages: messageStats.total,
        unreadMessages: messageStats.unread
      }
    });

  } catch (error) {
    console.error('Error fetching client dashboard metrics:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

