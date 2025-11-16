import { NextApiRequest } from 'next';
import { queryOne } from './mysql';

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface DbUser {
  id: number;
  email: string;
  display_name: string | null;
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
 * Verifies user session for protected routes
 */
export async function verifyUserSession(req: NextApiRequest): Promise<AuthResult> {
  try {
    // Get user data from request headers (set by client)
    const userData = req.headers['x-user-data'] as string | undefined;

    let user: any | null = null;
    if (userData) {
      try {
        user = JSON.parse(userData);
      } catch {
        user = null;
      }
    }

    // Fallback: accept JSON body with { user } from AuthProvider
    if (!user && req.body && typeof req.body === 'object' && 'user' in req.body) {
      user = (req.body as any).user;
    }

    if (!user) {
      return { success: false, error: 'No user session found' };
    }

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    
    // Fail fast when DB is not configured in dev
    if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      return { success: false, error: 'Auth backend unavailable' };
    }

    // Verify user exists in database and is active
    const dbUser = await Promise.race([
      queryOne<DbUser>(`
        SELECT id, email, display_name, role, is_active, email_verified, created_at
        FROM users
        WHERE id = ? AND is_active = 'TRUE'
      `, [userId]),
      new Promise<DbUser | null>((resolve) => setTimeout(() => resolve(null), 1200))
    ]);

    if (!dbUser) {
      return { success: false, error: 'Invalid user session' };
    }

    return {
      success: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.display_name || dbUser.email.split('@')[0],
        role: dbUser.role?.toUpperCase?.() || dbUser.role,
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
