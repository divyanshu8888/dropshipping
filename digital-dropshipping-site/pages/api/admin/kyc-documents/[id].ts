import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, safeExecute } from '../../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid document ID' });
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res, id);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handlePatch(
  req: NextApiRequest,
  res: NextApiResponse,
  id: string
) {
  try {
    const { status, rejection_reason } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    const updates: string[] = ['status = ?', 'reviewed_at = NOW()'];
    const params: any[] = [status];

    if (status === 'rejected' && rejection_reason) {
      updates.push('rejection_reason = ?');
      params.push(rejection_reason);
    } else if (status === 'approved') {
      updates.push('rejection_reason = NULL');
    }

    params.push(id);

    const sql = `UPDATE kyc_documents SET ${updates.join(', ')} WHERE id = ?`;
    const success = await safeExecute(sql, params, 'kyc-document-update');

    if (!success) {
      return res.status(500).json({ error: 'Failed to update KYC document' });
    }

    // Fetch updated document
    const updated = await safeQuery<any>(
      `SELECT * FROM kyc_documents WHERE id = ? LIMIT 1`,
      [id],
      'kyc-document-fetch'
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'Document not found after update' });
    }

    const document = updated[0];
    
    // Auto-verification: Check if all required documents are approved
    if (status === 'approved') {
      try {
        // Get freelancer ID from the document
        const docWithFreelancer = await safeQuery<any>(
          `SELECT freelancer_id FROM kyc_documents WHERE id = ? LIMIT 1`,
          [id],
          'kyc-document-freelancer'
        );
        
        if (docWithFreelancer && docWithFreelancer.length > 0) {
          const freelancerId = docWithFreelancer[0].freelancer_id;
          
          // Required document types for auto-verification
          // At minimum: ID card OR passport, AND proof of address
          const requiredTypes = ['id_card', 'passport', 'drivers_license'];
          const addressProof = 'proof_of_address';
          
          // Check if freelancer has at least one ID document approved
          const idDocs = await safeQuery<any>(
            `SELECT COUNT(*) as count FROM kyc_documents 
             WHERE freelancer_id = ? 
             AND document_type IN (?, ?, ?) 
             AND status = 'approved'`,
            [freelancerId, ...requiredTypes],
            'kyc-check-id'
          );
          
          // Check if proof of address is approved
          const addressDocs = await safeQuery<any>(
            `SELECT COUNT(*) as count FROM kyc_documents 
             WHERE freelancer_id = ? 
             AND document_type = ? 
             AND status = 'approved'`,
            [freelancerId, addressProof],
            'kyc-check-address'
          );
          
          const hasIdDoc = idDocs && idDocs.length > 0 && idDocs[0].count > 0;
          const hasAddressProof = addressDocs && addressDocs.length > 0 && addressDocs[0].count > 0;
          
          // Auto-verify if requirements are met
          if (hasIdDoc && hasAddressProof) {
            await safeExecute(
              `UPDATE freelancers 
               SET verification_state = 'verified', updated_at = NOW() 
               WHERE id = ? AND verification_state != 'verified'`,
              [freelancerId],
              'auto-verify-freelancer'
            );
            console.log(`Auto-verified freelancer ${freelancerId} - all required KYC documents approved`);
          }
        }
      } catch (error: any) {
        // Don't fail the document update if auto-verification fails
        console.error('Error in auto-verification:', error);
      }
    }
    
    const serialized = {
      ...document,
      created_at: document.created_at ? new Date(document.created_at).toISOString() : null,
      reviewed_at: document.reviewed_at ? new Date(document.reviewed_at).toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      document: serialized,
      auto_verified: status === 'approved' // Indicate if auto-verification was attempted
    });
  } catch (error) {
    console.error('Error updating KYC document:', error);
    return res.status(500).json({ error: 'Failed to update KYC document' });
  }
}

