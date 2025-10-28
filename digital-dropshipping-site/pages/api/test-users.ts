import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Check what users exist
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, role, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        users: users || [],
        count: users?.length || 0
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    // Create a test admin user
    try {
      const { email = 'admin@uniti.com', password = 'testpass123' } = req.body;
      
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert the user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(400).json({ 
            error: 'User already exists',
            message: `User ${email} already exists in the database`
          });
        }
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({
        success: true,
        message: 'Test admin user created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
