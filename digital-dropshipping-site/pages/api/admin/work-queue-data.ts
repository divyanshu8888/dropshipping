import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, tableExists } from '../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    console.error('Error fetching work queue data:', error);
    return res.status(500).json({
      error: 'Failed to fetch work queue data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
