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
    const { limit = 20, priority, event_type, assigned_to, pinned_only } = req.query;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin
    
    // Build query for events table
    let query = supabase
      .from('events')
      .select(`
        id,
        event_type,
        entity_type,
        entity_id,
        user_id,
        title,
        description,
        metadata,
        priority,
        status,
        assigned_to,
        is_pinned,
        created_at,
        updated_at
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (event_type) {
      query = query.eq('event_type', event_type);
    }
    
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }
    
    if (pinned_only === 'true') {
      query = query.eq('is_pinned', true);
    }

    // Apply limit
    query = query.limit(parseInt(limit as string));

    const { data: events, error } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Transform events to match EventStream component format
    const transformedEvents = events?.map(event => ({
      id: event.id,
      type: event.event_type,
      message: event.title,
      description: event.description,
      timestamp: getTimeAgo(new Date(event.created_at)),
      user: event.metadata?.email || event.metadata?.user_name || 'Unknown User',
      amount: event.metadata?.amount || event.metadata?.budget,
      priority: event.priority,
      entityId: event.entity_id,
      entityType: event.entity_type,
      assignedTo: event.assigned_to,
      isPinned: event.is_pinned,
      metadata: event.metadata,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    })) || [];

    return res.status(200).json({
      success: true,
      events: transformedEvents,
      total: transformedEvents.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching event stream:', error);
    return res.status(500).json({
      error: 'Failed to fetch event stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
