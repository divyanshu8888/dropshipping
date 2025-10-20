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
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user by email in freelancers table first
    let { data: freelancer, error: freelancerError } = await supabase
      .from('freelancers')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    // If not found in freelancers, check clients table
    let { data: client, error: clientError } = null;
    if (!freelancer) {
      const result = await supabase
        .from('clients')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      client = result.data;
      clientError = result.error;
    }

    const user = freelancer || client;
    const userError = freelancerError || clientError;

    if (!user || userError) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Update last login time
    const tableName = freelancer ? 'freelancers' : 'clients';
    await supabase
      .from(tableName)
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Return user data (without password)
    return res.status(200).json({ 
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: freelancer ? 'FREELANCER' : 'CLIENT',
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
