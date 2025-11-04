import { NextApiRequest, NextApiResponse } from 'next';
import { queryOne } from './mysql';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface DbUser {
  id: number;
  email: string;
  role: 'admin' | 'freelancer' | 'client' | 'team_member';
  is_active: 'TRUE' | 'FALSE';
  email_verified: 'TRUE' | 'FALSE';
  created_at: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Server-side authentication helper
 * Verifies user session and role for protected routes
 */
export async function verifyUserSession(req: NextApiRequest): Promise<AuthResult> {
  try {
    // Get user data from request headers (set by client)
    const userData = req.headers['x-user-data'] as string;
    
    if (!userData) {
      return { success: false, error: 'No user session found' };
    }

    const user = JSON.parse(userData);
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    
    // Verify user exists in database and is active
    const dbUser = await queryOne<DbUser>(`
      SELECT id, email, role, is_active, email_verified, created_at
      FROM users
      WHERE id = ? AND is_active = 'TRUE'
    `, [userId]);

    if (!dbUser) {
      return { success: false, error: 'Invalid user session' };
    }

    return {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        isActive: dbUser.is_active === 'TRUE',
        emailVerified: dbUser.email_verified === 'TRUE',
        createdAt: dbUser.created_at
      }
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Session verification failed' };
  }
}

/**
 * Check if user has admin privileges
 */
export async function requireAdmin(req: NextApiRequest): Promise<AuthResult> {
  const authResult = await verifyUserSession(req);
  
  if (!authResult.success) {
    return authResult;
  }

  // MySQL uses lowercase role values: 'admin', 'freelancer', 'client', 'team_member'
  if (authResult.user?.role !== 'admin' && authResult.user?.role !== 'team_member') {
    return { success: false, error: 'Admin access required' };
  }

  return authResult;
}

/**
 * Check if user has freelancer privileges
 */
export async function requireFreelancer(req: NextApiRequest): Promise<AuthResult> {
  const authResult = await verifyUserSession(req);
  
  if (!authResult.success) {
    return authResult;
  }

  // MySQL uses lowercase role values
  if (authResult.user?.role !== 'freelancer') {
    return { success: false, error: 'Freelancer access required' };
  }

  return authResult;
}

/**
 * Check if user has client privileges
 */
export async function requireClient(req: NextApiRequest): Promise<AuthResult> {
  const authResult = await verifyUserSession(req);
  
  if (!authResult.success) {
    return authResult;
  }

  // MySQL uses lowercase role values
  if (authResult.user?.role !== 'client') {
    return { success: false, error: 'Client access required' };
  }

  return authResult;
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(res: NextApiResponse, message: string = 'Unauthorized') {
  return res.status(401).json({ error: message });
}

/**
 * Send forbidden response
 */
export function sendForbidden(res: NextApiResponse, message: string = 'Forbidden') {
  return res.status(403).json({ error: message });
}
