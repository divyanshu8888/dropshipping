import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError } from '../../../src/lib/apiAuth';

type EventRow = {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  title: string | null;
  description: string | null;
  metadata: any;
  priority: string | null;
  status: string | null;
  assigned_to: string | null;
  is_pinned: number | boolean | null;
  created_at: string | Date;
  updated_at: string | Date | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication (guard runs
  // before any event data is sent).
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const { limit = 20, priority, event_type, assigned_to, pinned_only } = req.query;

    const filters: string[] = ["status = 'active'"];
    const params: any[] = [];

    if (priority && typeof priority === 'string') {
      filters.push('priority = ?');
      params.push(priority);
    }

    if (event_type && typeof event_type === 'string') {
      filters.push('event_type = ?');
      params.push(event_type);
    }

    if (assigned_to && typeof assigned_to === 'string') {
      filters.push('assigned_to = ?');
      params.push(assigned_to);
    }

    if (pinned_only === 'true') {
      filters.push('is_pinned = 1');
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const events = await safeQuery<EventRow>(
      `SELECT id, event_type, entity_type, entity_id, user_id, title, description, metadata, priority, status, assigned_to, is_pinned, created_at, updated_at
       FROM events
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ?`,
      [...params, Number(limit) || 20],
      'events-stream'
    );

    const transformedEvents = events.map((event) => {
      let metadata = event.metadata;
      if (metadata && typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = { raw: metadata };
        }
      }

      return {
        id: event.id,
        type: event.event_type,
        message: event.title || 'Event',
        description: event.description || '',
        timestamp: getTimeAgo(new Date(event.created_at)),
        user:
          metadata?.email ||
          metadata?.user_name ||
          metadata?.user ||
          event.user_id ||
          'Unknown user',
        amount: metadata?.amount || metadata?.budget || null,
        priority: event.priority || 'medium',
        entityId: event.entity_id,
        entityType: event.entity_type,
        assignedTo: event.assigned_to,
        isPinned: Boolean(event.is_pinned),
        metadata,
        createdAt: event.created_at,
        updatedAt: event.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      events: transformedEvents,
      total: transformedEvents.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'event-stream', error);
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
