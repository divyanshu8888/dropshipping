import { NextApiRequest, NextApiResponse } from 'next';
import { queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userIdRaw = req.query.userId;
    const userId = Array.isArray(userIdRaw) ? Number(userIdRaw[0]) : Number(userIdRaw);

    if (!userId || Number.isNaN(userId)) {
      return res.status(400).json({ error: 'Missing or invalid userId' });
    }

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
    console.error('Error fetching freelancer profile summary:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}


