import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute, safeQuery } from '../../../src/lib/dbHelpers';

interface FreelancerRow {
  id: number;
  display_name: string;
  status: string;
  rating: number | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const VALID_STATUSES = ['pending', 'approved', 'rejected'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100);
    const offsetNum = parseInt(offset as string, 10) || 0;

    const filters: string[] = [];
    const params: any[] = [];

    if (status && typeof status === 'string' && VALID_STATUSES.includes(status)) {
      filters.push('status = ?');
      params.push(status);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const freelancers = await safeQuery<FreelancerRow>(
      `SELECT *
         FROM freelancers
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      [...params, limitNum, offsetNum],
      'freelancers-list'
    );

    return res.status(200).json({
      freelancers,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: freelancers.length === limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    return res.status(500).json({ error: 'Failed to fetch freelancers' });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, status } = req.body as { id?: number | string; status?: string };

    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields: id, status' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be pending, approved, or rejected' });
    }

    const success = await safeExecute(
      `UPDATE freelancers SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id],
      'freelancers-update'
    );

    if (!success) {
      return res.status(500).json({ error: 'Failed to update freelancer' });
    }

    const updated = await safeQuery<FreelancerRow>(
      `SELECT * FROM freelancers WHERE id = ? LIMIT 1`,
      [id],
      'freelancers-fetch'
    );

    return res.status(200).json({
      success: true,
      freelancer: updated[0] ?? null
    });
  } catch (error) {
    console.error('Error updating freelancer:', error);
    return res.status(500).json({ error: 'Failed to update freelancer' });
  }
}
