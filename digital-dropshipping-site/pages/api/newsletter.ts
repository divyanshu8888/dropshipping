import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../src/lib/mysql';

const ensureNewsletterTable = () =>
  query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      status ENUM('active','unsubscribed') NOT NULL DEFAULT 'active',
      subscribed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_newsletter_status (status)
    ) ENGINE=InnoDB
      DEFAULT CHARSET=utf8mb4
      COLLATE=utf8mb4_unicode_ci
  `);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    await ensureNewsletterTable();

    const existing = await queryOne<{ id: number; status: 'active' | 'unsubscribed' }>(
      'SELECT id, status FROM newsletter_subscriptions WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existing) {
      if (existing.status !== 'active') {
        await query(
          `UPDATE newsletter_subscriptions
           SET status = 'active', updated_at = NOW()
           WHERE id = ?`,
          [existing.id]
        );
      }

      return res.status(200).json({
        message: 'You are already subscribed!',
        alreadySubscribed: true,
      });
    }

    await query(
      `INSERT INTO newsletter_subscriptions (email, status, subscribed_at, updated_at)
       VALUES (?, 'active', NOW(), NOW())`,
      [normalizedEmail]
    );

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      message: 'Failed to subscribe. Please try again later.',
    });
  }
}
