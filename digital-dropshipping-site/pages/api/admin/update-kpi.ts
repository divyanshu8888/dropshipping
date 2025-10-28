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
    const { field, value } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    // For demo purposes, we'll just log the KPI update
    // In production, you might store KPI targets in a separate table
    console.log(`KPI Update: ${field} = ${value}`);

    // Log the update in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: 'admin', // In production, get from session
        action: 'update_kpi',
        target_type: 'kpi',
        target_id: field,
        metadata: {
          field,
          value,
          timestamp: new Date().toISOString()
        }
      });

    return res.status(200).json({
      success: true,
      message: `KPI ${field} updated successfully`
    });

  } catch (error) {
    console.error('Error updating KPI:', error);
    return res.status(500).json({
      error: 'Failed to update KPI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
