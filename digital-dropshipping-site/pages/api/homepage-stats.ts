import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../src/lib/mysql';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const results = await Promise.allSettled([
      query<{ count: number | string }>(
        'SELECT COUNT(*) as count FROM freelancers WHERE status = "approved" AND verification_state = "verified"'
      ),
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM projects WHERE status = "completed"'),
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM testimonials WHERE is_active = "TRUE"'),
      query<{ country: string | null }>(
        'SELECT DISTINCT country FROM freelancers WHERE country IS NOT NULL AND status = "approved" AND verification_state = "verified"'
      ),
      query<{ count: number | string }>(
        'SELECT COUNT(*) as count FROM projects WHERE status = "completed" AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)'
      ),
    ]);

    const readCount = (index: number) => {
      const result = results[index];
      if (result.status !== 'fulfilled') return 0;
      const rows = result.value as Array<{ count?: number | string }>;
      return Number(rows[0]?.count) || 0;
    };

    const countries = results[3].status === 'fulfilled' ? results[3].value : [];

    return res.status(200).json({
      totalFreelancers: readCount(0),
      totalProjects: readCount(1),
      totalReviews: readCount(2),
      countries: countries.length,
      projectsLast90Days: readCount(4),
    });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    return res.status(200).json({
      totalFreelancers: 0,
      totalProjects: 0,
      totalReviews: 0,
      countries: 0,
      projectsLast90Days: 0,
    });
  }
}
