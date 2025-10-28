import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { freelancerId, availability } = req.body;

    if (!freelancerId || !availability) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update freelancer availability
    const { data: freelancer, error } = await supabase
      .from('freelancers')
      .update({
        is_available: availability.isAvailable,
        working_hours: availability.workingHours,
        timezone: availability.timezone,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', freelancerId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return res.status(200).json({
      success: true,
      availability: {
        isAvailable: freelancer.is_available,
        workingHours: freelancer.working_hours,
        timezone: freelancer.timezone
      }
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json({
      error: 'Failed to update availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
