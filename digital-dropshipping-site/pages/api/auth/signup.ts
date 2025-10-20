import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';
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

    // Validate user type
    const validRoles = ['ADMIN', 'TEAM_MEMBER', 'FREELANCER', 'CLIENT'];
    if (!validRoles.includes(userType)) {
      return res.status(400).json({ 
        error: 'Invalid user type' 
      });
    }

    // Check if user already exists in freelancers table
    const { data: existingFreelancer } = await supabase
      .from('freelancers')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    // Check if user already exists in clients table
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingFreelancer || existingClient) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user based on userType
    let newUser;
    if (userType === 'FREELANCER') {
      const { data, error } = await supabase
        .from('freelancers')
        .insert({
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating freelancer:', error);
        return res.status(500).json({ error: 'Failed to create account' });
      }
      newUser = data;
    } else if (userType === 'CLIENT') {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          email: email.toLowerCase(),
          name,
          password: hashedPassword
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        return res.status(500).json({ error: 'Failed to create account' });
      }
      newUser = data;
    } else {
      return res.status(400).json({ 
        error: 'Only FREELANCER and CLIENT roles are supported for signup' 
      });
    }

    return res.status(201).json({ 
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: userType
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
