import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute, safeQuery } from '../../../src/lib/dbHelpers';
import { promises as fs } from 'fs';
import path from 'path';

interface FreelancerRow {
  id: number;
  display_name: string;
  status: string;
  verification_state?: string | null;
  rating: number | null;
  created_at: string | Date;
  updated_at: string | Date;
}

const VALID_STATUSES = ['pending', 'approved', 'rejected'];

// Helper function to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    // Handle both relative paths (starting with /uploads) and absolute paths
    let fullPath: string;
    if (filePath.startsWith('/uploads')) {
      // Relative path from public folder
      fullPath = path.join(process.cwd(), 'public', filePath);
    } else if (filePath.startsWith('http')) {
      // External URL, assume it exists
      return true;
    } else {
      // Assume it's a relative path
      fullPath = path.join(process.cwd(), 'public', filePath.startsWith('/') ? filePath.substring(1) : filePath);
    }
    
    // Normalize path separators for Windows
    fullPath = fullPath.replace(/\//g, path.sep).replace(/\\/g, path.sep);
    
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

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
    const limitNum = Math.min(Number.parseInt(String(limit), 10) || 50, 100);
    const offsetNum = Math.max(Number.parseInt(String(offset), 10) || 0, 0);

    const filters: string[] = [];
    const params: any[] = [];

    if (status && typeof status === 'string' && VALID_STATUSES.includes(status)) {
      filters.push('f.status = ?');
      params.push(status);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    // First, fetch freelancers
    const sql = `SELECT 
                   f.*
                 FROM freelancers f
                 ${whereClause}
                 ORDER BY f.created_at DESC
                 LIMIT ${limitNum} OFFSET ${offsetNum}`;

    const freelancers = await safeQuery<FreelancerRow>(sql, params, 'freelancers-list');

    // Fetch all KYC documents for these freelancers
    const freelancerIds = freelancers.map(f => f.id);
    let kycDocumentsByFreelancer: Record<number, any[]> = {};
    
    if (freelancerIds.length > 0) {
      try {
        const placeholders = freelancerIds.map(() => '?').join(',');
        const kycDocs = await safeQuery<any>(
          `SELECT id, freelancer_id, file_path 
           FROM kyc_documents 
           WHERE freelancer_id IN (${placeholders})`,
          freelancerIds,
          'kyc-documents-for-freelancers'
        );

        // Check file existence for each document and group by freelancer_id
        const documentsWithFileCheck = await Promise.all(
          kycDocs.map(async (doc: any) => {
            const exists = await fileExists(doc.file_path);
            return { ...doc, file_exists: exists };
          })
        );

        // Group by freelancer_id and count only existing files
        documentsWithFileCheck.forEach((doc: any) => {
          if (doc.file_exists) {
            if (!kycDocumentsByFreelancer[doc.freelancer_id]) {
              kycDocumentsByFreelancer[doc.freelancer_id] = [];
            }
            kycDocumentsByFreelancer[doc.freelancer_id].push(doc);
          }
        });
      } catch (error: any) {
        // If table doesn't exist, that's okay - just use empty counts
        if (error?.code !== 'ER_NO_SUCH_TABLE') {
          console.error('Error fetching KYC documents:', error);
        }
      }
    }

    // Add kyc_document_count to each freelancer
    const freelancersWithCounts = freelancers.map(f => ({
      ...f,
      kyc_document_count: kycDocumentsByFreelancer[f.id]?.length || 0
    }));

    return res.status(200).json({
      freelancers: freelancersWithCounts,
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
