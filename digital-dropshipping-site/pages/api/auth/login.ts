import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '../../../src/lib/mysql';

type DbUser = {
  id: number;
  email: string;
  password_hash: string;
  display_name: string | null;
  role: 'admin' | 'freelancer' | 'client' | 'team_member';
  is_active: 'TRUE' | 'FALSE';
  email_verified: 'TRUE' | 'FALSE';
  created_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const normalizedEmail = String(email).toLowerCase();

    const user = await queryOne<DbUser>(
      `
        SELECT id, email, password_hash, display_name, role, is_active, email_verified, created_at
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    await query(
      `
        UPDATE users
        SET last_login = ?
        WHERE id = ?
      `,
      [new Date(), user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.display_name || user.email.split('@')[0],
        role: user.role.toUpperCase(),
        isActive: user.is_active === 'TRUE',
        emailVerified: user.email_verified === 'TRUE',
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
