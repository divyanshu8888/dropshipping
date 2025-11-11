import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, tableExists } from '../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type } = req.query;

    const [
      hasUsersTable,
      hasFreelancersTable,
      hasClientsTable,
      hasProjectsTable,
      hasOrdersTable,
      hasServicesTable,
      hasQuoteRequestsTable,
      hasReviewsTable
    ] = await Promise.all([
      tableExists('users'),
      tableExists('freelancers'),
      tableExists('clients'),
      tableExists('projects'),
      tableExists('orders'),
      tableExists('freelancer_services'),
      tableExists('quote_requests'),
      tableExists('reviews')
    ]);

    const [
      users,
      freelancers,
      clients,
      projects,
      orders,
      services,
      quotes,
      reviews
    ] = await Promise.all([
      hasUsersTable
        ? safeQuery(
            `SELECT id, email, role, is_active, created_at
               FROM users
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-users'
          )
        : [],
      hasFreelancersTable
        ? safeQuery(
            `SELECT id, display_name, status, rating, created_at
               FROM freelancers
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-freelancers'
          )
        : [],
      hasClientsTable
        ? safeQuery(
            `SELECT id, contact_name, company_name, created_at
               FROM clients
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-clients'
          )
        : [],
      hasProjectsTable
        ? safeQuery(
            `SELECT id, title, status, budget, created_at
               FROM projects
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-projects'
          )
        : [],
      hasOrdersTable
        ? safeQuery(
            `SELECT id, total_amount, status, created_at
               FROM orders
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-orders'
          )
        : [],
      hasServicesTable
        ? safeQuery(
            `SELECT id, title, price, status, created_at
               FROM freelancer_services
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-services'
          )
        : [],
      hasQuoteRequestsTable
        ? safeQuery(
            `SELECT id, project_title, budget, status, created_at
               FROM quote_requests
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-quote-requests'
          )
        : [],
      hasReviewsTable
        ? safeQuery(
            `SELECT id, rating, comment, created_at
               FROM reviews
              ORDER BY created_at DESC
              LIMIT 20`,
            [],
            'activity-reviews'
          )
        : []
    ]);

    const userActivities: any[] = [];
    const clientActivities: any[] = [];
    const serviceActivities: any[] = [];

    users.forEach((user: any) => {
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

    freelancers.forEach((freelancer: any) => {
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

    clients.forEach((client: any) => {
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

    orders.forEach((order: any) => {
      clientActivities.push({
        id: `order_${order.id}`,
        type: 'order_placed',
        message: `Order #${order.id} was ${order.status.toLowerCase()}`,
        timestamp: getTimeAgo(new Date(order.created_at)),
        amount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      });
    });

    projects.forEach((project: any) => {
      clientActivities.push({
        id: `project_${project.id}`,
        type: 'project_created',
        message: `Project "${project.title}" was ${project.status.toLowerCase()}`,
        timestamp: getTimeAgo(new Date(project.created_at)),
        budget: project.budget,
        status: project.status,
        createdAt: project.created_at
      });
    });

    quotes.forEach((quote: any) => {
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

    services.forEach((service: any) => {
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

    reviews.forEach((review: any) => {
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

    userActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    clientActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    serviceActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const responseData: any = {
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
