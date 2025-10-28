import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from './supabase';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
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
    
    // Verify user exists in database and is active
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('id, email, role, is_active, email_verified, created_at')
      .eq('id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !dbUser) {
      return { success: false, error: 'Invalid user session' };
    }

    return {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        isActive: dbUser.is_active,
        emailVerified: dbUser.email_verified,
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

  if (authResult.user?.role !== 'ADMIN' && authResult.user?.role !== 'TEAM_MEMBER') {
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

  if (authResult.user?.role !== 'FREELANCER') {
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

  if (authResult.user?.role !== 'CLIENT') {
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
