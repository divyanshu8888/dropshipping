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
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchQuery = q.toLowerCase();

    // Search across multiple tables
    const [
      users,
      orders,
      projects,
      services,
      disputes
    ] = await Promise.all([
      // Search users
      supabase
        .from('users')
        .select('id, email, role, created_at')
        .or(`email.ilike.%${searchQuery}%,role.ilike.%${searchQuery}%`)
        .limit(5),
      
      // Search orders
      supabase
        .from('orders')
        .select('id, status, total_amount, created_at')
        .or(`status.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(5),
      
      // Search projects
      supabase
        .from('projects')
        .select('id, title, status, budget, created_at')
        .or(`title.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`)
        .limit(5),
      
      // Search services
      supabase
        .from('freelancer_services')
        .select('id, title, price, status, created_at')
        .or(`title.ilike.%${searchQuery}%,status.ilike.%${searchQuery}%`)
        .limit(5),
      
      // Search disputes (if disputes table exists)
      supabase
        .from('disputes')
        .select('id, status, reason, created_at')
        .or(`status.ilike.%${searchQuery}%,reason.ilike.%${searchQuery}%`)
        .limit(5)
    ]);

    const results: any[] = [];

    // Process users
    users.data?.forEach(user => {
      results.push({
        id: user.id,
        type: 'user',
        description: `${user.role} - ${user.email}`,
        created_at: user.created_at
      });
    });

    // Process orders
    orders.data?.forEach(order => {
      results.push({
        id: order.id,
        type: 'order',
        description: `$${order.total_amount} - ${order.status}`,
        created_at: order.created_at
      });
    });

    // Process projects
    projects.data?.forEach(project => {
      results.push({
        id: project.id,
        type: 'project',
        description: `${project.title} - $${project.budget}`,
        created_at: project.created_at
      });
    });

    // Process services
    services.data?.forEach(service => {
      results.push({
        id: service.id,
        type: 'service',
        description: `${service.title} - $${service.price}`,
        created_at: service.created_at
      });
    });

    // Process disputes
    disputes.data?.forEach(dispute => {
      results.push({
        id: dispute.id,
        type: 'dispute',
        description: `${dispute.reason} - ${dispute.status}`,
        created_at: dispute.created_at
      });
    });

    // Sort by creation date (most recent first)
    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return res.status(200).json({
      success: true,
      results: results.slice(0, 10) // Limit to 10 results
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
