import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Temporary stub - functionality not implemented yet
  return res.status(501).json({
    error: 'Team member management functionality not implemented yet'
  });
}