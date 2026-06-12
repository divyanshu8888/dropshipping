import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { query, queryOne } from 'lib/mysql';
import { sendEmail } from '../../../src/lib/email';
import { requireAuth, internalError } from '../../../src/lib/apiAuth';
import { checkRateLimit } from '../../../src/lib/rateLimit';

/**
 * POLICY (contact changes): freelancers/clients may change their email or
 * phone, but at most once per 30 days per channel, always OTP-verified, and
 * every completed change is logged for admin moderation. Rationale: frequent
 * contact swapping is the main vector for taking deals off-platform.
 */
export const CONTACT_CHANGE_COOLDOWN_DAYS = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Why: previously trusted body userId — anyone could trigger changes for any account.
  const sessionUser = await requireAuth(req, res);
  if (!sessionUser) return;
  const userId = sessionUser.id;

  // Why: OTP emails are a spam/abuse vector without rate limiting.
  const rl = checkRateLimit(`change-otp:${userId}`);
  if (!rl.allowed) {
    res.setHeader('Retry-After', String(Math.ceil((rl.retryAfterMs ?? 60000) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { type, newValue } = req.body as { type: 'email' | 'phone'; newValue: string };

  if (!type || !newValue) return res.status(400).json({ error: 'Missing fields' });
  if (type !== 'email' && type !== 'phone') return res.status(400).json({ error: 'Invalid type' });
  if (typeof newValue !== 'string' || newValue.length > 254) {
    return res.status(400).json({ error: 'Invalid value' });
  }

  try {
    const user = await queryOne<{ id: number; email: string }>(
      'SELECT id, email FROM users WHERE id = ?',
      [userId],
    );
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Why: 30-day cooldown per channel, checked against the durable change log.
    try {
      const recent = await queryOne<{ id: number }>(
        `SELECT id FROM admin_notifications
         WHERE type = 'contact_change' AND user_id = ? AND message LIKE ?
           AND created_at >= DATE_SUB(NOW(), INTERVAL ${CONTACT_CHANGE_COOLDOWN_DAYS} DAY)
         LIMIT 1`,
        [userId, `${type}%`],
      );
      if (recent) {
        return res.status(429).json({
          error: `You can change your ${type} once every ${CONTACT_CHANGE_COOLDOWN_DAYS} days. Contact support if this is urgent.`,
        });
      }
    } catch {
      // Why: if the notifications table is missing, don't block the change — OTP still protects it.
    }

    if (type === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      const existing = await queryOne<{ id: number }>(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [newValue, userId],
      );
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + crypto.randomInt(900000)));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await query(
      `UPDATE users SET change_otp = ?, change_otp_expires_at = ?, change_otp_type = ?, change_otp_new_value = ? WHERE id = ?`,
      [otp, expiresAt, type, newValue, userId],
    );

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Unitiv';
    // Email change → send code to NEW email. Phone change → send to current email.
    const sendTo = type === 'email' ? newValue : user.email;
    const subject =
      type === 'email'
        ? `${siteName} — Verify your new email address`
        : `${siteName} — Verify your phone number change`;

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0b0c0f;color:#e2e8f0;padding:32px;border-radius:12px;">
        <h2 style="color:#67e8f9;margin-bottom:8px;">${siteName}</h2>
        <p style="color:#94a3b8;margin-bottom:24px;font-size:14px;">
          ${type === 'email'
            ? `You requested to change your email address to <strong style="color:#e2e8f0;">${newValue}</strong>.`
            : `You requested to change your phone number to <strong style="color:#e2e8f0;">${newValue}</strong>.`
          }
        </p>
        <p style="color:#cbd5e1;font-size:14px;margin-bottom:8px;">Your verification code is:</p>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:32px;font-weight:700;letter-spacing:12px;color:#67e8f9;">${otp}</span>
        </div>
        <p style="color:#64748b;font-size:12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `;

    await sendEmail({ to: sendTo, subject, html });
    return res.status(200).json({ success: true });
  } catch (error) {
    return internalError(res, 'auth/send-change-otp', error);
  }
}
