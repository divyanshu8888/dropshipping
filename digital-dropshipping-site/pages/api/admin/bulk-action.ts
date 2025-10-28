import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, rows } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    let result;

    switch (action) {
      case 'approve_kyc':
        const kycIds = rows.map((row: any) => row.id);
        const { error: kycError } = await supabase
          .from('users')
          .update({ 
            kyc_status: 'approved',
            kyc_approved_at: new Date().toISOString()
          })
          .in('id', kycIds);
        
        if (kycError) throw kycError;
        result = { message: `Approved ${rows.length} KYC applications` };
        break;

      case 'reject_kyc':
        const rejectIds = rows.map((row: any) => row.id);
        const { error: rejectError } = await supabase
          .from('users')
          .update({ 
            kyc_status: 'rejected',
            kyc_rejected_at: new Date().toISOString()
          })
          .in('id', rejectIds);
        
        if (rejectError) throw rejectError;
        result = { message: `Rejected ${rows.length} KYC applications` };
        break;

      case 'approve_refunds':
        const refundIds = rows.map((row: any) => row.id);
        const { error: refundError } = await supabase
          .from('orders')
          .update({ 
            status: 'refunded',
            refunded_at: new Date().toISOString()
          })
          .in('id', refundIds);
        
        if (refundError) throw refundError;
        result = { message: `Approved ${rows.length} refund requests` };
        break;

      case 'reject_refunds':
        const rejectRefundIds = rows.map((row: any) => row.id);
        const { error: rejectRefundError } = await supabase
          .from('orders')
          .update({ 
            status: 'refund_rejected',
            refund_rejected_at: new Date().toISOString()
          })
          .in('id', rejectRefundIds);
        
        if (rejectRefundError) throw rejectRefundError;
        result = { message: `Rejected ${rows.length} refund requests` };
        break;

      default:
        return res.status(400).json({ error: 'Invalid bulk action' });
    }

    // Log the bulk action in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: 'admin', // In production, get from session
        action: `bulk_${action}`,
        target_type: 'bulk',
        target_id: null,
        metadata: {
          action,
          count: rows.length,
          row_ids: rows.map((row: any) => row.id),
          timestamp: new Date().toISOString()
        }
      });

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
