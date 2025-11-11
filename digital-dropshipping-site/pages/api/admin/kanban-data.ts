import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery } from '../../../src/lib/dbHelpers';

type Project = {
  id: number | string;
  title: string;
  status: string;
  budget: number | null;
  created_at: string | Date;
  client_id?: number | string | null;
  freelancer_id?: number | string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const projects = await safeQuery<Project>(
      `SELECT id, title, status, budget, created_at, client_id, freelancer_id
         FROM projects
         ORDER BY created_at DESC
         LIMIT 200`,
      [],
      'kanban-projects'
    );

    const normalizeStatus = (status: string | null | undefined) => (status || '').toLowerCase();
    const organize = (statuses: string[]) =>
      projects.filter((project) => statuses.includes(normalizeStatus(project.status)));

    const columns = [
      {
        id: 'open',
        title: 'New Requests',
        color: 'bg-green-500',
        cards: organize(['draft', 'open'])
      },
      {
        id: 'review',
        title: 'Quotes Under Review',
        color: 'bg-yellow-500',
        cards: organize(['in_review'])
      },
      {
        id: 'assigned',
        title: 'SOW Signed',
        color: 'bg-blue-500',
        cards: organize(['contracted'])
      },
      {
        id: 'in_progress',
        title: 'In Delivery',
        color: 'bg-purple-500',
        cards: organize(['in_progress', 'delivered'])
      },
      {
        id: 'completed',
        title: 'Completed',
        color: 'bg-gray-500',
        cards: organize(['completed'])
      }
    ];

    return res.status(200).json({
      success: true,
      columns,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return res.status(500).json({
      error: 'Failed to fetch kanban data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
