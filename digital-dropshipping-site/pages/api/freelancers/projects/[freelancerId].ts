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
        [Number(freelancerId)]
      );
    } catch (dbErr: any) {
      // If table doesn't exist in dev, return empty list rather than 500
      if (dbErr?.code === 'ER_NO_SUCH_TABLE') {
        rows = [];
      } else {
        throw dbErr;
      }
    }

    const transformedProjects = rows.map((p) => ({
      id: p.id,
      title: p.title,
      client: p.client_name || 'Unknown Client',
      clientEmail: p.client_email || '',
      status: p.status,
      budget: p.budget ?? null,
      deadline: p.deadline ?? null,
      description: p.description ?? null,
      createdAt: p.created_at,
      progress: 0,
      messages: [],
      deliverables: []
    }));

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
