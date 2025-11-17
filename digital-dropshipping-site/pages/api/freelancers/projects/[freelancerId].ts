import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { freelancerId } = req.query;

    if (!freelancerId) {
      return res.status(400).json({ error: 'Freelancer ID is required' });
    }

    // Get freelancer database ID from user_id
    const freelancer = await query<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer || freelancer.length === 0) {
      return res.status(200).json({ success: true, projects: [] });
    }

    const freelancerDbId = freelancer[0].id;

    // Attempt MySQL fallback (no Supabase)
    let rows: any[] = [];
    try {
      rows = await query<any>(
        `
          SELECT
            p.id,
            p.title,
            p.description,
            COALESCE(p.budget_cents, p.budget) AS budget,
            p.deadline,
            p.status,
            p.created_at,
            c.display_name AS client_name,
            c.contact_email AS client_email
          FROM projects p
          LEFT JOIN clients c ON c.id = p.client_id
          WHERE p.freelancer_id = ?
          ORDER BY p.created_at DESC
          LIMIT 50
        `,
        [freelancerDbId]
      );
    } catch (dbErr: any) {
      // If table doesn't exist in dev, return empty list rather than 500
      if (dbErr?.code === 'ER_NO_SUCH_TABLE') {
        rows = [];
      } else {
        throw dbErr;
      }
    }

    // Fetch messages and deliverables for each project
    const transformedProjects = await Promise.all(
      rows.map(async (p) => {
        // Fetch messages from conversations
        let messages: any[] = [];
        try {
          const conversations = await query<{ id: number }>(
            `SELECT id FROM conversations WHERE project_id = ? LIMIT 1`,
            [p.id]
          );
          
          if (conversations && conversations.length > 0) {
            const convId = conversations[0].id;
            messages = await query<any>(
              `SELECT 
                m.id,
                m.body AS content,
                m.created_at AS timestamp,
                m.is_read,
                u.id AS sender_user_id,
                CASE WHEN u.id = ? THEN 'freelancer' ELSE 'client' END AS sender
              FROM messages m
              JOIN users u ON u.id = m.sender_id
              WHERE m.conversation_id = ?
              ORDER BY m.created_at ASC`,
              [Number(freelancerId), convId]
            );
          }
        } catch (e) {
          console.warn('Error fetching messages:', e);
        }

        // Fetch deliverables
        let deliverables: any[] = [];
        try {
          deliverables = await query<any>(
            `SELECT 
              d.id,
              d.title AS name,
              d.description,
              d.file_path AS url,
              d.submitted_at AS uploadedAt,
              CASE 
                WHEN d.file_path LIKE '%.js' OR d.file_path LIKE '%.ts' OR d.file_path LIKE '%.py' THEN 'code'
                WHEN d.file_path LIKE '%.pdf' OR d.file_path LIKE '%.doc%' THEN 'document'
                WHEN d.file_path LIKE '%.jpg' OR d.file_path LIKE '%.png' OR d.file_path LIKE '%.gif' THEN 'image'
                WHEN d.file_path LIKE '%.mp4' OR d.file_path LIKE '%.mov' THEN 'video'
                ELSE 'document'
              END AS type
            FROM deliverables d
            WHERE d.project_id = ?
            ORDER BY d.submitted_at DESC`,
            [p.id]
          );
        } catch (e) {
          console.warn('Error fetching deliverables:', e);
        }

        // Calculate progress based on milestones or deliverables
        let progress = 0;
        try {
          const contract = await query<{ id: number }>(
            `SELECT id FROM contracts WHERE project_id = ? LIMIT 1`,
            [p.id]
          );
          if (contract && contract.length > 0) {
            const milestones = await query<{ status: string; count: number }>(
              `SELECT 
                status,
                COUNT(*) as count
              FROM milestones
              WHERE contract_id = ?
              GROUP BY status`,
              [contract[0].id]
            );
            const total = milestones.reduce((sum, m) => sum + m.count, 0);
            const completed = milestones
              .filter(m => ['approved', 'released'].includes(m.status))
              .reduce((sum, m) => sum + m.count, 0);
            progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          }
        } catch (e) {
          console.warn('Error calculating progress:', e);
        }

        return {
          id: String(p.id),
          title: p.title,
          client: p.client_name || 'Unknown Client',
          clientEmail: p.client_email || '',
          status: p.status,
          budget: p.budget ? Number(p.budget) / 100 : null,
          deadline: p.deadline ? new Date(p.deadline).toISOString() : null,
          description: p.description ?? null,
          createdAt: new Date(p.created_at).toISOString(),
          progress,
            messages: messages.map(m => ({
            id: String(m.id),
            sender: m.sender,
            content: m.content || m.body || '',
            timestamp: new Date(m.timestamp).toISOString(),
            read: m.is_read === 'TRUE'
          })),
          deliverables: deliverables.map(d => ({
            id: String(d.id),
            name: d.name,
            type: d.type,
            url: d.url,
            uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toISOString() : new Date().toISOString(),
            description: d.description || ''
          }))
        };
      })
    );

    return res.status(200).json({
      success: true,
      projects: transformedProjects
    });

  } catch (error) {
    console.error('Error fetching freelancer projects:', error);
    return res.status(500).json({
      error: 'Failed to fetch freelancer projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
