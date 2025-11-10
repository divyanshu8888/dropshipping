import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import type { ResultSetHeader } from 'mysql2';
import { queryOne, transaction } from '../../../src/lib/mysql';

type DbUser = {
  id: number;
  email: string;
  display_name: string | null;
  role: 'admin' | 'freelancer' | 'client' | 'team_member';
  is_active: 'TRUE' | 'FALSE';
  email_verified: 'TRUE' | 'FALSE';
  created_at: string;
};

const VALID_ROLES = ['ADMIN', 'TEAM_MEMBER', 'FREELANCER', 'CLIENT'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

const ROLE_TO_DB_ROLE: Record<ValidRole, DbUser['role']> = {
  ADMIN: 'admin',
  TEAM_MEMBER: 'team_member',
  FREELANCER: 'freelancer',
  CLIENT: 'client'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password, userType } = req.body ?? {};

    if (!name || !email || !password || !userType) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const normalizedUserType = String(userType).toUpperCase() as ValidRole;

    if (!VALID_ROLES.includes(normalizedUserType)) {
      return res.status(400).json({
        error: 'Invalid user type'
      });
    }

    if (normalizedUserType !== 'FREELANCER' && normalizedUserType !== 'CLIENT') {
      return res.status(400).json({
        error: 'Only FREELANCER and CLIENT roles are supported for signup'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    const normalizedEmail = String(email).toLowerCase();

    const existingUser = await queryOne<{ id: number }>(
      `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const dbRole = ROLE_TO_DB_ROLE[normalizedUserType];

    const userId = await transaction(async (connection) => {
      const [userResult] = await connection.execute<ResultSetHeader>(
        `
          INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified)
          VALUES (?, ?, ?, ?, 'TRUE', 'FALSE')
        `,
        [normalizedEmail, hashedPassword, dbRole, name]
      );

      const { insertId } = userResult;

      if (!insertId) {
        throw new Error('Failed to create user account');
      }

      if (normalizedUserType === 'FREELANCER') {
        await connection.execute(
          `
            INSERT INTO freelancers (user_id, display_name)
            VALUES (?, ?)
          `,
          [insertId, name]
        );
      } else if (normalizedUserType === 'CLIENT') {
        await connection.execute(
          `
            INSERT INTO clients (
              owner_id,
              user_id,
              client_type,
              company_name,
              display_name,
              contact_name,
              contact_email
            )
            VALUES (?, ?, 'individual', ?, ?, ?, ?)
          `,
          [insertId, insertId, name, name, name, normalizedEmail]
        );
      }

      return insertId;
    });

    const newUser = await queryOne<DbUser>(
      `
        SELECT id, email, display_name, role, is_active, email_verified, created_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!newUser) {
      throw new Error('User was created but could not be retrieved');
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        name: newUser.display_name ?? newUser.email.split('@')[0],
        email: newUser.email,
        role: normalizedUserType
      }
    });
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
