import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { z } from 'zod';
import { query, queryOne } from '../../../src/lib/mysql';
import { sendPasswordResetEmail } from '../../../src/lib/email';
import { checkRateLimit } from '../../../src/lib/rateLimit';

const Schema = z.object({
  email: z.string().email().max(254),
});

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress ?? 'unknown';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 5 requests per 15 min per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit(`forgot-pw:${ip}`);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const parsed = Schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const { email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    // Always return success to prevent email enumeration
    const user = await queryOne<{ id: number; email: string; display_name: string | null }>(
      `SELECT id, email, display_name FROM users WHERE email = ? AND is_active = 'TRUE' LIMIT 1`,
      [normalizedEmail],
    );

    if (user) {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await query(
        `UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?`,
        [token, expiresAt, user.id],
      );

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const resetUrl = `${siteUrl}/reset-password?token=${token}`;

      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    // Always return the same response whether user exists or not
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
