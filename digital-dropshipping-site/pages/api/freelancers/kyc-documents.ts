import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session (simplified - you may need to add proper auth)
    const userId = req.query.userId || req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get freelancer ID from user_id
    const freelancer = await query<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!freelancer || freelancer.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerId = freelancer[0].id;

    // Fetch KYC documents
    const documents = await query<any>(
      `SELECT * FROM kyc_documents 
       WHERE freelancer_id = ? 
       ORDER BY created_at DESC`,
      [freelancerId]
    );

    const serialized = documents.map((doc: any) => ({
      ...doc,
      created_at: doc.created_at ? new Date(doc.created_at).toISOString() : null,
      updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : null,
      reviewed_at: doc.reviewed_at ? new Date(doc.reviewed_at).toISOString() : null,
    }));

    return res.status(200).json({
      success: true,
      documents: serialized
    });
  } catch (error: any) {
    console.error('Error fetching KYC documents:', error);
    return res.status(500).json({
      error: 'Failed to fetch KYC documents',
      details: error.message
    });
  }
}

