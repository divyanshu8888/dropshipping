import { queryOne } from './mysql';

/**
 * ============================================================================
 * Apply eligibility — single source of truth, used by BOTH the proposals API
 * (server enforcement) and /api/freelancers/can-apply (client UX).
 *
 * Policy: a freelancer may apply to projects only when
 *   1. their account email is verified,
 *   2. their freelancer profile is admin-approved (KYC/verification), and
 *   3. their profile is >= 90% complete (same 8 signals the dashboard
 *      Profile Strength card measures).
 * ============================================================================
 */

export const APPLY_COMPLETION_THRESHOLD = 90;

export interface ApplyEligibility {
  canApply: boolean;
  emailVerified: boolean;
  verified: boolean; // freelancer profile approved
  completion: number; // 0-100
  missing: string[]; // human-readable items still to complete
  freelancerId: number | null;
}

export async function getApplyEligibility(userId: number): Promise<ApplyEligibility> {
  const row = await queryOne<{
    freelancer_id: number;
    status: string;
    email_verified: string;
    has_name: number;
    has_headline: number;
    has_bio: number;
    has_skills: number;
    has_portfolio: number;
    has_services: number;
    has_pricing: number;
    has_availability: number;
  }>(
    `SELECT
      f.id AS freelancer_id,
      f.status,
      u.email_verified,
      CASE WHEN f.display_name IS NOT NULL AND f.display_name != '' THEN 1 ELSE 0 END as has_name,
      CASE WHEN f.headline IS NOT NULL AND f.headline != '' THEN 1 ELSE 0 END as has_headline,
      CASE WHEN f.bio IS NOT NULL AND f.bio != '' THEN 1 ELSE 0 END as has_bio,
      CASE WHEN f.skills IS NOT NULL AND f.skills != '' THEN 1 ELSE 0 END as has_skills,
      CASE WHEN (SELECT COUNT(*) FROM portfolios WHERE freelancer_id = f.id) > 0 THEN 1 ELSE 0 END as has_portfolio,
      CASE WHEN (SELECT COUNT(*) FROM service_listings WHERE freelancer_id = f.id AND status = 'active') > 0 THEN 1 ELSE 0 END as has_services,
      CASE WHEN f.hourly_rate_cents IS NOT NULL AND f.hourly_rate_cents > 0 THEN 1 ELSE 0 END as has_pricing,
      CASE WHEN f.availability IS NOT NULL AND f.availability != '' THEN 1 ELSE 0 END as has_availability
    FROM freelancers f
    JOIN users u ON u.id = f.user_id
    WHERE f.user_id = ?
    LIMIT 1`,
    [userId],
  );

  if (!row) {
    return {
      canApply: false,
      emailVerified: false,
      verified: false,
      completion: 0,
      missing: ['Freelancer profile'],
      freelancerId: null,
    };
  }

  const checks: Array<[number, string]> = [
    [row.has_name, 'Display name'],
    [row.has_headline, 'Headline'],
    [row.has_bio, 'Bio'],
    [row.has_skills, 'Skills'],
    [row.has_portfolio, 'Portfolio sample'],
    [row.has_services, 'Active service listing'],
    [row.has_pricing, 'Hourly rate'],
    [row.has_availability, 'Availability'],
  ];

  const completed = checks.reduce((sum, [v]) => sum + (v ? 1 : 0), 0);
  const completion = Math.round((completed / checks.length) * 100);
  const missing = checks.filter(([v]) => !v).map(([, label]) => label);

  const emailVerified = row.email_verified === 'TRUE';
  const verified = row.status === 'approved';

  return {
    canApply: emailVerified && verified && completion >= APPLY_COMPLETION_THRESHOLD,
    emailVerified,
    verified,
    completion,
    missing,
    freelancerId: row.freelancer_id,
  };
}
