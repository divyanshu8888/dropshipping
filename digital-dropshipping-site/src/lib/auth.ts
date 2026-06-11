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
 * Verifies the signed JWT in the httpOnly session_token cookie ONLY.
 *
 * Why: the previous x-user-data header / body.user fallbacks let anyone
 * impersonate any user by sending a forged id — no client code used them
 * (verified via codebase scan), so they were pure attack surface. Users with
 * pre-cookie sessions simply need to log in again.
 */
export async function verifyUserSession(req: NextApiRequest): Promise<AuthResult> {
  try {
    if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
      return { success: false, error: 'Auth backend unavailable' };
    }

    const cookieToken = getTokenFromCookie(req.headers.cookie);
    if (!cookieToken) return { success: false, error: 'No user session found' };

    const payload = verifyToken(cookieToken);
    if (!payload) return { success: false, error: 'Invalid or expired session' };

    const dbUser = await fetchDbUser(payload.userId);
    if (!dbUser) return { success: false, error: 'User not found or inactive' };
    return buildAuthResult(dbUser);
  } catch (error) {
    console.error('Session verification error:', error);
    return { success: false, error: 'Session verification failed' };
  }
}
