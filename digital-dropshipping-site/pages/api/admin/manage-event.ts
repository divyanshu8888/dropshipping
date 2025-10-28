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
    const { action, eventId, assignedTo, metadata } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    let result;

    switch (action) {
      case 'pin':
        const { error: pinError } = await supabase
          .from('events')
          .update({ 
            is_pinned: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
        
        if (pinError) throw pinError;
        result = { message: 'Event pinned successfully' };
        break;

      case 'unpin':
        const { error: unpinError } = await supabase
          .from('events')
          .update({ 
            is_pinned: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
        
        if (unpinError) throw unpinError;
        result = { message: 'Event unpinned successfully' };
        break;

      case 'assign':
        if (!assignedTo) {
          return res.status(400).json({ error: 'Assignee email is required for assignment' });
        }
        
        // Look up user by email
        const { data: assigneeUser, error: assigneeError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', assignedTo)
          .single();
        
        if (assigneeError || !assigneeUser) {
          return res.status(400).json({ error: 'Assignee user not found' });
        }
        
        const { error: assignError } = await supabase
          .from('events')
          .update({ 
            assigned_to: assigneeUser.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
        
        if (assignError) throw assignError;
        result = { message: `Event assigned to ${assigneeUser.email}` };
        break;

      case 'archive':
        const { error: archiveError } = await supabase
          .from('events')
          .update({ 
            status: 'archived',
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);
        
        if (archiveError) throw archiveError;
        result = { message: 'Event archived successfully' };
        break;

      case 'create':
        const { event_type, entity_type, entity_id, user_id, title, description, priority, event_metadata } = req.body;
        
        const { data: newEvent, error: createError } = await supabase
          .from('events')
          .insert({
            event_type,
            entity_type,
            entity_id,
            user_id,
            title,
            description,
            priority: priority || 'medium',
            metadata: event_metadata || {},
            status: 'active'
          })
          .select()
          .single();
        
        if (createError) throw createError;
        result = { message: 'Event created successfully', event: newEvent };
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Log the action in audit_log
    await supabase
      .from('audit_log')
      .insert({
        event_type: `event_${action}`,
        table_name: 'events',
        record_id: eventId,
        new_data: {
          action,
          assignedTo,
          metadata,
          timestamp: new Date().toISOString()
        },
        user_id: 'admin', // In production, get from session
        created_at: new Date().toISOString()
      });

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Error managing event:', error);
    return res.status(500).json({
      error: 'Failed to manage event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
