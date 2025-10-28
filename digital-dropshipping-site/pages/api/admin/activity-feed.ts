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
    // Get activity type filter from query params
    const { type } = req.query;
    
    // Fetch comprehensive activities from Supabase
    const [
      recentUsers,
      recentFreelancers,
      recentClients,
      recentProjects,
      recentOrders,
      recentServices,
      recentQuoteRequests,
      recentMessages,
      recentReviews
    ] = await Promise.all([
      // Recent user registrations (all users)
      supabase
        .from('users')
        .select('id, email, role, created_at, is_active')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent freelancer registrations
      supabase
        .from('freelancers')
        .select('id, display_name, status, created_at, updated_at, rating')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent client registrations
      supabase
        .from('clients')
        .select('id, contact_name, company_name, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent projects
      supabase
        .from('projects')
        .select('id, title, status, budget, created_at, updated_at, client_id, freelancer_id')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent orders
      supabase
        .from('orders')
        .select('id, total_amount, status, created_at, updated_at, client_id')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent freelancer services
      supabase
        .from('freelancer_services')
        .select('id, title, price, status, created_at, updated_at, freelancer_id')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent quote requests
      supabase
        .from('quote_requests')
        .select('id, project_title, budget, status, created_at, updated_at, client_id')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent messages (if messages table exists)
      supabase
        .from('messages')
        .select('id, content, created_at, sender_id, receiver_id')
        .order('created_at', { ascending: false })
        .limit(15),
      
      // Recent reviews
      supabase
        .from('reviews')
        .select('id, rating, comment, created_at, reviewer_id, reviewee_id')
        .order('created_at', { ascending: false })
        .limit(15)
    ]);

    // Transform data into categorized activity feeds
    const userActivities: any[] = [];
    const clientActivities: any[] = [];
    const serviceActivities: any[] = [];

    // User Activities (registrations, profile updates, etc.)
    recentUsers.data?.forEach(user => {
      userActivities.push({
        id: `user_${user.id}`,
        type: 'user_registered',
        message: `${user.email.split('@')[0]} registered as ${user.role}`,
        timestamp: getTimeAgo(new Date(user.created_at)),
        user: user.email.split('@')[0],
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        createdAt: user.created_at
      });
    });

    recentFreelancers.data?.forEach(freelancer => {
      userActivities.push({
        id: `freelancer_${freelancer.id}`,
        type: 'freelancer_registered',
        message: `${freelancer.display_name} registered as Freelancer`,
        timestamp: getTimeAgo(new Date(freelancer.created_at)),
        user: freelancer.display_name,
        role: 'FREELANCER',
        status: freelancer.status,
        rating: freelancer.rating,
        createdAt: freelancer.created_at
      });
    });

    recentClients.data?.forEach(client => {
      userActivities.push({
        id: `client_${client.id}`,
        type: 'client_registered',
        message: `${client.contact_name} registered as Client`,
        timestamp: getTimeAgo(new Date(client.created_at)),
        user: client.contact_name,
        role: 'CLIENT',
        company: client.company_name,
        createdAt: client.created_at
      });
    });

    // Client Activities (orders, projects, quote requests)
    recentOrders.data?.forEach(order => {
      const statusDisplay = order.status === 'pending' ? 'placed' :
                           order.status === 'processing' ? 'processing' :
                           order.status === 'shipped' ? 'shipped' :
                           order.status === 'completed' ? 'completed' : order.status.toLowerCase();
      
      clientActivities.push({
        id: `order_${order.id}`,
        type: 'order_placed',
        message: `Order #${order.id} was ${statusDisplay}`,
        timestamp: getTimeAgo(new Date(order.created_at)),
        amount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      });
    });

    recentProjects.data?.forEach(project => {
      const statusDisplay = project.status === 'open' ? 'requested' :
                           project.status === 'assigned' ? 'assigned' :
                           project.status === 'completed' ? 'completed' :
                           project.status === 'cancelled' ? 'cancelled' : project.status.toLowerCase();
      
      clientActivities.push({
        id: `project_${project.id}`,
        type: 'project_created',
        message: `Project "${project.title}" was ${statusDisplay}`,
        timestamp: getTimeAgo(new Date(project.created_at)),
        budget: project.budget,
        status: project.status,
        createdAt: project.created_at
      });
    });

    recentQuoteRequests.data?.forEach(quote => {
      clientActivities.push({
        id: `quote_${quote.id}`,
        type: 'quote_request',
        message: `Quote request "${quote.project_title}" was submitted`,
        timestamp: getTimeAgo(new Date(quote.created_at)),
        budget: quote.budget,
        status: quote.status,
        createdAt: quote.created_at
      });
    });

    // Service Activities (service creation, updates, reviews)
    recentServices.data?.forEach(service => {
      serviceActivities.push({
        id: `service_${service.id}`,
        type: 'service_created',
        message: `New service "${service.title}" was created`,
        timestamp: getTimeAgo(new Date(service.created_at)),
        price: service.price,
        status: service.status,
        createdAt: service.created_at
      });
    });

    recentReviews.data?.forEach(review => {
      serviceActivities.push({
        id: `review_${review.id}`,
        type: 'review_posted',
        message: `New ${review.rating}-star review posted`,
        timestamp: getTimeAgo(new Date(review.created_at)),
        rating: review.rating,
        comment: review.comment,
        createdAt: review.created_at
      });
    });

    // Sort each category by creation date (most recent first)
    userActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    clientActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    serviceActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Return data based on type filter
    let responseData: any = {
      success: true,
      lastUpdated: new Date().toISOString()
    };

    if (type === 'users') {
      responseData.activities = userActivities.slice(0, 10);
      responseData.total = userActivities.length;
    } else if (type === 'clients') {
      responseData.activities = clientActivities.slice(0, 10);
      responseData.total = clientActivities.length;
    } else if (type === 'services') {
      responseData.activities = serviceActivities.slice(0, 10);
      responseData.total = serviceActivities.length;
    } else {
      // Return all activities combined
      const allActivities = [...userActivities, ...clientActivities, ...serviceActivities]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 15);
      
      responseData.activities = allActivities;
      responseData.total = allActivities.length;
      responseData.breakdown = {
        users: userActivities.length,
        clients: clientActivities.length,
        services: serviceActivities.length
      };
    }

    return res.status(200).json(responseData);

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
