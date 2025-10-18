import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabase-admin';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, userType } = req.body;

    // Validate required fields
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in users table
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        name,
        role: userType,
        password: hashedPassword // Note: In production, use proper auth system
      }])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // If freelancer, create a minimal entry in freelancers table (will be completed later)
    if (userType === 'freelancer') {
      const { error: freelancerError } = await supabaseAdmin
        .from('freelancers')
        .insert([{
          display_name: name,
          title: 'Profile Pending',
          bio: 'Profile setup in progress',
          description: 'Freelancer profile is being completed',
          country: '',
          skills: [],
          hourly_rate: 0,
          base_fee: 0,
          contact_email: email,
          status: 'pending_setup' // New status for incomplete profiles
        }]);

      if (freelancerError) {
        console.error('Error creating freelancer profile:', freelancerError);
        // Don't fail the signup if freelancer profile creation fails
        // The user account was created successfully, they can complete profile later
      }
    }

    return res.status(201).json({ 
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
