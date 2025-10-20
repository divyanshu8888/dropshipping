import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch real statistics from Supabase
    const [
      totalFreelancers,
      totalProjects,
      totalReviews,
      countriesData
    ] = await Promise.all([
      // Count active freelancers
      supabase
        .from('freelancers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      
      // Count completed projects
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      
      // Count total reviews/testimonials
      supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true }),
      
      // Get unique countries from freelancers
      supabase
        .from('freelancers')
        .select('country')
        .not('country', 'is', null)
    ]);

    // Extract counts from Supabase responses
    const freelancerCount = totalFreelancers.count || 0;
    const projectCount = totalProjects.count || 0;
    const reviewCount = totalReviews.count || 0;
    const uniqueCountries = new Set(countriesData.data?.map(f => f.country)).size || 0;

    const stats = {
      totalFreelancers: freelancerCount,
      totalProjects: projectCount,
      totalReviews: reviewCount,
      countries: uniqueCountries
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    
    // Return zero stats if there's an error
    res.status(200).json({
      totalFreelancers: 0,
      totalProjects: 0,
      totalReviews: 0,
      countries: 0
    });
  }
}
