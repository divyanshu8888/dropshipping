import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../src/lib/mysql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function handleGet(res: NextApiResponse) {
  try {
    const workRequests = await query(`
      SELECT
        p.*,
        c.id AS client_id,
        c.contact_name AS client_contact_name,
        f.id AS freelancer_id,
        f.display_name AS freelancer_display_name,
        f.rating AS freelancer_rating
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN freelancers f ON f.id = p.freelancer_id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);

    return res.status(200).json(workRequests || []);
  } catch (error) {
    console.error('Error fetching work requests:', error);
    return res.status(500).json({ message: 'Error fetching work requests' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, description, budget, deadline, client_id, freelancer_id, created_by } = req.body;

    if (!title || !client_id) {
      return res.status(400).json({ message: 'Title and client_id are required' });
    }

    const client = await queryOne<{ id: number; owner_id: number }>(
      'SELECT id, owner_id FROM clients WHERE id = ? LIMIT 1',
      [Number(client_id)]
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const budgetCents = budget ? Math.round(Number(budget) * 100) : null;
    const createdBy = created_by ? Number(created_by) : client.owner_id;

    const result = await query(
      `INSERT INTO projects
        (client_id, freelancer_id, created_by, title, description, budget_cents, budget, status, deadline, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, NOW(), NOW())`,
      [
        client.id,
        freelancer_id ? Number(freelancer_id) : null,
        createdBy,
        title,
        description || null,
        budgetCents,
        budget ? Math.round(Number(budget)) : null,
        deadline || null,
      ]
    );

    const insertId = (result as any).insertId;
    const workRequest = await queryOne('SELECT * FROM projects WHERE id = ? LIMIT 1', [insertId]);

    return res.status(201).json(workRequest);
  } catch (error) {
    console.error('Error creating work request:', error);
    return res.status(500).json({ message: 'Error creating work request' });
  }
}
