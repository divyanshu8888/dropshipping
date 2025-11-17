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
    // Temporary upload directory
    const tempUploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', 'temp');
    await fs.mkdir(tempUploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir: tempUploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
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

    // Get user from form data
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get freelancer ID from user_id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerId = freelancer.id;

    const documentType = Array.isArray(fields.documentType) ? fields.documentType[0] : fields.documentType;
    const documentName = Array.isArray(fields.documentName) ? fields.documentName[0] : fields.documentName;

    if (!documentType || !['id_card', 'passport', 'drivers_license', 'proof_of_address', 'tax_id', 'other'].includes(String(documentType))) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file || typeof file === 'string') {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Create structured folder: public/uploads/kyc/freelancerId={id}/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', `freelancerId=${freelancerId}`);
    await fs.mkdir(uploadDir, { recursive: true });

    // Move file to final location
    const fileName = file.newFilename || `${Date.now()}-${file.originalFilename || 'document'}`;
    const finalPath = path.join(uploadDir, fileName);
    await fs.rename(file.filepath, finalPath);

    // Relative path for database (starts with /uploads)
    const relativePath = `/uploads/kyc/freelancerId=${freelancerId}/${fileName}`;

    // Get file size and mime type
    const stats = await fs.stat(finalPath);
    const fileSize = stats.size;
    const mimeType = file.mimetype || 'application/octet-stream';

    // Insert into database
    const result = await query(
      `INSERT INTO kyc_documents 
       (freelancer_id, document_type, document_name, file_path, file_size, mime_type, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        freelancerId,
        documentType,
        documentName || file.originalFilename || fileName,
        relativePath,
        fileSize,
        mimeType
      ]
    );

    // Fetch the created document
    const insertId = (result as any).insertId;
    const document = await queryOne<any>(
      `SELECT * FROM kyc_documents WHERE id = ? LIMIT 1`,
      [insertId]
    );

    const serialized = {
      ...document,
      created_at: document.created_at ? new Date(document.created_at).toISOString() : null,
      updated_at: document.updated_at ? new Date(document.updated_at).toISOString() : null,
    };

    return res.status(201).json({
      success: true,
      document: serialized
    });
  } catch (error: any) {
    console.error('Error uploading KYC document:', error);
    return res.status(500).json({
      error: 'Failed to upload KYC document',
      details: error.message
    });
  }
}

