import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, safeExecute } from '../../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid freelancer ID' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    // Fetch freelancer with user email
    const freelancers = await safeQuery<any>(
      `SELECT f.*, u.email 
       FROM freelancers f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id = ? 
       LIMIT 1`,
      [id],
      'freelancer-detail'
    );

    if (!freelancers || freelancers.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancer = freelancers[0];
    
    // Fetch KYC documents
    let kycDocuments: any[] = [];
    try {
      kycDocuments = await safeQuery<any>(
        `SELECT id, document_type, document_name, file_path, file_size, mime_type, 
                status, reviewed_at, rejection_reason, created_at
         FROM kyc_documents
         WHERE freelancer_id = ?
         ORDER BY created_at DESC`,
        [id],
        'kyc-documents'
      );
    } catch (error: any) {
      // If table doesn't exist, that's okay - just return empty array
      if (error?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching KYC documents:', error);
      }
    }
    
    // Serialize dates
    const serialized = {
      ...freelancer,
      created_at: freelancer.created_at ? new Date(freelancer.created_at).toISOString() : null,
      updated_at: freelancer.updated_at ? new Date(freelancer.updated_at).toISOString() : null,
      kyc_documents: kycDocuments.map((doc: any) => ({
        ...doc,
        created_at: doc.created_at ? new Date(doc.created_at).toISOString() : null,
        reviewed_at: doc.reviewed_at ? new Date(doc.reviewed_at).toISOString() : null,
      })),
    };

    return res.status(200).json({ freelancer: serialized });
  } catch (error) {
    console.error('Error fetching freelancer:', error);
    return res.status(500).json({ error: 'Failed to fetch freelancer' });
  }
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const { verification_state, status } = req.body;

    const updates: string[] = [];
    const params: any[] = [];

    if (verification_state !== undefined) {
      const validStates = ['verified', 'unverified', 'pending', 'rejected'];
      if (validStates.includes(verification_state)) {
        updates.push('verification_state = ?');
        params.push(verification_state);
      }
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (validStatuses.includes(status)) {
        updates.push('status = ?');
        params.push(status);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    const sql = `UPDATE freelancers SET ${updates.join(', ')} WHERE id = ?`;
    const success = await safeExecute(sql, params, 'freelancer-update');

    if (!success) {
      return res.status(500).json({ error: 'Failed to update freelancer' });
    }

    // Fetch updated freelancer
    const updated = await safeQuery<any>(
      `SELECT f.*, u.email 
       FROM freelancers f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id = ? 
       LIMIT 1`,
      [id],
      'freelancer-fetch'
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found after update' });
    }

    const freelancer = updated[0];
    const serialized = {
      ...freelancer,
      created_at: freelancer.created_at ? new Date(freelancer.created_at).toISOString() : null,
      updated_at: freelancer.updated_at ? new Date(freelancer.updated_at).toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      freelancer: serialized
    });
  } catch (error) {
    console.error('Error updating freelancer:', error);
    return res.status(500).json({ error: 'Failed to update freelancer' });
  }
}

