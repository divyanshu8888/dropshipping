import { NextApiRequest, NextApiResponse } from 'next';
import { requireRole, internalError } from '../../../src/lib/apiAuth';
import { getApplyEligibility } from '../../../src/lib/freelancerEligibility';

/**
 * GET /api/freelancers/can-apply
 * Why: the open-projects page needs to show an honest, specific gate
 * ("Verify your account" vs "Complete your profile (63%)") instead of a
 * generic disabled button. Enforcement itself also lives in /api/proposals.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  try {
    const eligibility = await getApplyEligibility(user.id);
    return res.status(200).json({ success: true, ...eligibility, freelancerId: undefined });
  } catch (error) {
    return internalError(res, 'freelancers/can-apply', error);
  }
}
