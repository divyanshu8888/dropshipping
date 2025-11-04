import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../src/lib/mysql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch all approved freelancers from MySQL database
    const freelancers = await query(`
      SELECT 
        id, 
        display_name, 
        title, 
        description, 
        country, 
        skills, 
        rating, 
        total_reviews, 
        completed_projects, 
        response_time, 
        availability
      FROM freelancers
      WHERE status = 'approved'
      ORDER BY rating DESC
    `);

    if (!freelancers) {
      console.error('Error fetching freelancers');
      return res.status(500).json({ message: 'Error fetching freelancers' });
    }

    return res.status(200).json(freelancers || []);
  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

