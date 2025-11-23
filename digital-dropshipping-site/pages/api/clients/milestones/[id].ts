import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../../src/lib/mysql';

// Valid milestone statuses
const VALID_STATUSES = ['pending', 'funded', 'in_progress', 'submitted', 'approved', 'released', 'rejected'];

// Statuses that clients can set (clients can edit to any valid status)
const CLIENT_ALLOWED_STATUSES = VALID_STATUSES;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user info - check if user is a client
    const user = await queryOne<{ id: number; role: string }>(
      `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
      [Number(userId)]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Only clients can update milestone status' });
    }

    // Get client ID from user_id (clients table has owner_id that references users)
    const client = await queryOne<{ id: number }>(
      `SELECT id FROM clients WHERE owner_id = ? LIMIT 1`,
      [user.id]
    );

    if (!client) {
      return res.status(403).json({ error: 'Client record not found' });
    }

    const clientId = client.id;

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Milestone ID is required' });
    }

    const milestoneId = Number.parseInt(id, 10);
    if (Number.isNaN(milestoneId)) {
      return res.status(400).json({ error: 'Invalid milestone ID' });
    }

    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Check if client is allowed to set this status
    if (!CLIENT_ALLOWED_STATUSES.includes(status)) {
      return res.status(403).json({ error: `Clients can only set status to: ${CLIENT_ALLOWED_STATUSES.join(' or ')}` });
    }

    // Get the milestone and verify it belongs to a project owned by this client
    const milestone = await queryOne<{
      id: number;
      contract_id: number;
      status: string;
      project_id: number;
      client_id: number;
    }>(
      `SELECT m.id, m.contract_id, m.status, c.project_id, p.client_id
       FROM milestones m
       INNER JOIN contracts c ON m.contract_id = c.id
       INNER JOIN projects p ON c.project_id = p.id
       WHERE m.id = ? AND p.client_id = ?`,
      [milestoneId, clientId]
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found or you do not have permission to update it' });
    }

    // Clients can change milestone status to any valid status
    // No restrictions on status transitions for clients

    // Update the milestone status
    await query(
      `UPDATE milestones 
       SET status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, milestoneId]
    );

    // Get updated milestone
    const updatedMilestone = await queryOne<{
      id: number;
      contract_id: number;
      title: string;
      description: string | null;
      amount_cents: number;
      due_date: string | null;
      status: string;
      sort_order: number;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, contract_id, title, description, amount_cents, due_date, status, sort_order, created_at, updated_at
       FROM milestones
       WHERE id = ?`,
      [milestoneId]
    );

    return res.status(200).json({
      success: true,
      milestone: updatedMilestone
    });

  } catch (error: any) {
    console.error('Error updating milestone status:', error);
    return res.status(500).json({ 
      error: 'Failed to update milestone status',
      details: error.message 
    });
  }
}

