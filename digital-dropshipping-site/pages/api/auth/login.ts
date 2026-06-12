import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../../../src/lib/mysql';
import { signToken } from '../../../src/lib/jwt';
import { checkRateLimit } from '../../../src/lib/rateLimit';

type DbUser = {
  id: number;
  email: string;
  phone: string | null;
  password_hash: string;
  display_name: string | null;
  role: 'admin' | 'freelancer' | 'client' | 'team_member';
  is_active: 'TRUE' | 'FALSE';
  email_verified: 'TRUE' | 'FALSE';
  created_at: string;
};

const LoginSchema = z.object({
  email: z.string().email('Invalid email address').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

function buildCookieHeader(token: string, maxAge: number): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `session_token=${encodeURIComponent(token)}`,
    `HttpOnly`,
    isProd ? `Secure` : '',
    `SameSite=Strict`,
    `Path=/`,
    `Max-Age=${maxAge}`,
  ].filter(Boolean);
  return parts.join('; ');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting — keyed per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`);
  if (!rl.allowed) {
    const retryAfterSec = Math.ceil((rl.retryAfterMs ?? 60000) / 1000);
    res.setHeader('Retry-After', String(retryAfterSec));
    return res.status(429).json({ error: `Too many login attempts. Try again in ${retryAfterSec}s.` });
  }

  // Input validation
  const parsed = LoginSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { email, password } = parsed.data;

  try {
    const normalizedEmail = email.toLowerCase();

    const user = await queryOne<DbUser>(
      `SELECT id, email, phone, password_hash, display_name, role, is_active, email_verified, created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail],
    );

    // Constant-time path — compare even if no user found to prevent timing oracle
    const hashToCompare = user?.password_hash ?? '$2a$10$invalidhashinvalidhashinvalidhashinvalidhash';
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.is_active !== 'TRUE') {
      return res.status(403).json({ error: 'Account suspended. Please contact support.' });
    }

    await query(`UPDATE users SET last_login = ? WHERE id = ?`, [new Date(), user.id]);

    const roleUpper = user.role.toUpperCase() as string;

    // Issue JWT session cookie
    const token = signToken({ userId: user.id, email: user.email, role: roleUpper }, SESSION_COOKIE_MAX_AGE);
    res.setHeader('Set-Cookie', buildCookieHeader(token, SESSION_COOKIE_MAX_AGE));

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        // Why: dashboard contact card needs the phone in the session user.
        phone: user.phone ?? null,
        name: user.display_name || user.email.split('@')[0],
        role: roleUpper,
        isActive: user.is_active === 'TRUE',
        emailVerified: user.email_verified === 'TRUE',
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
