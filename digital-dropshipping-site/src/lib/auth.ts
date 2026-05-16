import { NextApiRequest } from 'next';
import { queryOne } from './mysql';
import { verifyToken, getTokenFromCookie } from './jwt';

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

async function fetchDbUser(userId: number): Promise<DbUser | null> {
  return Promise.race([
    queryOne<DbUser>(
      `SELECT id, email, display_name, role, is_active, email_verified, created_at
       FROM users WHERE id = ? AND is_active = 'TRUE'`,
      [userId],
    ),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200)),
  ]);
}

function buildAuthResult(dbUser: DbUser): AuthResult {
  return {
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.display_name || dbUser.email.split('@')[0],
      role: dbUser.role?.toUpperCase?.() ?? dbUser.role,
      isActive: dbUser.is_active === 'TRUE',
      emailVerified: dbUser.email_verified === 'TRUE',
      createdAt: dbUser.created_at,
    },
  };
}

/**
 * Server-side authentication helper.
 * Verifies session from (in priority order):
 *   1. JWT in httpOnly session_token cookie  ← new, most secure
 *   2. x-user-data request header            ← legacy, kept for backwards compat
 *   3. user object in request body           ← legacy, kept for backwards compat
 */
export async function verifyUserSession(req: NextApiRequest): Promise<AuthResult> {
  try {
    if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      return { success: false, error: 'Auth backend unavailable' };
    }

    // 1. JWT cookie (preferred)
    const cookieToken = getTokenFromCookie(req.headers.cookie);
    if (cookieToken) {
      const payload = verifyToken(cookieToken);
      if (!payload) return { success: false, error: 'Invalid or expired session' };

      const dbUser = await fetchDbUser(payload.userId);
      if (!dbUser) return { success: false, error: 'User not found or inactive' };
      return buildAuthResult(dbUser);
    }

    // 2. Legacy x-user-data header
    let user: any = null;
    const userData = req.headers['x-user-data'] as string | undefined;
    if (userData) {
      try { user = JSON.parse(userData); } catch { user = null; }
    }

    // 3. Legacy body.user
    if (!user && req.body && typeof req.body === 'object' && 'user' in req.body) {
      user = (req.body as any).user;
    }

    if (!user) return { success: false, error: 'No user session found' };

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const dbUser = await fetchDbUser(userId);
    if (!dbUser) return { success: false, error: 'Invalid user session' };
    return buildAuthResult(dbUser);
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Session verification failed' };
  }
}
