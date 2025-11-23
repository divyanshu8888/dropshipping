import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Check file existence for each document and filter out missing files
    const documentsWithFileCheck = await Promise.all(
      documents.map(async (doc: any) => {
        const exists = await fileExists(doc.file_path);
        return { ...doc, file_exists: exists };
      })
    );
    
    // Filter out documents where file doesn't exist
    const validDocuments = documentsWithFileCheck.filter((doc: any) => doc.file_exists);

    const serialized = validDocuments.map((doc: any) => {
      const { file_exists, ...docWithoutExists } = doc;
      return {
        ...docWithoutExists,
        created_at: doc.created_at ? new Date(doc.created_at).toISOString() : null,
        updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : null,
        reviewed_at: doc.reviewed_at ? new Date(doc.reviewed_at).toISOString() : null,
      };
    });

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

