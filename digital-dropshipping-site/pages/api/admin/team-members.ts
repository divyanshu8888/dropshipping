import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  // Temporary stub - functionality not implemented yet
  return res.status(501).json({
    error: 'Team member management functionality not implemented yet'
  });
}