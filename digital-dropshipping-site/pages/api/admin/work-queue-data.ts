import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin
    
    // Fetch work queue data from Supabase
    const [
      pendingKYC,
      refundRequests,
      chargebacks,
      payoutHolds,
      failedWebhooks
    ] = await Promise.all([
      // Pending KYC applications
      supabase
        .from('users')
        .select('id, email, role, created_at, kyc_status')
        .eq('kyc_status', 'pending')
        .order('created_at', { ascending: true })
        .limit(20),
      
      // Refund requests
      supabase
        .from('orders')
        .select('id, total_amount, status, created_at, refund_reason')
        .eq('status', 'refund_requested')
        .order('created_at', { ascending: true })
        .limit(20),
      
      // Chargebacks (placeholder - would need chargebacks table)
      Promise.resolve({ data: [] }),
      
      // Payout holds (placeholder - would need payouts table)
      Promise.resolve({ data: [] }),
      
      // Failed webhooks (placeholder - would need webhooks table)
      Promise.resolve({ data: [] })
    ]);

    const workQueueData = {
      pendingKYC: pendingKYC.data || [],
      refundRequests: refundRequests.data || [],
      chargebacks: chargebacks.data || [],
      payoutHolds: payoutHolds.data || [],
      failedWebhooks: failedWebhooks.data || []
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
