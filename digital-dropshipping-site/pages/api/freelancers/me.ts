import { NextApiRequest, NextApiResponse } from 'next';
import { queryOne } from 'lib/mysql';
import { requireAuth, internalError } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity must come from the session cookie, not a client-supplied userId.
  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const userId = user.id;

    const row = await queryOne<{
      id: number;
      display_name: string | null;
      rating: number | null;
      total_reviews: number | null;
      completed_projects: number | null;
    }>(
      `
        SELECT id, display_name, rating, total_reviews, completed_projects
        FROM freelancers
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (!row) {
      return res.status(200).json({
        success: true,
        profile: null,
      });
    }

    return res.status(200).json({
      success: true,
      profile: {
        freelancerId: row.id,
        name: row.display_name,
        rating: row.rating,
        totalReviews: row.total_reviews,
        completedProjects: row.completed_projects,
      },
    });
  } catch (error) {
    return internalError(res, 'freelancers/me', error);
  }
}


