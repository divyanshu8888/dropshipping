import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../src/lib/mysql';
import { requireAuth, internalError } from '../../src/lib/apiAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Why: this listing exposes client contact details and POST creates projects; require a session.
  const user = await requireAuth(req, res);
  if (!user) return;

  if (req.method === 'GET') {
    return handleGet(res);
  }

  return handlePost(req, res, user.id);
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
    return internalError(res, 'work-requests/get', error);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
    // Why: body created_by is ignored; the creator is the session user.
    const { title, description, budget, deadline, client_id, freelancer_id } = req.body;

    if (!title || !client_id) {
      return res.status(400).json({ message: 'Title and client_id are required' });
    }

    // Why: ownership check — projects may only be created under a client the session user owns.
    const client = await queryOne<{ id: number; owner_id: number }>(
      'SELECT id, owner_id FROM clients WHERE id = ? AND owner_id = ? LIMIT 1',
      [Number(client_id), userId]
    );

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const budgetCents = budget ? Math.round(Number(budget) * 100) : null;
    const createdBy = userId;

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
    return internalError(res, 'work-requests/post', error);
  }
}
