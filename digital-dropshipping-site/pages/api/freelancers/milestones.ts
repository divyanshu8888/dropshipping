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
    const { projectId, freelancerId } = req.query;

    if (!projectId || !freelancerId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify the project belongs to this freelancer
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const project = await queryOne<{ id: number; freelancer_id: number }>(
      `SELECT id, freelancer_id FROM projects WHERE id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.freelancer_id !== freelancer.id) {
      return res.status(403).json({ error: 'Not authorized to view milestones for this project' });
    }

    // Find contract for this project
    const contract = await queryOne<{ id: number }>(
      `SELECT id FROM contracts WHERE project_id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!contract) {
      return res.status(200).json({ milestones: [] });
    }

    // Fetch milestones
    const milestones = await query(
      `SELECT m.id, m.contract_id, m.title, m.description, m.amount_cents, m.due_date, m.status, m.sort_order, m.created_at
       FROM milestones m
       WHERE m.contract_id = ?
       ORDER BY m.sort_order ASC, m.created_at ASC`,
      [contract.id]
    );

    // Fetch deliverables for each milestone
    const formattedMilestones = await Promise.all(
      (Array.isArray(milestones) ? milestones : []).map(async (m: any) => {
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
          contract_id: String(m.contract_id),
          title: m.title,
          description: m.description,
          amount_cents: m.amount_cents || 0,
          due_date: m.due_date || null,
          status: m.status || 'pending',
          sort_order: m.sort_order || 1,
          created_at: m.created_at,
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

    return res.status(200).json({ milestones: formattedMilestones });

  } catch (error) {
    console.error('Error fetching milestones:', error);
    return res.status(500).json({
      error: 'Failed to fetch milestones',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

