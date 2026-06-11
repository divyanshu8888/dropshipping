import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { template10k } from '../../../src/lib/milestoneTemplates';
import { guardMessage } from '../../../src/lib/moderation/contactGuard';
import { requireRole, internalError } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity must come from the session cookie; body freelancerId is ignored.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  try {
    const { projectId, title, description, dueDate } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate for confidential information using contact guard
    const combinedText = `${title} ${description || ''}`;
    const guardResult = guardMessage(combinedText);
    
    if (!guardResult.allowed) {
      // Check if this is a pricing/payment violation
      const isPricingViolation = guardResult.reasons.some(reason => 
        reason.toLowerCase().includes('payment') || 
        reason.toLowerCase().includes('bank') ||
        reason.toLowerCase().includes('price') ||
        reason.toLowerCase().includes('cost') ||
        reason.toLowerCase().includes('fee')
      );

      const errorMessage = isPricingViolation
        ? 'Payment information cannot be included in milestones. For your security and protection, all payments must be processed through Unitiv\'s secure payment system.'
        : 'For safety, milestones cannot contain phone numbers, email addresses, external links, or personal contact details.';

      return res.status(400).json({ 
        error: errorMessage,
        reasons: guardResult.reasons,
        detectedContent: guardResult.detectedContent,
        violationType: isPricingViolation ? 'pricing_payment' : 'contact_info'
      });
    }

    // Verify the project belongs to this freelancer (resolved from the session user)
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [user.id]
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

    const nextSortOrder = (maxSort?.max_order || 0) + 1;
    
    // Use fixed milestone names and descriptions from template10k (only 5 milestones allowed)
    const milestoneTemplate = template10k.milestones[nextSortOrder - 1];
    let milestoneTitle = title;
    let milestoneDescription = description;
    
    // If sort_order is 1-5, use fixed title and default description from template
    if (nextSortOrder <= 5 && milestoneTemplate) {
      milestoneTitle = milestoneTemplate.title;
      // Use provided description if given, otherwise use template default
      milestoneDescription = description || milestoneTemplate.description;
    } else if (nextSortOrder > 5) {
      return res.status(400).json({ 
        error: 'Maximum 5 milestones allowed per project. Please use the standard milestone structure.' 
      });
    }

    // Create the milestone
    const result = await query(
      `INSERT INTO milestones (contract_id, title, description, amount_cents, due_date, status, sort_order)
       VALUES (?, ?, ?, 0, ?, 'pending', ?)`,
      [
        contract.id,
        milestoneTitle,
        milestoneDescription || null,
        dueDate || null,
        nextSortOrder
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
    return internalError(res, 'freelancers/create-milestone', error);
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

