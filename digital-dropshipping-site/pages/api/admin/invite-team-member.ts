import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Temporary stub - functionality not implemented yet
  return res.status(501).json({
    error: 'Team member invitation functionality not implemented yet'
  });
}