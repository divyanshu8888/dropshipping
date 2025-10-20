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
    // Fetch recent activities from Supabase
    const [
      recentFreelancers,
      recentClients,
      recentProjects,
      recentOrders,
      recentServices,
      recentQuoteRequests
    ] = await Promise.all([
      // Recent freelancer registrations
      supabase
        .from('freelancers')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent client registrations
      supabase
        .from('clients')
        .select('id, name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent projects
      supabase
        .from('projects')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent orders
      supabase
        .from('orders')
        .select('id, total_amount, status, created_at, customer_name')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent services
      supabase
        .from('services')
        .select('id, title, created_at, freelancer_id')
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Recent quote requests
      supabase
        .from('quote_requests')
        .select('id, project_title, status, created_at, client_name')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    // Transform data into activity feed format
    const activities: any[] = [];

    // Add freelancer registration activities
    recentFreelancers.data?.forEach(freelancer => {
      activities.push({
        id: `freelancer_${freelancer.id}`,
        type: 'user_registered',
        message: `${freelancer.name} registered as Freelancer`,
        timestamp: getTimeAgo(new Date(freelancer.created_at)),
        user: freelancer.name,
        createdAt: freelancer.created_at
      });
    });

    // Add client registration activities
    recentClients.data?.forEach(client => {
      activities.push({
        id: `client_${client.id}`,
        type: 'user_registered',
        message: `${client.name} registered as Client`,
        timestamp: getTimeAgo(new Date(client.created_at)),
        user: client.name,
        createdAt: client.created_at
      });
    });

    // Add project activities
    recentProjects.data?.forEach(project => {
      const statusDisplay = project.status === 'open' ? 'requested' :
                           project.status === 'assigned' ? 'assigned' :
                           project.status === 'completed' ? 'completed' :
                           project.status === 'cancelled' ? 'cancelled' : project.status.toLowerCase();
      
      activities.push({
        id: `project_${project.id}`,
        type: 'work_request',
        message: `Project "${project.title}" was ${statusDisplay}`,
        timestamp: getTimeAgo(new Date(project.created_at)),
        createdAt: project.created_at
      });
    });

    // Add order activities
    recentOrders.data?.forEach(order => {
      const statusDisplay = order.status === 'pending' ? 'placed' :
                           order.status === 'processing' ? 'processing' :
                           order.status === 'shipped' ? 'shipped' :
                           order.status === 'completed' ? 'completed' : order.status.toLowerCase();
      
      activities.push({
        id: `order_${order.id}`,
        type: 'order_placed',
        message: `Order #${order.id} was ${statusDisplay}`,
        timestamp: getTimeAgo(new Date(order.created_at)),
        user: order.customer_name,
        amount: order.total_amount,
        createdAt: order.created_at
      });
    });

    // Add service activities
    recentServices.data?.forEach(service => {
      activities.push({
        id: `service_${service.id}`,
        type: 'service_created',
        message: `New service "${service.title}" was created`,
        timestamp: getTimeAgo(new Date(service.created_at)),
        createdAt: service.created_at
      });
    });

    // Add quote request activities
    recentQuoteRequests.data?.forEach(quote => {
      activities.push({
        id: `quote_${quote.id}`,
        type: 'quote_request',
        message: `Quote request "${quote.project_title}" was submitted`,
        timestamp: getTimeAgo(new Date(quote.created_at)),
        user: quote.client_name,
        createdAt: quote.created_at
      });
    });

    // Sort by creation date (most recent first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Take only the most recent 10 activities
    const recentActivities = activities.slice(0, 10);

    return res.status(200).json({
      success: true,
      activities: recentActivities,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch activity feed',
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
