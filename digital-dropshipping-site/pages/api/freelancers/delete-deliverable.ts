import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { unlink } from 'fs/promises';
import { join, sep } from 'path';
import { existsSync } from 'fs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse body - could be in req.body or need to read it
    let body;
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    const { deliverableId, projectId, freelancerId } = body;

    if (!deliverableId || !projectId || !freelancerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the deliverable belongs to this freelancer's project
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const deliverable = await queryOne<{ project_id: number; file_path: string | null }>(
      `SELECT project_id, file_path FROM deliverables WHERE id = ? LIMIT 1`,
      [Number(deliverableId)]
    );

    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found' });
    }

    const project = await queryOne<{ freelancer_id: number }>(
      `SELECT freelancer_id FROM projects WHERE id = ? LIMIT 1`,
      [deliverable.project_id]
    );

    if (!project || project.freelancer_id !== freelancer.id) {
      return res.status(403).json({ error: 'Not authorized to delete this deliverable' });
    }

    // Delete the file from disk if it exists
    if (deliverable.file_path) {
      try {
        // Handle both absolute paths and relative paths
        // Paths are stored as: /uploads/milestones/freelancerId={id}/clientId={id}/projectName/filename
        let filePath: string;
        if (deliverable.file_path.startsWith('/')) {
          // Remove leading slash and join with public
          const relativePath = deliverable.file_path.substring(1);
          filePath = join(process.cwd(), 'public', relativePath);
        } else {
          filePath = join(process.cwd(), 'public', deliverable.file_path);
        }

        // Normalize path separators (handle both / and \)
        filePath = filePath.replace(/\//g, sep).replace(/\\/g, sep);

        // Check if file exists before trying to delete
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } else {
          console.warn(`File not found at: ${filePath}`);
        }
      } catch (fileError: any) {
        // Log but don't fail if file doesn't exist
        console.warn('Error deleting file:', fileError?.message || fileError);
      }
    }

    // Delete the deliverable record
    const deleteResult = await query(
      `DELETE FROM deliverables WHERE id = ?`,
      [Number(deliverableId)]
    );

    if ((deleteResult as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Deliverable record not found' });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Deliverable deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting deliverable:', error);
    return res.status(500).json({
      error: 'Failed to delete deliverable',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

