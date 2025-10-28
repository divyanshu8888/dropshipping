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
    const { action, entityType, entityId, params } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    let result;

    switch (action) {
      case 'approve':
        if (entityType === 'kyc') {
          const { error } = await supabase
            .from('users')
            .update({ 
              kyc_status: 'approved',
              kyc_approved_at: new Date().toISOString()
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'KYC approved successfully' };
        }
        break;

      case 'reject':
        if (entityType === 'kyc') {
          const { error } = await supabase
            .from('users')
            .update({ 
              kyc_status: 'rejected',
              kyc_rejected_at: new Date().toISOString()
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'KYC rejected' };
        }
        break;

      case 'refund':
        if (entityType === 'order') {
          const { error } = await supabase
            .from('orders')
            .update({ 
              status: 'refunded',
              refunded_at: new Date().toISOString(),
              refund_reason: params.reason || 'Admin refund'
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'Refund processed' };
        }
        break;

      case 'hold':
        if (entityType === 'order') {
          const { error } = await supabase
            .from('orders')
            .update({ 
              status: 'on_hold',
              hold_reason: params.reason || 'Admin hold'
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'Order placed on hold' };
        }
        break;

      case 'suspend':
        if (entityType === 'user') {
          const { error } = await supabase
            .from('users')
            .update({ 
              is_active: false,
              suspended_at: new Date().toISOString(),
              suspension_reason: params.reason || 'Admin suspension'
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'User suspended' };
        }
        break;

      case 'verify':
        if (entityType === 'user') {
          const { error } = await supabase
            .from('users')
            .update({ 
              email_verified: true,
              verified_at: new Date().toISOString()
            })
            .eq('id', entityId);
          
          if (error) throw error;
          result = { message: 'User verified' };
        }
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Log the action in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: 'admin', // In production, get from session
        action: `quick_${action}`,
        target_type: entityType,
        target_id: entityId,
        metadata: {
          params,
          timestamp: new Date().toISOString()
        }
      });

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
