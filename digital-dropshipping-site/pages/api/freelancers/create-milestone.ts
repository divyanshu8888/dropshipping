import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, title, description, dueDate, freelancerId } = req.body;

    if (!projectId || !title || !freelancerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate for personal info (server-side validation)
    const personalInfoPatterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\$\d+|\d+\s*(dollars?|usd|eur|gbp)/gi, // Price mentions
      /\b(price|cost|fee|charge|payment|invoice)\s*:?\s*\$\d+/gi // Price context
    ];

    const combinedText = `${title} ${description || ''}`.toLowerCase();
    for (const pattern of personalInfoPatterns) {
      if (pattern.test(combinedText)) {
        return res.status(400).json({ 
          error: 'Cannot include personal information (email, phone, price) in milestones' 
        });
      }
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
      return res.status(403).json({ error: 'Not authorized to create milestones for this project' });
    }

    // Find or create a contract for this project
    let contract = await queryOne<{ id: number }>(
      `SELECT id FROM contracts WHERE project_id = ? LIMIT 1`,
      [Number(projectId)]
    );

    if (!contract) {
      // Create a contract if it doesn't exist
      // First, try to find a proposal for this project
      const proposal = await queryOne<{ id: number }>(
        `SELECT id FROM proposals WHERE project_id = ? LIMIT 1`,
        [Number(projectId)]
      );

      if (!proposal) {
        // Create a dummy proposal if none exists (for milestone creation)
        const insertProposal = await query(
          `INSERT INTO proposals (project_id, freelancer_id, status, total_cents, currency, message) 
           VALUES (?, ?, 'accepted', 0, 'USD', 'Auto-created for milestone management')`,
          [Number(projectId), freelancer.id]
        );
        const proposalId = (insertProposal as any).insertId;

        const insertContract = await query(
          `INSERT INTO contracts (project_id, proposal_id, terms) VALUES (?, ?, 'Auto-created contract')`,
          [Number(projectId), proposalId]
        );
        contract = { id: (insertContract as any).insertId };
      } else {
        const insertContract = await query(
          `INSERT INTO contracts (project_id, proposal_id, terms) VALUES (?, ?, 'Auto-created contract')`,
          [Number(projectId), proposal.id]
        );
        contract = { id: (insertContract as any).insertId };
      }
    }

    // Get the highest sort_order for this contract
    const maxSort = await queryOne<{ max_order: number }>(
      `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM milestones WHERE contract_id = ?`,
      [contract.id]
    );

    // Create the milestone
    const result = await query(
      `INSERT INTO milestones (contract_id, title, description, amount_cents, due_date, status, sort_order)
       VALUES (?, ?, ?, 0, ?, 'pending', ?)`,
      [
        contract.id,
        title,
        description || null,
        dueDate || null,
        (maxSort?.max_order || 0) + 1
      ]
    );

    const milestoneId = (result as any).insertId;

    // Fetch the created milestone
    const milestone = await queryOne<Milestone>(
      `SELECT id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at
       FROM milestones WHERE id = ?`,
      [milestoneId]
    );

    return res.status(200).json({ 
      success: true,
      milestone: {
        id: String(milestone?.id),
        contract_id: String(milestone?.contract_id),
        title: milestone?.title,
        description: milestone?.description,
        amount_cents: milestone?.amount_cents || 0,
        due_date: milestone?.due_date || null,
        status: milestone?.status || 'pending',
        sort_order: milestone?.sort_order || 1,
        created_at: milestone?.created_at
      }
    });

  } catch (error) {
    console.error('Error creating milestone:', error);
    return res.status(500).json({
      error: 'Failed to create milestone',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

interface Milestone {
  id: number;
  contract_id: number;
  title: string;
  description: string | null;
  amount_cents: number;
  due_date: string | null;
  status: string;
  sort_order: number;
  created_at: string;
}

