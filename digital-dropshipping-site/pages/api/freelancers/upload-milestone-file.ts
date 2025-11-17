import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import formidable from 'formidable';
import path from 'path';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Temporary upload directory (formidable needs a temp dir)
    const tempUploadDir = path.join(process.cwd(), 'public', 'uploads', 'milestones', 'temp');
    await fs.mkdir(tempUploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir: tempUploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      filename: (_name, file) => {
        const uploaded = typeof file === 'string' ? null : (file as formidable.File);
        const original = uploaded?.originalFilename || uploaded?.newFilename || (typeof file === 'string' ? file : 'file');
        const safeName = original
          .replace(/[^a-zA-Z0-9.\-_]/g, '_')
          .replace(/_{2,}/g, '_');
        return `${Date.now()}-${safeName}`;
      },
    });

    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const milestoneId = Array.isArray(fields.milestoneId) ? fields.milestoneId[0] : fields.milestoneId;
    const projectId = Array.isArray(fields.projectId) ? fields.projectId[0] : fields.projectId;
    const freelancerId = Array.isArray(fields.freelancerId) ? fields.freelancerId[0] : fields.freelancerId;

    if (!milestoneId || !projectId || !freelancerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || typeof file === 'string') {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Validate file name for personal info
    const fileName = file.originalFilename || file.newFilename || '';
    const personalInfoPatterns = [
      /email|contact|phone|price|cost|invoice|payment/i,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ];

    for (const pattern of personalInfoPatterns) {
      if (pattern.test(fileName)) {
        // Clean up uploaded file
        try {
          await fs.unlink(file.filepath);
        } catch (e) {
          // Ignore cleanup errors
        }
        return res.status(400).json({ 
          error: 'File name cannot contain personal information (email, contact, price)' 
        });
      }
    }

    // Verify the milestone belongs to this freelancer's project
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [Number(freelancerId)]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const milestone = await queryOne<{ contract_id: number }>(
      `SELECT contract_id FROM milestones WHERE id = ? LIMIT 1`,
      [Number(milestoneId)]
    );

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    const contract = await queryOne<{ project_id: number }>(
      `SELECT project_id FROM contracts WHERE id = ? LIMIT 1`,
      [milestone.contract_id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const project = await queryOne<{ freelancer_id: number; client_id: number; title: string }>(
      `SELECT freelancer_id, client_id, title FROM projects WHERE id = ? LIMIT 1`,
      [contract.project_id]
    );

    if (!project || project.freelancer_id !== freelancer.id) {
      return res.status(403).json({ error: 'Not authorized to upload files to this milestone' });
    }

    // Create meaningful folder structure: freelancerId={id}/clientId={id}/projectName/
    const sanitizeFolderName = (name: string) => {
      return name
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
        .toLowerCase();
    };

    const projectFolderName = sanitizeFolderName(project.title || `project_${contract.project_id}`);
    const structuredFolder = path.join(
      'uploads',
      'milestones',
      `freelancerId=${freelancer.id}`,
      `clientId=${project.client_id}`,
      projectFolderName
    );
    const fullUploadDir = path.join(process.cwd(), 'public', structuredFolder);
    await fs.mkdir(fullUploadDir, { recursive: true });

    // Move file to final location
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFileName = `${milestoneId}_${Date.now()}_${sanitizedFileName}`;
    const finalPath = path.join(fullUploadDir, finalFileName);
    const relativePath = `/${structuredFolder}/${finalFileName}`.replace(/\\/g, '/'); // Normalize path separators

    // File is already in uploadDir, just rename it
    await fs.rename(file.filepath, finalPath);

    // Create deliverable record
    const result = await query(
      `INSERT INTO deliverables (project_id, milestone_id, title, description, file_path, submitted_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        contract.project_id,
        Number(milestoneId),
        sanitizedFileName,
        `File uploaded for milestone`,
        relativePath
      ]
    );

    const deliverableId = (result as any).insertId;

    return res.status(200).json({ 
      success: true,
      deliverable: {
        id: String(deliverableId),
        file_path: relativePath,
        title: sanitizedFileName
      }
    });

  } catch (error) {
    console.error('Error uploading milestone file:', error);
    return res.status(500).json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
