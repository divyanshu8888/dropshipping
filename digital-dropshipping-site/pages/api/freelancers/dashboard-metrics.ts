import { NextApiRequest, NextApiResponse } from 'next';
import { query } from 'lib/mysql';
import { requireRole, internalError } from '../../../src/lib/apiAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: metrics are private; identity comes from the session cookie, not query params.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  try {
    const userId = user.id;

    // Get freelancer record
    const freelancer = await query<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!freelancer || freelancer.length === 0) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const freelancerDbId = freelancer[0].id;

    // 1. Open Milestones (due in next 7 days)
    const openMilestones = await query<{
      count: number;
      total_cents: number;
      due_count: number;
    }>(
      `SELECT 
        COUNT(*) as count,
        COALESCE(SUM(m.amount_cents), 0) as total_cents,
        SUM(CASE WHEN m.due_date <= DATE_ADD(NOW(), INTERVAL 7 DAY) AND m.due_date >= CURDATE() THEN 1 ELSE 0 END) as due_count
      FROM milestones m
      JOIN contracts c ON c.id = m.contract_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.freelancer_id = ? 
        AND m.status IN ('funded', 'in_progress', 'submitted')
      `,
      [freelancerDbId]
    );

    // 2. Unbilled / In Escrow
    const earnings = await query<{
      unbilled_cents: number;
      escrow_cents: number;
      pending_cents: number;
    }>(
      `SELECT 
        COALESCE(SUM(CASE WHEN m.status = 'submitted' AND i.id IS NULL THEN m.amount_cents ELSE 0 END), 0) as unbilled_cents,
        COALESCE(SUM(CASE WHEN m.status = 'funded' THEN m.amount_cents ELSE 0 END), 0) as escrow_cents,
        COALESCE(SUM(CASE WHEN i.status = 'issued' THEN i.amount_cents ELSE 0 END), 0) as pending_cents
      FROM milestones m
      JOIN contracts c ON c.id = m.contract_id
      JOIN projects p ON p.id = c.project_id
      LEFT JOIN invoices i ON i.milestone_id = m.id
      WHERE p.freelancer_id = ?
      `,
      [freelancerDbId]
    );

    // 3. Avg Response Time (7 days) - from messages
    // Calculate time between client message and freelancer response
    const responseTime = await query<{
      avg_hours: number;
    }>(
      `SELECT 
        COALESCE(AVG(TIMESTAMPDIFF(HOUR, client_msg.created_at, freelancer_msg.created_at)), 0) as avg_hours
      FROM messages client_msg
      JOIN conversations conv ON conv.id = client_msg.conversation_id
      JOIN projects p ON p.id = conv.project_id
      JOIN messages freelancer_msg ON freelancer_msg.conversation_id = client_msg.conversation_id
        AND freelancer_msg.created_at > client_msg.created_at
        AND freelancer_msg.sender_id = ?
      WHERE p.freelancer_id = ?
        AND client_msg.sender_id != ?
        AND client_msg.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      LIMIT 1
      `,
      [userId, freelancerDbId, userId]
    );

    // 4. On-time Delivery (30 days) - based on milestones
    const onTimeDelivery = await query<{
      total: number;
      on_time: number;
    }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN m.due_date >= COALESCE(m.updated_at, m.created_at) OR m.status = 'approved' THEN 1 ELSE 0 END) as on_time
      FROM milestones m
      JOIN contracts c ON c.id = m.contract_id
      JOIN projects p ON p.id = c.project_id
      WHERE p.freelancer_id = ?
        AND m.status IN ('approved', 'released')
        AND m.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `,
      [freelancerDbId]
    );

    // 5. Profile Strength - calculate based on completed fields
    const profileData = await query<{
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
        CASE WHEN f.display_name IS NOT NULL AND f.display_name != '' THEN 1 ELSE 0 END as has_name,
        CASE WHEN f.headline IS NOT NULL AND f.headline != '' THEN 1 ELSE 0 END as has_headline,
        CASE WHEN f.bio IS NOT NULL AND f.bio != '' THEN 1 ELSE 0 END as has_bio,
        CASE WHEN f.skills IS NOT NULL AND f.skills != '' THEN 1 ELSE 0 END as has_skills,
        CASE WHEN (SELECT COUNT(*) FROM portfolios WHERE freelancer_id = f.id) > 0 THEN 1 ELSE 0 END as has_portfolio,
        CASE WHEN (SELECT COUNT(*) FROM service_listings WHERE freelancer_id = f.id AND status = 'active') > 0 THEN 1 ELSE 0 END as has_services,
        CASE WHEN f.hourly_rate_cents IS NOT NULL AND f.hourly_rate_cents > 0 THEN 1 ELSE 0 END as has_pricing,
        CASE WHEN f.availability IS NOT NULL AND f.availability != '' THEN 1 ELSE 0 END as has_availability
      FROM freelancers f
      WHERE f.id = ?
      LIMIT 1
      `,
      [freelancerDbId]
    );

    // 6. Win Rate (30 days) - proposals accepted vs total
    const winRate = await query<{
      total: number;
      won: number;
    }>(
      `SELECT 
        COUNT(DISTINCT p.id) as total,
        SUM(CASE WHEN p.status IN ('contracted', 'in_progress', 'delivered', 'completed') THEN 1 ELSE 0 END) as won
      FROM projects p
      WHERE p.freelancer_id = ?
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `,
      [freelancerDbId]
    );

    // Calculate profile strength percentage
    let profileStrength = 0;
    if (profileData && profileData.length > 0) {
      const p = profileData[0];
      const totalFields = 8;
      const completedFields = 
        p.has_name + p.has_headline + p.has_bio + p.has_skills + 
        p.has_portfolio + p.has_services + p.has_pricing + p.has_availability;
      profileStrength = Math.round((completedFields / totalFields) * 100);
    }

    // Calculate on-time delivery percentage
    let onTimePercentage = 0;
    if (onTimeDelivery && onTimeDelivery.length > 0 && onTimeDelivery[0].total > 0) {
      onTimePercentage = Math.round((onTimeDelivery[0].on_time / onTimeDelivery[0].total) * 100);
    }

    // Calculate win rate percentage
    let winRatePercentage = 0;
    if (winRate && winRate.length > 0 && winRate[0].total > 0) {
      winRatePercentage = Math.round((winRate[0].won / winRate[0].total) * 100);
    }

    return res.status(200).json({
      success: true,
      metrics: {
        openMilestones: {
          count: openMilestones[0]?.count || 0,
          totalCents: openMilestones[0]?.total_cents || 0,
          dueIn7Days: openMilestones[0]?.due_count || 0
        },
        earnings: {
          unbilledCents: earnings[0]?.unbilled_cents || 0,
          escrowCents: earnings[0]?.escrow_cents || 0,
          pendingCents: earnings[0]?.pending_cents || 0
        },
        avgResponseTime: {
          hours: responseTime[0]?.avg_hours || 0
        },
        onTimeDelivery: {
          percentage: onTimePercentage
        },
        profileStrength: {
          percentage: profileStrength
        },
        winRate: {
          percentage: winRatePercentage,
          total: winRate[0]?.total || 0,
          won: winRate[0]?.won || 0
        }
      }
    });

  } catch (error) {
    return internalError(res, 'freelancers/dashboard-metrics', error);
  }
}

