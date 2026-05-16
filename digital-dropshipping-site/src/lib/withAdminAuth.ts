import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, getTokenFromCookie } from './jwt';
import { verifyUserSession } from './auth';

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

/**
 * Wraps an admin API route handler with authentication + role enforcement.
 * Accepts both the new JWT cookie and the legacy x-user-data header so
 * existing frontend code keeps working during the auth migration.
 */
export function withAdminAuth(handler: Handler, requiredRole: 'ADMIN' | 'TEAM_MEMBER' | 'ANY' = 'ANY'): Handler {
  return async (req, res) => {
    // 1. Try JWT cookie first (new auth path)
    const cookieHeader = req.headers.cookie;
    const token = getTokenFromCookie(cookieHeader);

    if (token) {
      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      const role = payload.role.toUpperCase();
      if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
        return res.status(403).json({ error: 'Insufficient privileges' });
      }
      if (requiredRole !== 'ANY' && role !== 'ADMIN' && role !== 'TEAM_MEMBER') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      if (role !== 'ADMIN' && role !== 'TEAM_MEMBER') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      return handler(req, res);
    }

    // 2. Fall back to legacy header-based auth (existing frontend behaviour)
    const authResult = await verifyUserSession(req);
    if (!authResult.success || !authResult.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const role = authResult.user.role.toUpperCase();
    if (role !== 'ADMIN' && role !== 'TEAM_MEMBER') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    if (requiredRole === 'ADMIN' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    return handler(req, res);
  };
}
