import { NextApiRequest, NextApiResponse } from 'next';
import { safeCount, safeQuery, tableExists } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError } from '../../../src/lib/apiAuth';

type OrderAmountRow = { total_amount: number | null };
type ProjectRow = { created_at: string | Date; started_at?: string | Date | null; status?: string };

const DAYS = 24 * 60 * 60 * 1000;

// Cache for dashboard metrics (5 second TTL)
let cache: { ts: number; data: any } | null = null;
const TTL_MS = 5000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  // Return cached data if still valid
  if (cache && Date.now() - cache.ts < TTL_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(now - 30 * DAYS);
    const twentyEightDaysAgo = new Date(now - 28 * DAYS);
    const thirtyToSixty = {
      start: new Date(now - 60 * DAYS),
      end: new Date(now - 30 * DAYS)
    };
    const sevenToFourteen = {
      start: new Date(now - 14 * DAYS),
      end: new Date(now - 7 * DAYS)
    };

    const [hasOrdersTable, hasProductsTable, _hasQuoteRequestsTable, hasProjectsTable] = await Promise.all([
      tableExists('orders'),
      tableExists('products'),
      tableExists('quote_requests'),
      tableExists('projects')
    ]);

    const totalUsers = await safeCount('users');
    const totalProjects = await safeCount('projects');
    const activeUsers = await safeCount('users', "is_active = 'TRUE' OR is_active = 1");
    const pendingFreelancers = await safeCount('freelancers', "status = 'pending'");
    const approvedFreelancers = await safeCount('freelancers', "status = 'approved'");
    const totalOrders = hasOrdersTable ? await safeCount('orders') : 0;
    const pendingOrders = hasOrdersTable ? await safeCount('orders', "status IN ('pending','processing')") : 0;
    const completedOrders = hasOrdersTable ? await safeCount('orders', "status = 'completed'") : 0;
    const totalProducts = hasProductsTable ? await safeCount('products') : 0;

    const recentOrders = hasOrdersTable
      ? await safeQuery<OrderAmountRow>(
          `SELECT total_amount FROM orders WHERE created_at >= ?`,
          [thirtyDaysAgo],
          'orders-last-30d'
        )
      : [];
    const todayOrders = hasOrdersTable
      ? await safeQuery<OrderAmountRow>(
          `SELECT total_amount FROM orders WHERE created_at >= ?`,
          [todayStart],
          'orders-today'
        )
      : [];

    const trailing28Orders = hasOrdersTable
      ? await safeQuery<OrderAmountRow>(
          `SELECT total_amount FROM orders WHERE created_at >= ?`,
          [twentyEightDaysAgo],
          'orders-28d'
        )
      : [];

    const gmvToday = todayOrders.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const gmvMTD = recentOrders.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const gmvTrailing28d = trailing28Orders.reduce(
      (sum, row) => sum + Number(row.total_amount || 0),
      0
    );

    const platformFeeRate = 0.05;
    const netRevenueMTD = gmvMTD * platformFeeRate;

    const refundsMTD = hasOrdersTable
      ? await safeQuery<OrderAmountRow>(
          `SELECT total_amount FROM orders WHERE status = 'refunded' AND created_at >= ?`,
          [thirtyDaysAgo],
          'refunds-mtd'
        )
      : [];
    const totalRefunds = refundsMTD.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const netRevenueAfterRefunds = netRevenueMTD - totalRefunds;

    const previousMonthOrders = hasOrdersTable
      ? await safeQuery<OrderAmountRow>(
          `SELECT total_amount FROM orders WHERE created_at >= ? AND created_at < ?`,
          [thirtyToSixty.start, thirtyToSixty.end],
          'orders-prev-month'
        )
      : [];
    const gmvLastMonth = previousMonthOrders.reduce(
      (sum, row) => sum + Number(row.total_amount || 0),
      0
    );
    const revenueChange = gmvLastMonth > 0 ? ((gmvMTD - gmvLastMonth) / gmvLastMonth) * 100 : 0;

    const aov = totalOrders > 0 ? gmvMTD / totalOrders : 0;

    const activeFreelancers = approvedFreelancers;
    const activeClients = await safeCount('clients');

    const newRequests = await safeCount('projects', "status IN ('draft', 'open')");
    const quotesUnderReview = await safeCount('projects', "status = 'in_review'");
    const sowSigned = await safeCount('projects', "status = 'contracted'");
    const inDelivery = await safeCount('projects', "status IN ('in_progress', 'delivered')");
    const completed = await safeCount('projects', "status = 'completed'");

    const lastWeekNewRequests = await safeCount(
      'projects',
      "status IN ('draft', 'open') AND created_at >= ? AND created_at < ?",
      [sevenToFourteen.start, sevenToFourteen.end],
      'projects-lastweek-open'
    );
    const lastWeekCompleted = await safeCount(
      'projects',
      "status = 'completed' AND created_at >= ? AND created_at < ?",
      [sevenToFourteen.start, sevenToFourteen.end],
      'projects-lastweek-completed'
    );

    const newRequestsChange =
      lastWeekNewRequests > 0
        ? ((newRequests - lastWeekNewRequests) / lastWeekNewRequests) * 100
        : 0;
    const completedChange =
      lastWeekCompleted > 0
        ? ((completed - lastWeekCompleted) / lastWeekCompleted) * 100
        : 0;

    const responseTimeData = hasProjectsTable
      ? await safeQuery<ProjectRow>(
          `SELECT created_at, started_at
             FROM projects
            WHERE started_at IS NOT NULL
              AND created_at >= ?`,
          [thirtyDaysAgo],
          'projects-response-time'
        )
      : [];

    const avgResponseTime =
      responseTimeData.length > 0
        ? responseTimeData.reduce((sum, project) => {
            const created = new Date(project.created_at);
            const assigned = project.started_at ? new Date(project.started_at) : created;
            return sum + (assigned.getTime() - created.getTime()) / (1000 * 60 * 60);
          }, 0) / responseTimeData.length
        : 0;

    const pendingKYC = await safeCount('freelancers', "status = 'pending'");
    const refundRequests = hasOrdersTable
      ? await safeCount('orders', "status = 'refund_requested'")
      : 0;

    const workQueue = {
      pendingKYC,
      flaggedChats: 0,
      refundRequests,
      chargebacks: 0,
      stockAlerts: 0,
      failedWebhooks: 0,
      payoutHolds: 0,
      totalItems: pendingKYC + refundRequests
    };

    const systemHealth = {
      databaseLatency: Math.floor(Math.random() * 40) + 20,
      edgeFunctionErrors: 0,
      emailApiUptime: 100,
      paymentWebhook: 'active',
      fileScanService: 'running'
    };

    const metrics = {
      gmvToday,
      gmvMTD,
      gmvTrailing28d,
      netRevenueMTD,
      netRevenueAfterRefunds,
      revenueChange,
      aov,
      conversionRate: 0,
      totalProjects,
      revenueThisMonth: gmvMTD,
      pendingPayouts: 0,
      activeOrders: pendingOrders,
      activeUsers,
      flaggedChats: 0,
      openDisputes: 0,
      avgResponseTime,
      newRequests,
      newRequestsChange,
      quotesUnderReview,
      sowSigned,
      inDelivery,
      completed,
      completedChange,
      totalUsers,
      activeFreelancers,
      activeClients,
      verifiedSuppliers: 0,
      applicationsPending: pendingFreelancers,
      suspendedAccounts: 0,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalProducts,
      systemHealth,
      workQueue,
      moderation: {
        messagesBlocked: 0,
        mutedUsers: 0,
        topViolationType: 'None',
        chatsUnderReview: 0
      }
    };

    const response = {
      success: true,
      metrics,
      lastUpdated: new Date().toISOString()
    };

    // Cache the response
    cache = { ts: Date.now(), data: response };

    return res.status(200).json(response);
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'dashboard-metrics', error);
  }
}
