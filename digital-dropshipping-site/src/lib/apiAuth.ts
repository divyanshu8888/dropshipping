import { NextApiRequest, NextApiResponse } from 'next';
import { verifyUserSession, AuthenticatedUser } from './auth';

/**
 * ============================================================================
 * API Route Guards
 * ============================================================================
 * Shared server-side auth/validation helpers so every API route follows the
 * same pattern: method check → auth check → input validation → DB → response.
 *
 * Usage:
 *   const user = await requireAuth(req, res);          // 401 if not logged in
 *   if (!user) return;
 *
 *   const admin = await requireRole(req, res, ['ADMIN', 'TEAM_MEMBER']);
 *   if (!admin) return;
 * ============================================================================
 */

export type Role = 'ADMIN' | 'TEAM_MEMBER' | 'FREELANCER' | 'CLIENT';

/**
 * Validates the session (JWT cookie preferred, legacy fallbacks supported by
 * verifyUserSession). Sends 401 and returns null when unauthenticated.
 */
// Why: ~70 API routes had no server-side auth; this gives them a one-line guard.
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<AuthenticatedUser | null> {
  const result = await verifyUserSession(req);
  if (!result.success || !result.user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  return result.user;
}

/**
 * Like requireAuth, but additionally enforces a role allow-list.
 * Sends 403 and returns null when the role doesn't match.
 */
// Why: role checks were client-side only; direct fetches could cross roles.
export async function requireRole(
  req: NextApiRequest,
  res: NextApiResponse,
  roles: Role[],
): Promise<AuthenticatedUser | null> {
  const user = await requireAuth(req, res);
  if (!user) return null;

  const role = (user.role || '').toUpperCase() as Role;
  if (!roles.includes(role)) {
    res.status(403).json({ error: 'Insufficient privileges' });
    return null;
  }
  return user;
}

/** Shorthand for admin-or-team-member endpoints. */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse,
  adminOnly = false,
): Promise<AuthenticatedUser | null> {
  return requireRole(req, res, adminOnly ? ['ADMIN'] : ['ADMIN', 'TEAM_MEMBER']);
}

/**
 * Parses an ID-ish value, accepting only positive integers.
 * Returns null for strings, negatives, floats, NaN.
 */
// Why: URL params were cast with Number() which accepts floats/negatives.
export function parsePositiveInt(value: unknown): number | null {
  const str = Array.isArray(value) ? value[0] : value;
  if (typeof str !== 'string' && typeof str !== 'number') return null;
  const s = String(str).trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n > 0 && Number.isSafeInteger(n) ? n : null;
}

/**
 * Logs the full error server-side; returns only a generic message to clients.
 */
// Why: several routes returned error.message / SQL details in 500 responses.
export function internalError(
  res: NextApiResponse,
  scope: string,
  error: unknown,
): void {
  console.error(`[${scope}]`, error);
  res.status(500).json({ error: 'Internal server error' });
}

/** Strips HTML tags + trims; basic XSS hygiene for user-supplied text. */
// Why: user text is rendered in dashboards/admin without sanitization.
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
}
