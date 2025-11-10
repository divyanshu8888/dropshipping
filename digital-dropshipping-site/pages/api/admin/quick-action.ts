import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute } from '../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, entityType, entityId, params } = req.body;

    if (!action || !entityType || !entityId) {
      return res
        .status(400)
        .json({ error: 'action, entityType, and entityId are required fields' });
    }

    let result;

    switch (action) {
      case 'approve':
        if (entityType === 'kyc') {
          await safeExecute(
            `UPDATE users SET kyc_status = 'approved', kyc_approved_at = NOW() WHERE id = ?`,
            [entityId],
            'quick-action-approve-kyc'
          );
          result = { message: 'KYC approved successfully' };
        }
        break;

      case 'reject':
        if (entityType === 'kyc') {
          await safeExecute(
            `UPDATE users SET kyc_status = 'rejected', kyc_rejected_at = NOW() WHERE id = ?`,
            [entityId],
            'quick-action-reject-kyc'
          );
          result = { message: 'KYC rejected' };
        }
        break;

      case 'refund':
        if (entityType === 'order') {
          await safeExecute(
            `UPDATE orders
               SET status = 'refunded',
                   refunded_at = NOW(),
                   refund_reason = ?
             WHERE id = ?`,
            [params?.reason || 'Admin refund', entityId],
            'quick-action-refund'
          );
          result = { message: 'Refund processed' };
        }
        break;

      case 'hold':
        if (entityType === 'order') {
          await safeExecute(
            `UPDATE orders
               SET status = 'on_hold',
                   hold_reason = ?
             WHERE id = ?`,
            [params?.reason || 'Admin hold', entityId],
            'quick-action-hold'
          );
          result = { message: 'Order placed on hold' };
        }
        break;

      case 'suspend':
        if (entityType === 'user') {
          await safeExecute(
            `UPDATE users
               SET is_active = 0,
                   suspended_at = NOW(),
                   suspension_reason = ?
             WHERE id = ?`,
            [params?.reason || 'Admin suspension', entityId],
            'quick-action-suspend'
          );
          result = { message: 'User suspended' };
        }
        break;

      case 'verify':
        if (entityType === 'user') {
          await safeExecute(
            `UPDATE users
               SET email_verified = 'TRUE',
                   verified_at = NOW()
             WHERE id = ?`,
            [entityId],
            'quick-action-verify'
          );
          result = { message: 'User verified' };
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    await safeExecute(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        'admin',
        `quick_${action}`,
        entityType,
        String(entityId),
        JSON.stringify({
          params,
          timestamp: new Date().toISOString()
        })
      ],
      'quick-action-audit'
    );

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error performing quick action:', error);
    return res.status(500).json({
      error: 'Failed to perform action',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
