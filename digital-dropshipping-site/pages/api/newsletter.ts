import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    // Validate email format
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing subscription:', checkError);
      return res.status(500).json({ message: 'Error checking subscription' });
    }

    if (existing) {
      return res.status(200).json({ 
        message: 'You are already subscribed!',
        alreadySubscribed: true 
      });
    }

    // Insert newsletter subscription
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .insert({
        email: email.toLowerCase(),
        subscribed_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // If table doesn't exist, provide helpful error message
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.error('Newsletter subscriptions table does not exist. Please run the SQL migration to create it.');
        return res.status(500).json({ 
          message: 'Newsletter service is not yet configured. Please contact support.',
          error: 'Table not found'
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to subscribe. Please try again later.' 
      });
    }

    return res.status(201).json({ 
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      message: 'An unexpected error occurred. Please try again later.' 
    });
  }
}

