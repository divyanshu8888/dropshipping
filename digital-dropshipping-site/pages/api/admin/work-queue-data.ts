import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, tableExists } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const [hasFreelancersTable, hasUsersTable, hasOrdersTable] = await Promise.all([
      tableExists('freelancers'),
      tableExists('users'),
      tableExists('orders')
    ]);

    const pendingKYC = hasFreelancersTable && hasUsersTable
      ? await safeQuery(
          `SELECT f.id,
                  u.email,
                  u.role,
                  f.status,
                  f.created_at
             FROM freelancers f
             JOIN users u ON u.id = f.user_id
            WHERE f.status = 'pending'
            ORDER BY f.created_at ASC
            LIMIT 20`,
          [],
          'workqueue-kyc'
        )
      : [];

    const refundRequests = hasOrdersTable
      ? await safeQuery(
          `SELECT id, total_amount, status, created_at, refund_reason
             FROM orders
            WHERE status = 'refund_requested'
            ORDER BY created_at ASC
            LIMIT 20`,
          [],
          'workqueue-refunds'
        )
      : [];

    const workQueueData = {
      pendingKYC,
      refundRequests,
      chargebacks: [],
      payoutHolds: [],
      failedWebhooks: []
    };

    return res.status(200).json({
      success: true,
      data: workQueueData,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'work-queue-data', error);
  }
}
