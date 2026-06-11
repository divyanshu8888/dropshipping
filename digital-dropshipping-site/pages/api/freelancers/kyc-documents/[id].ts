import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { requireRole, parsePositiveInt, internalError } from '../../../../src/lib/apiAuth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Why: only positive integer ids are valid document ids.
  const documentId = parsePositiveInt(req.query.id);
  if (!documentId) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (req.method !== 'DELETE' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: KYC docs belong to the freelancer; identity comes from the session cookie.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  if (req.method === 'DELETE') {
    return handleDelete(req, res, String(documentId), user.id);
  }

  return handleUpdate(req, res, String(documentId), user.id);
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  documentId: string,
  authUserId: number
) {
  try {
    // Get freelancer ID from the authenticated user's id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [authUserId]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerId = freelancer.id;

    // Fetch the document to verify ownership
    const document = await queryOne<{
      id: number;
      freelancer_id: number;
      file_path: string;
    }>(
      `SELECT id, freelancer_id, file_path FROM kyc_documents WHERE id = ? LIMIT 1`,
      [documentId]
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Verify ownership
    if (document.freelancer_id !== freelancerId) {
      return res.status(403).json({ error: 'You do not have permission to delete this document' });
    }

    // Delete the file from filesystem
    if (document.file_path) {
      try {
        let fullPath: string;
        if (document.file_path.startsWith('/uploads')) {
          fullPath = path.join(process.cwd(), 'public', document.file_path);
        } else {
          fullPath = path.join(process.cwd(), 'public', document.file_path.startsWith('/') ? document.file_path.substring(1) : document.file_path);
        }
        
        // Normalize path separators for Windows
        fullPath = fullPath.replace(/\//g, path.sep).replace(/\\/g, path.sep);
        
        await fs.unlink(fullPath);
      } catch (fileError: any) {
        // If file doesn't exist, that's okay - continue with database deletion
        if (fileError.code !== 'ENOENT') {
          console.error('Error deleting file:', fileError);
        }
      }
    }

    // Delete from database
    await query(
      `DELETE FROM kyc_documents WHERE id = ? AND freelancer_id = ?`,
      [documentId, freelancerId]
    );

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    return internalError(res, 'freelancers/kyc-documents/delete', error);
  }
}

async function handleUpdate(
  req: NextApiRequest,
  res: NextApiResponse,
  documentId: string,
  authUserId: number
) {
  try {
    // Get freelancer ID from the authenticated user's id
    const freelancer = await queryOne<{ id: number }>(
      `SELECT id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [authUserId]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerId = freelancer.id;

    // Fetch the document to verify ownership
    const existingDoc = await queryOne<{
      id: number;
      freelancer_id: number;
      file_path: string;
    }>(
      `SELECT id, freelancer_id, file_path FROM kyc_documents WHERE id = ? LIMIT 1`,
      [documentId]
    );

    if (!existingDoc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Verify ownership
    if (existingDoc.freelancer_id !== freelancerId) {
      return res.status(403).json({ error: 'You do not have permission to update this document' });
    }

    // Parse form data
    const tempUploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', 'temp');
    await fs.mkdir(tempUploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir: tempUploadDir,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
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

    const updates: string[] = [];
    const params: any[] = [];
    let newFilePath: string | null = null;

    // Update document name if provided
    const documentName = Array.isArray(fields.documentName) ? fields.documentName[0] : fields.documentName;
    if (documentName !== undefined && documentName !== null && documentName !== '') {
      updates.push('document_name = ?');
      params.push(documentName);
    }

    // Update file if provided
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (file && typeof file !== 'string') {
      // Delete old file
      if (existingDoc.file_path) {
        try {
          let oldFullPath: string;
          if (existingDoc.file_path.startsWith('/uploads')) {
            oldFullPath = path.join(process.cwd(), 'public', existingDoc.file_path);
          } else {
            oldFullPath = path.join(process.cwd(), 'public', existingDoc.file_path.startsWith('/') ? existingDoc.file_path.substring(1) : existingDoc.file_path);
          }
          
          oldFullPath = oldFullPath.replace(/\//g, path.sep).replace(/\\/g, path.sep);
          
          await fs.unlink(oldFullPath).catch(() => {
            // Ignore if file doesn't exist
          });
        } catch (fileError) {
          console.error('Error deleting old file:', fileError);
        }
      }

      // Create upload directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'kyc', `freelancerId=${freelancerId}`);
      await fs.mkdir(uploadDir, { recursive: true });

      // Move new file to final location
      const fileName = file.newFilename || `${Date.now()}-${file.originalFilename || 'document'}`;
      const finalPath = path.join(uploadDir, fileName);
      
      // If file was uploaded to temp location, move it
      if (file.filepath) {
        await fs.rename(file.filepath, finalPath);
      }

      newFilePath = `/uploads/kyc/freelancerId=${freelancerId}/${fileName}`;
      
      // Get file size and mime type
      const stats = await fs.stat(finalPath);
      updates.push('file_path = ?');
      updates.push('file_size = ?');
      updates.push('mime_type = ?');
      params.push(newFilePath, stats.size, file.mimetype || 'application/octet-stream');
      
      // Reset status to pending when file is replaced
      updates.push('status = ?');
      params.push('pending');
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    // Add WHERE clause parameters at the end
    params.push(documentId, freelancerId);

    // Update database
    await query(
      `UPDATE kyc_documents SET ${updates.join(', ')} WHERE id = ? AND freelancer_id = ?`,
      params
    );

    // Fetch updated document
    const updated = await queryOne<any>(
      `SELECT * FROM kyc_documents WHERE id = ? LIMIT 1`,
      [documentId]
    );

    const serialized = {
      ...updated,
      created_at: updated.created_at ? new Date(updated.created_at).toISOString() : null,
      updated_at: updated.updated_at ? new Date(updated.updated_at).toISOString() : null,
      reviewed_at: updated.reviewed_at ? new Date(updated.reviewed_at).toISOString() : null,
    };

    return res.status(200).json({
      success: true,
      document: serialized
    });
  } catch (error: any) {
    return internalError(res, 'freelancers/kyc-documents/update', error);
  }
}

