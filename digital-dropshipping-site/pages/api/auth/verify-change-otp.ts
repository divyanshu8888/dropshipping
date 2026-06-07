import type { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

interface UserRow {
  id: number;
  change_otp: string | null;
  change_otp_expires_at: string | null;
  change_otp_type: string | null;
  change_otp_new_value: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { userId, type, otp, newValue } = req.body as {
    userId: number | string;
    type: 'email' | 'phone';
    otp: string;
    newValue: string;
  };

  if (!userId || !type || !otp || !newValue) return res.status(400).json({ error: 'Missing fields' });

  const row = await queryOne<UserRow>(
    `SELECT id, change_otp, change_otp_expires_at, change_otp_type, change_otp_new_value
     FROM users WHERE id = ?`,
    [userId]
  );

  if (!row) return res.status(404).json({ error: 'User not found' });

  if (!row.change_otp || !row.change_otp_expires_at) {
    return res.status(400).json({ error: 'No verification code pending. Please request a new one.' });
  }

  if (row.change_otp_type !== type) {
    return res.status(400).json({ error: 'Verification type mismatch' });
  }

  if (row.change_otp_new_value !== newValue) {
    return res.status(400).json({ error: 'Value mismatch. Please start the process again.' });
  }

  // Check expiry
  if (new Date(row.change_otp_expires_at) < new Date()) {
    await query(
      `UPDATE users SET change_otp = NULL, change_otp_expires_at = NULL, change_otp_type = NULL, change_otp_new_value = NULL WHERE id = ?`,
      [userId]
    );
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  // Check OTP
  if (row.change_otp !== otp.trim()) {
    return res.status(400).json({ error: 'Incorrect verification code' });
  }

  // Apply the change
  if (type === 'email') {
    const taken = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = ? AND id != ?', [newValue, userId]);
    if (taken) {
      await query(
        `UPDATE users SET change_otp = NULL, change_otp_expires_at = NULL, change_otp_type = NULL, change_otp_new_value = NULL WHERE id = ?`,
        [userId]
      );
      return res.status(409).json({ error: 'Email already in use by another account' });
    }
    await query(
      `UPDATE users SET email = ?, change_otp = NULL, change_otp_expires_at = NULL, change_otp_type = NULL, change_otp_new_value = NULL WHERE id = ?`,
      [newValue, userId]
    );
  } else {
    await query(
      `UPDATE users SET phone = ?, change_otp = NULL, change_otp_expires_at = NULL, change_otp_type = NULL, change_otp_new_value = NULL WHERE id = ?`,
      [newValue, userId]
    );
  }

  return res.status(200).json({ success: true });
}
