import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { type File } from 'formidable';
import path from 'path';
import { promises as fs } from 'fs';
import { query } from '../../../src/lib/mysql';

export const config = {
  api: {
    bodyParser: false,
  },
};

const firstValue = <T,>(value: T | T[] | undefined): T | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const sanitizeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 180);

const getFileType = (mimetype: string) => {
  if (mimetype.includes('zip') || mimetype.includes('code')) return 'code';
  if (mimetype.includes('image')) return 'image';
  if (mimetype.includes('video')) return 'video';
  return 'document';
};

const parseMultipartForm = async (req: NextApiRequest) => {
  const tempUploadDir = path.join(process.cwd(), 'public', 'uploads', 'deliverables', 'temp');
  await fs.mkdir(tempUploadDir, { recursive: true });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({
      uploadDir: tempUploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024,
      multiples: false,
    });

    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseMultipartForm(req);
    const projectId = firstValue(fields.projectId);
    const milestoneId = firstValue(fields.milestoneId);
    const description = firstValue(fields.description);
    const file = firstValue(files.file) as File | undefined;

    if (!projectId || !file || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const originalName = file.originalFilename || file.newFilename || 'deliverable';
    const safeName = sanitizeFileName(originalName);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'deliverables', `projectId=${projectId}`);
    await fs.mkdir(uploadDir, { recursive: true });

    const finalFileName = `${Date.now()}-${safeName}`;
    const finalPath = path.join(uploadDir, finalFileName);
    await fs.rename(file.filepath, finalPath);

    const relativePath = `/uploads/deliverables/projectId=${projectId}/${finalFileName}`.replace(/\\/g, '/');
    const fileType = getFileType(file.mimetype || '');

    const result = await query(
      `INSERT INTO deliverables (project_id, milestone_id, title, description, file_path, submitted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        Number(projectId),
        milestoneId ? Number(milestoneId) : null,
        safeName,
        `${description}${fileType ? ` (${fileType})` : ''}`,
        relativePath,
      ]
    );

    return res.status(200).json({
      success: true,
      deliverable: {
        id: String((result as any).insertId),
        project_id: String(projectId),
        milestone_id: milestoneId ? String(milestoneId) : null,
        name: safeName,
        type: fileType,
        url: relativePath,
        description,
      },
    });
  } catch (error) {
    console.error('Error uploading deliverable:', error);
    return res.status(500).json({
      error: 'Failed to upload deliverable',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
