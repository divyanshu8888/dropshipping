import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../../../src/lib/mysql';
import { checkRateLimit } from '../../../src/lib/rateLimit';
import { requireAuth, internalError } from '../../../src/lib/apiAuth';

// Why: body size limit - this route only ever receives two short strings.
export const config = {
  api: { bodyParser: { sizeLimit: '10kb' } },
};

const Schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity comes from the verified session cookie only.
  const user = await requireAuth(req, res);
  if (!user) return;

  // Why: rate limit guessing of the current password.
  const rl = checkRateLimit(`change-pw:${user.id}`);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(Math.ceil((rl.retryAfterMs ?? 60000) / 1000)));
    return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
  }

  const parsed = Schema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { currentPassword, newPassword } = parsed.data;

  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different from your current password.' });
  }

  try {
    const row = await queryOne<{ password_hash: string }>(
      `SELECT password_hash FROM users WHERE id = ? AND is_active = 'TRUE' LIMIT 1`,
      [user.id],
    );
    if (!row) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Why: re-verify the current password so a hijacked session alone cannot rotate credentials.
    const valid = await bcrypt.compare(currentPassword, row.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    try {
      // Why: also clear any pending reset token so an old email link cannot undo this change.
      await query(
        `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?`,
        [passwordHash, user.id],
      );
    } catch (e: any) {
      // Why: some installs lack the reset_token columns - the password change must still succeed.
      if (e?.code === 'ER_BAD_FIELD_ERROR') {
        await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, user.id]);
      } else {
        throw e;
      }
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    return internalError(res, 'auth/change-password', error);
  }
}
