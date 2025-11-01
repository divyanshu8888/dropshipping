import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch all approved freelancers from database (public view only)
    const { data: freelancers, error } = await supabase
      .from('freelancers_public')
      .select(`
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
      `)
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching freelancers:', error);
      return res.status(500).json({ message: 'Error fetching freelancers' });
    }

    return res.status(200).json(freelancers || []);
  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

