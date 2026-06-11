import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';
import { internalError } from '../../../src/lib/apiAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, search, limit = '20', offset = '0' } = req.query;

  try {
    let rows: any[] = [];

    try {
      const conditions: string[] = [`p.status = 'open'`];
      const params: any[] = [];

      if (category && category !== 'All') {
        conditions.push(`p.category = ?`);
        params.push(category);
      }

      if (search) {
        conditions.push(`(p.title LIKE ? OR p.description LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      params.push(Number(limit), Number(offset));

      rows = await query<any>(
        `SELECT
           p.id,
           p.title,
           p.description,
           COALESCE(p.budget_cents, p.budget) AS budget_raw,
           p.currency,
           p.deadline,
           p.status,
           p.category,
           p.skills_required,
           p.created_at,
           c.company_name AS client_company
         FROM projects p
         LEFT JOIN clients c ON c.id = p.client_id
         ${where}
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        params
      );
    } catch (dbErr: any) {
      if (dbErr?.code === 'ER_NO_SUCH_TABLE') {
        rows = [];
      } else {
        throw dbErr;
      }
    }

    const projects = rows.map((p) => {
      const budgetRaw = p.budget_raw ? Number(p.budget_raw) : null;
      // budget_cents stores in cents, raw budget stores in dollars
      const budgetDollars = budgetRaw
        ? budgetRaw > 10000
          ? budgetRaw / 100 // stored as cents
          : budgetRaw       // stored as dollars
        : null;

      let skills: string[] = [];
      if (p.skills_required) {
        try {
          skills = typeof p.skills_required === 'string'
            ? JSON.parse(p.skills_required)
            : p.skills_required;
        } catch {
          skills = String(p.skills_required).split(',').map((s: string) => s.trim()).filter(Boolean);
        }
      }

      const deadline = p.deadline
        ? (() => {
            const days = Math.ceil(
              (new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (days <= 0) return 'Deadline passed';
            if (days === 1) return '1 day';
            if (days <= 7) return `${days} days`;
            if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
            return `${Math.ceil(days / 30)} months`;
          })()
        : null;

      const postedAgo = (() => {
        const diff = Date.now() - new Date(p.created_at).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        const weeks = Math.floor(days / 7);
        return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      })();

      return {
        id: p.id,
        title: p.title,
        description: p.description || '',
        category: p.category || 'General',
        budget: budgetDollars
          ? `$${budgetDollars.toLocaleString()}`
          : 'Negotiable',
        budgetRaw: budgetDollars || 0,
        deadline: deadline || 'Flexible',
        skills,
        clientCompany: p.client_company || null,
        postedAgo,
        status: p.status,
      };
    });

    return res.status(200).json({ success: true, projects });
  } catch (error) {
    // Why: do not leak error internals; route stays public (open marketplace listing).
    return internalError(res, 'projects/open', error);
  }
}
