import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../src/lib/mysql';
import { requireAdmin, internalError, parsePositiveInt } from '../../../src/lib/apiAuth';

const parseIntParam = (value: string | string[] | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = parseInt(Array.isArray(value) ? value[0] ?? '' : value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  if (req.method === 'GET') {
    try {
      const statusParam = Array.isArray(req.query.status) ? req.query.status[0] : req.query.status;
      const page = parseIntParam(req.query.page, 1);
      const limit = parseIntParam(req.query.limit, 10);
      const offset = (page - 1) * limit;

      let whereClause = '';
      const params: any[] = [];
      if (statusParam && statusParam !== 'all') {
        whereClause = 'WHERE status = ?';
        params.push(statusParam);
      }

      const rows = await query<any>(
        `SELECT * FROM project_leads ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset],
      );

      const countResult = await query<{ total: number }>(
        `SELECT COUNT(*) as total FROM project_leads ${whereClause}`,
        params,
      );

      const quoteRequests = rows.map((row) => ({
        ...row,
        budget: row.budget !== null ? Number(row.budget) : null,
        attachments: row.attachments ? JSON.parse(row.attachments) : [],
      }));

      const total = countResult[0]?.total ?? 0;

      res.status(200).json({
        quoteRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      // Why: 500 response leaked error.message to clients.
      internalError(res, 'quote-requests-get', error);
    }
    return;
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status, adminNotes, assignedTo, priority } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Quote request ID is required' });
      }

      // Why: id was used without validation; require a positive integer.
      const idNum = parsePositiveInt(id);
      if (idNum === null) {
        return res.status(400).json({ error: 'Invalid id' });
      }

      const fields: string[] = [];
      const values: any[] = [];

      if (status) {
        fields.push('status = ?');
        values.push(status);
      }
      if (adminNotes !== undefined) {
        fields.push('admin_notes = ?');
        values.push(adminNotes);
      }
      if (assignedTo !== undefined) {
        fields.push('assigned_to = ?');
        values.push(assignedTo);
      }
      if (priority) {
        fields.push('priority = ?');
        values.push(priority);
      }

      if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields provided to update.' });
      }

      values.push(idNum);

      await query(
        `UPDATE project_leads SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values,
      );

      const [updated] = await query<any>(`SELECT * FROM project_leads WHERE id = ?`, [idNum]);

      res.status(200).json({
        message: 'Quote request updated successfully',
        quoteRequest: updated,
      });
    } catch (error) {
      // Why: 500 response leaked error.message to clients.
      internalError(res, 'quote-requests-patch', error);
    }
    return;
  }

  res.status(405).json({ message: 'Method not allowed' });
}
