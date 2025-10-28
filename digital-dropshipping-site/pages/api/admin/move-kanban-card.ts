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
    const { cardId, fromStatus, toStatus } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    // Update project status
    const { error } = await supabase
      .from('projects')
      .update({ 
        status: toStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId);

    if (error) throw error;

    // Log the move in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: 'admin', // In production, get from session
        action: 'move_kanban_card',
        target_type: 'project',
        target_id: cardId,
        metadata: {
          fromStatus,
          toStatus,
          timestamp: new Date().toISOString()
        }
      });

    return res.status(200).json({
      success: true,
      message: 'Card moved successfully'
    });

  } catch (error) {
    console.error('Error moving kanban card:', error);
    return res.status(500).json({
      error: 'Failed to move card',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
