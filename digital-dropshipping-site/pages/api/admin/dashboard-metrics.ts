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
    
    // Fetch all metrics from Supabase
    const [
      totalUsers,
      totalProjects,
      activeUsers,
      pendingFreelancers,
      approvedFreelancers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      recentOrders,
      recentUsers,
      quoteRequests
    ] = await Promise.all([
      // Total users count (from freelancers and clients tables)
      Promise.all([
        supabase.from('freelancers').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]).then(([freelancers, clients]) => (freelancers.count || 0) + (clients.count || 0)),
      
      // Total projects count
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      
      // Active users (all users for now)
      Promise.all([
        supabase.from('freelancers').select('*', { count: 'exact', head: true }),
        supabase.from('clients').select('*', { count: 'exact', head: true })
      ]).then(([freelancers, clients]) => (freelancers.count || 0) + (clients.count || 0)),
      
      // Pending freelancer applications
      supabase.from('freelancers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      
      // Approved freelancers
      supabase.from('freelancers').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      
      // Total orders count
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      
      // Pending orders
      supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'processing']),
      
      // Completed orders
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      
      // Total products
      supabase.from('products').select('*', { count: 'exact', head: true }),
      
      // Recent orders (last 30 days)
      supabase.from('orders')
        .select('total_amount')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Recent users (last 30 days)
      Promise.all([
        supabase.from('freelancers').select('*').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('clients').select('*').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]).then(([freelancers, clients]) => [...(freelancers.data || []), ...(clients.data || [])]),
      
      // Quote requests count
      supabase.from('quote_requests').select('*', { count: 'exact', head: true })
    ]);

    // Calculate revenue from recent orders
    const revenueThisMonth = recentOrders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    // Calculate active users by role
    const activeFreelancers = approvedFreelancers.count || 0;
    const activeClients = (await supabase.from('clients').select('*', { count: 'exact', head: true })).count || 0;

    // Get project status breakdown
    const [newRequests, quotesUnderReview, sowSigned, inDelivery, completed] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'open'), // For now, using open as quotes under review
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'assigned'), // SOW signed = assigned
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'assigned'), // In delivery = assigned
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ]);

    // Calculate average response time (placeholder - needs actual calculation)
    const avgResponseTime = 0; // This would need to be calculated from actual data

    // Get system health metrics
    const systemHealth = {
      databaseLatency: 40, // This would be measured
      edgeFunctionErrors: 0, // This would be tracked
      emailApiUptime: 100, // This would be measured
      paymentWebhook: 'active', // This would be checked
      fileScanService: 'running' // This would be checked
    };

    const metrics = {
      // Top-level metrics
      totalProjects: totalProjects.count || 0,
      revenueThisMonth,
      pendingPayouts: 0, // This would need escrow/payment integration
      activeOrders: pendingOrders.count || 0,
      activeUsers,
      flaggedChats: 0, // This would need chat moderation integration
      openDisputes: 0, // This would need dispute system
      avgResponseTime,
      
      // Pipeline metrics
      newRequests: newRequests.count || 0,
      quotesUnderReview: quotesUnderReview.count || 0,
      sowSigned: sowSigned.count || 0,
      inDelivery: inDelivery.count || 0,
      completed: completed.count || 0,
      
      // User metrics
      totalUsers,
      activeFreelancers,
      activeClients,
      verifiedSuppliers: 0, // This would need supplier verification system
      applicationsPending: pendingFreelancers.count || 0,
      suspendedAccounts: 0, // Simplified for now
      
      // Order metrics
      totalOrders: totalOrders.count || 0,
      pendingOrders: pendingOrders.count || 0,
      completedOrders: completedOrders.count || 0,
      totalProducts: totalProducts.count || 0,
      
      // System health
      systemHealth,
      
      // Moderation metrics
      moderation: {
        messagesBlocked: 0,
        mutedUsers: 0,
        topViolationType: 'None',
        chatsUnderReview: 0
      }
    };

    return res.status(200).json({
      success: true,
      metrics,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
