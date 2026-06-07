import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../../../src/lib/mysql';
import { checkRateLimit } from '../../../src/lib/rateLimit';

const Schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
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

  const ip = getClientIp(req);
  const rl = checkRateLimit(`reset-pw:${ip}`);
  if (!rl.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const parsed = Schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { token, password } = parsed.data;

  try {
    // Look up token — must not be expired
    const user = await queryOne<{ id: number }>(
      `SELECT id FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW() LIMIT 1`,
      [token],
    );

    if (!user) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
    }

    // Hash the new password and clear the token in one update
    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?`,
      [passwordHash, user.id],
    );

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
