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
    
    // Fetch projects and organize them into kanban columns
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Organize projects into kanban columns
    const columns = [
      {
        id: 'open',
        title: 'New Requests',
        color: 'bg-green-500',
        cards: projects?.filter(p => p.status === 'open') || []
      },
      {
        id: 'review',
        title: 'Quotes Under Review',
        color: 'bg-yellow-500',
        cards: projects?.filter(p => p.status === 'open') || [] // Using open as review for now
      },
      {
        id: 'assigned',
        title: 'SOW Signed',
        color: 'bg-blue-500',
        cards: projects?.filter(p => p.status === 'assigned') || []
      },
      {
        id: 'in_progress',
        title: 'In Delivery',
        color: 'bg-purple-500',
        cards: projects?.filter(p => p.status === 'assigned') || [] // Using assigned as in progress
      },
      {
        id: 'completed',
        title: 'Completed',
        color: 'bg-gray-500',
        cards: projects?.filter(p => p.status === 'completed') || []
      }
    ];

    return res.status(200).json({
      success: true,
      columns,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return res.status(500).json({
      error: 'Failed to fetch kanban data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
