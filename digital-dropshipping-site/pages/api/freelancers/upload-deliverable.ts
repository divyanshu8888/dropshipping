import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { type File } from 'formidable';
import path from 'path';
import { promises as fs } from 'fs';
import { query, queryOne } from '../../../src/lib/mysql';
import { requireRole, internalError } from '../../../src/lib/apiAuth';

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

  // Why: identity must come from the session cookie; route previously had no auth at all.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  try {
    const { fields, files } = await parseMultipartForm(req);
    const projectId = firstValue(fields.projectId);
    const milestoneId = firstValue(fields.milestoneId);
    const description = firstValue(fields.description);
    const file = firstValue(files.file) as File | undefined;

    if (!projectId || !file || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Why: ownership check — only the project's assigned freelancer may upload deliverables.
    const ownProject = await queryOne<{ id: number }>(
      `SELECT p.id
       FROM projects p
       INNER JOIN freelancers f ON f.id = p.freelancer_id
       WHERE p.id = ? AND f.user_id = ?
       LIMIT 1`,
      [Number(projectId), user.id]
    );

    if (!ownProject) {
      return res.status(403).json({ error: 'Not authorized to upload deliverables for this project' });
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
    return internalError(res, 'freelancers/upload-deliverable', error);
  }
}
