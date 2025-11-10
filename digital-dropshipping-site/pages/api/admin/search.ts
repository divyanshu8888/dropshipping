import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery } from '../../../src/lib/dbHelpers';

type SearchResult = {
  id: number | string;
  type: string;
  description: string;
  created_at: string | Date;
};

function like(term: string) {
  return `%${term.toLowerCase()}%`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const term = q.trim();
    if (!term) {
      return res.status(200).json({ success: true, results: [] });
    }

    const pattern = like(term);

    const [users, orders, projects, services, disputes] = await Promise.all([
      safeQuery<{ id: number; email: string; role: string; created_at: Date | string }>(
        `SELECT id, email, role, created_at
           FROM users
          WHERE LOWER(email) LIKE ? OR LOWER(role) LIKE ?
          ORDER BY created_at DESC
          LIMIT 5`,
        [pattern, pattern],
        'search-users'
      ),
      safeQuery<{ id: number; status: string; total_amount: number; created_at: Date | string }>(
        `SELECT id, status, total_amount, created_at
           FROM orders
          WHERE LOWER(status) LIKE ? OR CAST(id AS CHAR) LIKE ?
          ORDER BY created_at DESC
          LIMIT 5`,
        [pattern, pattern],
        'search-orders'
      ),
      safeQuery<{ id: number; title: string; status: string; budget: number; created_at: Date | string }>(
        `SELECT id, title, status, budget, created_at
           FROM projects
          WHERE LOWER(title) LIKE ? OR LOWER(status) LIKE ?
          ORDER BY created_at DESC
          LIMIT 5`,
        [pattern, pattern],
        'search-projects'
      ),
      safeQuery<{ id: number; title: string; price: number; status: string; created_at: Date | string }>(
        `SELECT id, title, price, status, created_at
           FROM freelancer_services
          WHERE LOWER(title) LIKE ? OR LOWER(status) LIKE ?
          ORDER BY created_at DESC
          LIMIT 5`,
        [pattern, pattern],
        'search-services'
      ),
      safeQuery<{ id: number; status: string; reason: string; created_at: Date | string }>(
        `SELECT id, status, reason, created_at
           FROM disputes
          WHERE LOWER(status) LIKE ? OR LOWER(reason) LIKE ?
          ORDER BY created_at DESC
          LIMIT 5`,
        [pattern, pattern],
        'search-disputes'
      )
    ]);

    const results: SearchResult[] = [];

    users.forEach((user) => {
      results.push({
        id: user.id,
        type: 'user',
        description: `${user.role} - ${user.email}`,
        created_at: user.created_at
      });
    });

    orders.forEach((order) => {
      results.push({
        id: order.id,
        type: 'order',
        description: `$${order.total_amount} - ${order.status}`,
        created_at: order.created_at
      });
    });

    projects.forEach((project) => {
      results.push({
        id: project.id,
        type: 'project',
        description: `${project.title} - $${project.budget ?? 0}`,
        created_at: project.created_at
      });
    });

    services.forEach((service) => {
      results.push({
        id: service.id,
        type: 'service',
        description: `${service.title} - $${service.price ?? 0}`,
        created_at: service.created_at
      });
    });

    disputes.forEach((dispute) => {
      results.push({
        id: dispute.id,
        type: 'dispute',
        description: `${dispute.reason} - ${dispute.status}`,
        created_at: dispute.created_at
      });
    });

    results.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return res.status(200).json({
      success: true,
      results: results.slice(0, 10)
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
