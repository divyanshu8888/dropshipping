import { NextApiRequest, NextApiResponse } from 'next';
import { verifyUserSession } from '../../../src/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authResult = await verifyUserSession(req);
    
    // Always return 200 to avoid clearing client state during local/dev outages.
    // The client can decide what to do based on 'success' flag.
    if (!authResult.success) {
      return res.status(200).json({ success: false, error: authResult.error });
    }

    return res.status(200).json({ 
      success: true, 
      user: authResult.user 
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
