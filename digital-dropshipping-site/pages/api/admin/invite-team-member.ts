import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  // Temporary stub - functionality not implemented yet
  return res.status(501).json({
    error: 'Team member invitation functionality not implemented yet'
  });
}