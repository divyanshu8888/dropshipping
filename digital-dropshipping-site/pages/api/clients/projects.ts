import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get client ID from user_id
    const client = await queryOne<{ id: number }>(
      `SELECT id FROM clients WHERE owner_id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!client) {
      return res.status(200).json({ success: true, projects: [] });
    }

    const clientId = client.id;

    // Fetch projects for this client
    let rows: any[] = [];
    try {
      rows = await query<any>(
        `
          SELECT
            p.id,
            p.title,
            p.description,
            COALESCE(p.budget_cents, p.budget) AS budget,
            p.currency,
            p.deadline,
            p.status,
            p.created_at,
            p.started_at,
            p.completed_at,
            f.id AS freelancer_id,
            f.display_name AS freelancer_name,
            f.rating AS freelancer_rating
          FROM projects p
          LEFT JOIN freelancers f ON f.id = p.freelancer_id
          WHERE p.client_id = ?
          ORDER BY p.created_at DESC
          LIMIT 100
        `,
        [clientId]
      );
    } catch (dbErr: any) {
      if (dbErr?.code === 'ER_NO_SUCH_TABLE') {
        rows = [];
      } else {
        throw dbErr;
      }
    }

    // Fetch messages and milestones for each project
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
                m.message_type,
                u.id AS sender_user_id,
                CASE WHEN u.id = ? THEN 'client' ELSE 'freelancer' END AS sender
              FROM messages m
              JOIN users u ON u.id = m.sender_id
              WHERE m.conversation_id = ?
              ORDER BY m.created_at ASC`,
              [Number(userId), convId]
            );
          }
        } catch (e) {
          console.warn('Error fetching messages:', e);
        }

        // Fetch milestones
        let milestones: any[] = [];
        let progress = 0;
        try {
          const contract = await queryOne<{ id: number }>(
            `SELECT id FROM contracts WHERE project_id = ? LIMIT 1`,
            [p.id]
          );
          if (contract) {
            const milestoneRows = await query<any>(
              `SELECT 
                m.id,
                m.title,
                m.description,
                m.amount_cents,
                m.due_date,
                m.status,
                m.sort_order
              FROM milestones m
              WHERE m.contract_id = ?
              ORDER BY m.sort_order ASC, m.created_at ASC`,
              [contract.id]
            );
            
            // Fetch deliverables for each milestone
            milestones = await Promise.all(
              (Array.isArray(milestoneRows) ? milestoneRows : []).map(async (m: any) => {
                // Fetch deliverables for this milestone
                const deliverables = await query(
                  `SELECT 
                    d.id,
                    d.title AS name,
                    d.description,
                    d.file_path AS url,
                    d.submitted_at AS uploadedAt,
                    CASE 
                      WHEN d.file_path LIKE '%.js' OR d.file_path LIKE '%.ts' OR d.file_path LIKE '%.jsx' OR d.file_path LIKE '%.tsx' OR d.file_path LIKE '%.py' OR d.file_path LIKE '%.java' OR d.file_path LIKE '%.cpp' OR d.file_path LIKE '%.c' THEN 'code'
                      WHEN d.file_path LIKE '%.pdf' OR d.file_path LIKE '%.doc%' OR d.file_path LIKE '%.txt' THEN 'document'
                      WHEN d.file_path LIKE '%.jpg' OR d.file_path LIKE '%.png' OR d.file_path LIKE '%.gif' THEN 'image'
                      WHEN d.file_path LIKE '%.mp4' OR d.file_path LIKE '%.mov' THEN 'video'
                      ELSE 'document'
                    END AS type
                  FROM deliverables d
                  WHERE d.milestone_id = ?
                  ORDER BY d.submitted_at DESC`,
                  [m.id]
                );

                return {
                  id: String(m.id),
                  title: m.title,
                  description: m.description,
                  amount_cents: m.amount_cents || 0,
                  due_date: m.due_date || null,
                  status: m.status || 'pending',
                  sort_order: m.sort_order || 1,
                  deliverables: (Array.isArray(deliverables) ? deliverables : []).map((d: any) => ({
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

            // Calculate progress
            const total = milestones.length;
            const completed = milestones.filter(m => ['approved', 'released'].includes(m.status)).length;
            progress = total > 0 ? Math.round((completed / total) * 100) : 0;
          }
        } catch (e) {
          console.warn('Error fetching milestones:', e);
        }

        return {
          id: String(p.id),
          title: p.title,
          freelancer: p.freelancer_name || null,
          freelancerId: p.freelancer_id ? String(p.freelancer_id) : null,
          freelancerRating: p.freelancer_rating || null,
          status: p.status,
          budget: p.budget ? Number(p.budget) / 100 : null,
          currency: p.currency || 'AUD',
          deadline: p.deadline ? new Date(p.deadline).toISOString() : null,
          description: p.description ?? null,
          createdAt: new Date(p.created_at).toISOString(),
          startedAt: p.started_at ? new Date(p.started_at).toISOString() : null,
          completedAt: p.completed_at ? new Date(p.completed_at).toISOString() : null,
          progress,
          milestones,
          messages: messages.map(m => ({
            id: String(m.id),
            sender: m.sender,
            content: m.content || m.body || '',
            timestamp: new Date(m.timestamp).toISOString(),
            read: m.is_read === 1 || m.is_read === 'TRUE',
            messageType: m.message_type || 'text'
          }))
        };
      })
    );

    return res.status(200).json({
      success: true,
      projects: transformedProjects
    });

  } catch (error) {
    console.error('Error fetching client projects:', error);
    return res.status(500).json({
      error: 'Failed to fetch client projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || req.body.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, budget, currency = 'AUD', deadline, freelancerId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Get client ID from user_id
    const client = await queryOne<{ id: number }>(
      `SELECT id FROM clients WHERE owner_id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const clientId = client.id;
    const budgetCents = budget ? Math.round(budget * 100) : null;

    // Create project
    const result = await query(
      `INSERT INTO projects 
       (client_id, created_by, freelancer_id, title, description, budget_cents, budget, currency, status, deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())`,
      [
        clientId,
        Number(userId),
        freelancerId ? Number(freelancerId) : null,
        title,
        description || null,
        budgetCents,
        budget || null,
        currency,
        deadline || null
      ]
    );

    const insertId = (result as any).insertId;
    const project = await queryOne<any>(
      `SELECT 
        p.id,
        p.title,
        p.description,
        COALESCE(p.budget_cents, p.budget) AS budget,
        p.currency,
        p.deadline,
        p.status,
        p.created_at
      FROM projects p
      WHERE p.id = ?`,
      [insertId]
    );

    return res.status(201).json({
      success: true,
      project: {
        id: String(project.id),
        title: project.title,
        description: project.description,
        budget: project.budget ? Number(project.budget) / 100 : null,
        currency: project.currency,
        deadline: project.deadline ? new Date(project.deadline).toISOString() : null,
        status: project.status,
        createdAt: new Date(project.created_at).toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

