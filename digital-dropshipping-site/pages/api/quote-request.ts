import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import { promises as fs } from 'fs';
import { query } from '../../src/lib/mysql';
import { projectQuoteSchema, formatZodErrors } from '../../src/lib/schemas/projectQuote';

export const config = {
  api: {
    bodyParser: false,
  },
};

type QuoteRequestFields = {
  clientName?: string | string[];
  clientEmail?: string | string[];
  clientPhone?: string | string[];
  phoneCountryCode?: string | string[];
  projectTitle?: string | string[];
  projectDescription?: string | string[];
  budget?: string | string[];
  timeline?: string | string[];
  category?: string | string[];
  notes?: string | string[];
};

const toStringField = (value: string | string[] | undefined): string => {
  if (!value) return '';
  return Array.isArray(value) ? value[0] ?? '' : value;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'project-briefs');
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 15 * 1024 * 1024,
    filename: (_name, file) => {
      const uploaded = typeof file === 'string' ? null : (file as formidable.File)
      const original = uploaded?.originalFilename || uploaded?.newFilename || (typeof file === 'string' ? file : 'attachment')
      const safeName = original
        .replace(/[^a-zA-Z0-9.\-_]/g, '_')
        .replace(/_{2,}/g, '_');
      return `${Date.now()}-${safeName}`;
    },
  });

let attachmentsMetadata: Array<{ originalName: string; storedName: string; url: string; size: number; type?: string | null }> = [];

const removeUploadedFiles = async () => {
  await Promise.all(
    attachmentsMetadata.map(async (file) => {
      const filePath = path.join(uploadDir, file.storedName);
      await fs.unlink(filePath).catch(() => undefined);
    }),
  );
};

  try {
    const { fields, files } = await new Promise<{ fields: QuoteRequestFields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields: fields as QuoteRequestFields, files });
      });
    });

    const clientName = toStringField(fields.clientName).trim();
    const clientEmail = toStringField(fields.clientEmail).trim();
    const clientPhone = toStringField(fields.clientPhone).trim();
    const phoneCountryCode = toStringField(fields.phoneCountryCode).trim();
    const projectTitle = toStringField(fields.projectTitle).trim();
    const projectDescription = toStringField(fields.projectDescription).trim();
    const budgetRaw = toStringField(fields.budget);
    const timeline = toStringField(fields.timeline);
    const category = toStringField(fields.category).trim();
    const notes = toStringField(fields.notes);

    const attachmentsArray: formidable.File[] = [];
    const rawFiles = files.attachments;
    if (Array.isArray(rawFiles)) {
      rawFiles.forEach((file) => {
        if (file && typeof file !== 'string') attachmentsArray.push(file);
      });
    } else if (rawFiles && typeof rawFiles !== 'string') {
      attachmentsArray.push(rawFiles);
    }

    attachmentsMetadata = attachmentsArray.map((file) => ({
      originalName: file.originalFilename || file.newFilename,
      storedName: path.basename(file.filepath),
      url: `/uploads/project-briefs/${path.basename(file.filepath)}`,
      size: file.size,
      type: file.mimetype,
    }));

    const allowedMimeTypes = new Set([
      'application/pdf',
      'image/png',
      'image/jpeg',
    ]);

    const invalidAttachment = attachmentsMetadata.find((file) => !allowedMimeTypes.has(file.type || ''));
    if (invalidAttachment) {
      await removeUploadedFiles();
      return res.status(422).json({
        message: 'Validation failed',
        errors: { attachments: 'Only PDF, PNG, or JPG files are allowed.' },
      });
    }

    if (attachmentsMetadata.length > 5) {
      await removeUploadedFiles();
      return res.status(422).json({
        message: 'Validation failed',
        errors: { attachments: 'You can upload up to 5 files.' },
      });
    }

    const validationResult = projectQuoteSchema.safeParse({
      clientName,
      clientEmail,
      clientPhone,
      phoneCountryCode,
      projectTitle,
      projectDescription,
      budget: budgetRaw,
      timeline,
      category,
      notes,
    });

    if (!validationResult.success) {
      await removeUploadedFiles();
      return res.status(422).json({
        message: 'Validation failed',
        errors: formatZodErrors(validationResult.error),
      });
    }

    const payload = validationResult.data;

    await query(`
      CREATE TABLE IF NOT EXISTS project_leads (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NULL,
        phone_country VARCHAR(10) NULL,
        project_title VARCHAR(255) NOT NULL,
        project_description MEDIUMTEXT NOT NULL,
        budget DECIMAL(12,2) NULL,
        timeline VARCHAR(120) NULL,
        category VARCHAR(160) NOT NULL,
        notes MEDIUMTEXT NULL,
        attachments JSON NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'pending',
        priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
        admin_notes MEDIUMTEXT NULL,
        assigned_to VARCHAR(160) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const result = await query(
      `
        INSERT INTO project_leads
          (client_name, client_email, client_phone, phone_country, project_title, project_description, budget, timeline, category, notes, attachments, status, priority)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.clientName,
        payload.clientEmail,
        payload.clientPhone || null,
        payload.phoneCountryCode || null,
        payload.projectTitle,
        payload.projectDescription,
        payload.budget,
        payload.timeline ? payload.timeline.trim() : null,
        payload.category,
        payload.notes ? payload.notes.trim() : null,
        attachmentsMetadata.length > 0 ? JSON.stringify(attachmentsMetadata) : null,
        'pending',
        'medium',
      ],
    );

    const insertId = (Array.isArray(result) && (result as any).insertId) || (result as any).insertId || null;

    return res.status(201).json({
      message: 'Quote request submitted successfully',
      quoteRequest: {
        id: insertId,
        status: 'pending',
        attachments: attachmentsMetadata,
      },
    });
  } catch (error) {
    if (attachmentsMetadata.length > 0) {
      await Promise.all(
        attachmentsMetadata.map(async (file) => {
          const filePath = path.join(uploadDir, file.storedName);
          return fs.unlink(filePath).catch(() => undefined);
        }),
      );
    }
    console.error('Error creating quote request:', error);
    return res.status(500).json({
      message: 'Failed to submit quote request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}