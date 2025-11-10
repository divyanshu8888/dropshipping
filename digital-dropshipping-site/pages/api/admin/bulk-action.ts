import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute } from '../../../src/lib/dbHelpers';

function buildPlaceholders(length: number) {
  return new Array(length).fill('?').join(',');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided for bulk action' });
    }

    const ids = rows.map((row: any) => row.id).filter(Boolean);

    if (ids.length === 0) {
      return res.status(400).json({ error: 'Invalid row identifiers' });
    }

    let result;

    switch (action) {
      case 'approve_kyc': {
        const placeholders = buildPlaceholders(ids.length);
        await safeExecute(
          `UPDATE users
           SET kyc_status = 'approved',
               kyc_approved_at = NOW()
           WHERE id IN (${placeholders})`,
          ids,
          'bulk-approve-kyc'
        );
        result = { message: `Approved ${ids.length} KYC applications` };
        break;
      }
      case 'reject_kyc': {
        const placeholders = buildPlaceholders(ids.length);
        await safeExecute(
          `UPDATE users
           SET kyc_status = 'rejected',
               kyc_rejected_at = NOW()
           WHERE id IN (${placeholders})`,
          ids,
          'bulk-reject-kyc'
        );
        result = { message: `Rejected ${ids.length} KYC applications` };
        break;
      }
      case 'approve_refunds': {
        const placeholders = buildPlaceholders(ids.length);
        await safeExecute(
          `UPDATE orders
           SET status = 'refunded',
               refunded_at = NOW()
           WHERE id IN (${placeholders})`,
          ids,
          'bulk-approve-refunds'
        );
        result = { message: `Approved ${ids.length} refund requests` };
        break;
      }
      case 'reject_refunds': {
        const placeholders = buildPlaceholders(ids.length);
        await safeExecute(
          `UPDATE orders
           SET status = 'refund_rejected',
               refund_rejected_at = NOW()
           WHERE id IN (${placeholders})`,
          ids,
          'bulk-reject-refunds'
        );
        result = { message: `Rejected ${ids.length} refund requests` };
        break;
      }
      default:
        return res.status(400).json({ error: 'Invalid bulk action' });
    }

    // Attempt to log audit entry (ignore failures if table missing)
    await safeExecute(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        'admin',
        `bulk_${action}`,
        'bulk',
        null,
        JSON.stringify({
          action,
          count: ids.length,
          row_ids: ids,
          timestamp: new Date().toISOString()
        })
      ],
      'bulk-audit-log'
    );

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return res.status(500).json({
      error: 'Failed to perform bulk action',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
