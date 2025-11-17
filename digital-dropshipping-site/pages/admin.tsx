import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../src/contexts/AuthContext';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../src/components/Header'));
const EntityDrawer = dynamic(() => import('../src/components/admin').then(m => m.EntityDrawer));
const CommandBar = dynamic(() => import('../src/components/admin').then(m => m.CommandBar));
const DataGrid = dynamic(() => import('../src/components/admin').then(m => m.DataGrid));
const EditableCard = dynamic(() => import('../src/components/admin').then(m => m.EditableCard));
const KanbanPipeline = dynamic(() => import('../src/components/admin').then(m => m.KanbanPipeline), { ssr: false });
const EventStream = dynamic(() => import('../src/components/admin').then(m => m.EventStream), { ssr: false });
import { useToast } from '../src/components/Toast';
import { query } from '../src/lib/mysql';

interface DashboardMetrics {
  gmvToday: number;
  gmvMTD: number;
  gmvTrailing28d: number;
  netRevenueMTD: number;
  netRevenueAfterRefunds: number;
  revenueChange: number;
  aov: number;
  conversionRate: number;

  totalProjects: number;
  revenueThisMonth: number;
  pendingPayouts: number;
  activeOrders: number;
  activeUsers: number;
  flaggedChats: number;
  openDisputes: number;
  avgResponseTime: number;
  newRequests: number;
  newRequestsChange: number;
  quotesUnderReview: number;
  sowSigned: number;
  inDelivery: number;
  completed: number;
  completedChange: number;
  messagesBlocked: number;
  mutedUsers: number;
  topViolationType: string;
  chatsUnderReview: number;
  activeFreelancers: number;
  activeClients: number;
  verifiedSuppliers: number;
  applicationsPending: number;
  suspendedAccounts: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  pendingQuoteRequests: number;
  systemHealth: {
    databaseLatency: number;
    edgeFunctionErrors: number;
    emailApiUptime: number;
    paymentWebhook: string;
    fileScanService: string;
  };
  workQueue: {
    pendingKYC: number;
    flaggedChats: number;
    refundRequests: number;
    chargebacks: number;
    stockAlerts: number;
    failedWebhooks: number;
    payoutHolds: number;
    totalItems: number;
  };
  moderation: {
    messagesBlocked: number;
    mutedUsers: number;
    topViolationType: string;
    chatsUnderReview: number;
  };
}

interface ActivityFeedItem {
  id: string;
  type:
    | 'user_registered'
    | 'freelancer_registered'
    | 'client_registered'
    | 'work_request'
    | 'project_created'
    | 'order_placed'
    | 'service_created'
    | 'review_posted'
    | 'quote_request'
    | 'escrow_funded'
    | 'chat_flagged'
    | 'dispute_opened';
  message: string;
  timestamp: string;
  user?: string;
  role?: string;
  status?: string;
  amount?: number;
  budget?: number;
  rating?: number;
  company?: string;
  createdAt: string;
  entityId?: string;
}

interface AdminProps {
  freelancers: any[];
  pendingCount: number;
  approvedCount: number;
  quoteRequests: number;
}

type WorkQueueData = {
  pendingKYC: any[];
  refundRequests: any[];
  chargebacks: any[];
  payoutHolds: any[];
  failedWebhooks: any[];
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user_registered':
      return '👤';
    case 'freelancer_registered':
      return '💼';
    case 'client_registered':
      return '🏢';
    case 'work_request':
      return '💬';
    case 'project_created':
      return '📋';
    case 'order_placed':
      return '🛒';
    case 'service_created':
      return '🛠️';
    case 'review_posted':
      return '⭐';
    case 'quote_request':
      return '💰';
    case 'escrow_funded':
      return '🔒';
    case 'chat_flagged':
      return '🚫';
    case 'dispute_opened':
      return '⚖️';
    default:
      return '📢';
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

const formatTimestamp = (value: string | number | Date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(typeof value === 'string' || typeof value === 'number' ? new Date(value) : value);

const formatDate = (value: string | number | Date) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(typeof value === 'string' || typeof value === 'number' ? new Date(value) : value);

const EMPTY_METRICS: DashboardMetrics = {
  gmvToday: 0,
  gmvMTD: 0,
  gmvTrailing28d: 0,
  netRevenueMTD: 0,
  netRevenueAfterRefunds: 0,
  revenueChange: 0,
  aov: 0,
  conversionRate: 0,
  totalProjects: 0,
  revenueThisMonth: 0,
  pendingPayouts: 0,
  activeOrders: 0,
  activeUsers: 0,
  flaggedChats: 0,
  openDisputes: 0,
  avgResponseTime: 0,
  newRequests: 0,
  newRequestsChange: 0,
  quotesUnderReview: 0,
  sowSigned: 0,
  inDelivery: 0,
  completed: 0,
  completedChange: 0,
  messagesBlocked: 0,
  mutedUsers: 0,
  topViolationType: 'n/a',
  chatsUnderReview: 0,
  activeFreelancers: 0,
  activeClients: 0,
  verifiedSuppliers: 0,
  applicationsPending: 0,
  suspendedAccounts: 0,
  totalUsers: 0,
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  totalProducts: 0,
  pendingQuoteRequests: 0,
  systemHealth: {
    databaseLatency: 0,
    edgeFunctionErrors: 0,
    emailApiUptime: 0,
    paymentWebhook: 'offline',
    fileScanService: 'offline',
  },
  workQueue: {
    pendingKYC: 0,
    flaggedChats: 0,
    refundRequests: 0,
    chargebacks: 0,
    stockAlerts: 0,
    failedWebhooks: 0,
    payoutHolds: 0,
    totalItems: 0,
  },
  moderation: {
    messagesBlocked: 0,
    mutedUsers: 0,
    topViolationType: 'n/a',
    chatsUnderReview: 0,
  },
};

export default function AdminDashboard({
  freelancers,
  pendingCount,
  approvedCount,
  quoteRequests,
}: AdminProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const auth = useAuth();

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activityTab, setActivityTab] = useState<'all' | 'users' | 'clients' | 'services'>('all');
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedEntityType, setSelectedEntityType] = useState<
    'user' | 'order' | 'project' | 'service' | 'dispute' | 'kyc'
  >('user');

  const [workQueueData, setWorkQueueData] = useState<WorkQueueData>({
    pendingKYC: [],
    refundRequests: [],
    chargebacks: [],
    payoutHolds: [],
    failedWebhooks: [],
  });

  const [kanbanColumns, setKanbanColumns] = useState<any[]>([]);
  const [eventStream, setEventStream] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'work' | 'events' | 'pipeline' | 'freelancers' | 'clients' | 'orders' | 'products' | 'team' | 'settings' | 'moderation'
  >('overview');

  // Moderation alerts state
  const [moderationAlerts, setModerationAlerts] = useState<any[]>([]);
  const [moderationLoading, setModerationLoading] = useState(false);
  const [unreadModerationCount, setUnreadModerationCount] = useState(0);

  // Freelancers tab state
  const [freelancerStatus, setFreelancerStatus] = useState<string>(''); // '' means All
  const [freelancerRows, setFreelancerRows] = useState<any[]>(freelancers || []);
  const displayedFreelancerRows = useMemo(() => {
    if (!freelancerStatus) return freelancerRows;
    return (freelancerRows || []).filter((r: any) => String(r.status).toLowerCase() === freelancerStatus);
  }, [freelancerRows, freelancerStatus]);

  // Use AuthContext as the source of truth; avoid relying on localStorage timing
  useEffect(() => {
    if (!auth) return;
    // Wait until auth has verified the session to avoid brief redirects
    if (auth.loading || !auth.verified) return;

    const normalizedRole = String(auth.user?.role || '').toUpperCase();
    if (!auth.user || (normalizedRole !== 'ADMIN' && normalizedRole !== 'TEAM_MEMBER')) {
      router.replace('/login');
        return;
      }

    setUser({ name: auth.user.name, role: normalizedRole });
        setLoading(false);
  }, [auth?.loading, auth?.verified, auth?.user, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-metrics');
      if (response.ok) {
        const payload = await response.json();
        setMetrics(payload.metrics);
        setLastUpdated(payload.lastUpdated);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  };

  const fetchWorkQueueData = async () => {
    try {
      const response = await fetch('/api/admin/work-queue-data');
      const payload = await response.json();
      if (payload.success) {
        setWorkQueueData({
          pendingKYC: payload.data.pendingKYC || [],
          refundRequests: payload.data.refundRequests || [],
          chargebacks: payload.data.chargebacks || [],
          payoutHolds: payload.data.payoutHolds || [],
          failedWebhooks: payload.data.failedWebhooks || [],
        });
      }
    } catch (error) {
      console.error('Error fetching work queue data:', error);
    }
  };

  const fetchKanbanData = async () => {
    try {
      const response = await fetch('/api/admin/kanban-data');
      const payload = await response.json();
      if (payload.success) {
        setKanbanColumns(payload.columns);
      }
    } catch (error) {
      console.error('Error fetching kanban data:', error);
    }
  };

  const fetchEventStream = async () => {
    try {
      const response = await fetch('/api/admin/event-stream');
      const payload = await response.json();
      if (payload.success) {
        setEventStream(payload.events);
      }
    } catch (error) {
      console.error('Error fetching event stream:', error);
    }
  };

  const fetchFreelancers = async (status = freelancerStatus) => {
    try {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`/api/admin/freelancers${qs}`);
      const payload = await res.json();
      if (res.ok) {
        const list = Array.isArray(payload.freelancers) ? payload.freelancers : [];
        // Always trust API result for current filter (can be empty by design)
        setFreelancerRows(list);
      }
    } catch (e) {
      console.error('Error fetching freelancers list:', e);
      // Keep current rows on error; do not fallback to stale SSR snapshot
    }
  };

  const updateFreelancerStatus = async (id: string | number, status: 'approved' | 'rejected' | 'pending') => {
    // Optimistic update for real-time feel
    setFreelancerRows(prev =>
      (prev || []).map((r: any) => (String(r.id) === String(id) ? { ...r, status } : r))
    );
    try {
      const res = await fetch('/api/admin/freelancers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        // Re-sync on error
        await fetchFreelancers();
        return false;
      }
      // Refresh counts and list after server confirms
      fetchDashboardData();
      fetchFreelancers();
      return true;
    } catch (e) {
      console.error('Error updating freelancer status:', e);
      // Re-sync in case of network failure
      await fetchFreelancers();
      return false;
    }
  };

  const fetchActivityData = async (tabValue: typeof activityTab = activityTab) => {
    try {
      setActivityLoading(true);
      const response = await fetch(`/api/admin/activity-feed?type=${tabValue}`);
      if (response.ok) {
        const payload = await response.json();
        setActivityFeed(payload.activities);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const fetchModerationAlerts = async () => {
    try {
      setModerationLoading(true);
      const response = await fetch('/api/admin/moderation-alerts?limit=100');
      if (response.ok) {
        const payload = await response.json();
        if (payload.success) {
          setModerationAlerts(payload.notifications || []);
          // Count unread
          const unread = (payload.notifications || []).filter((n: any) => !n.is_read || n.is_read === 'FALSE').length;
          setUnreadModerationCount(unread);
        }
      }
    } catch (error) {
      console.error('Error fetching moderation alerts:', error);
    } finally {
      setModerationLoading(false);
    }
  };

  const markNotificationRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/admin/mark-notification-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });
      if (response.ok) {
        fetchModerationAlerts();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    if (loading) return;

    // Prefetch common admin routes for snappier nav
    router.prefetch('/admin/quotes');
    router.prefetch('/admin/products-enhanced');
    router.prefetch('/admin/team');
    router.prefetch('/admin/moderation');

    // Restore last selected activity tab (persist between visits)
    const lastTab = typeof window !== 'undefined' ? localStorage.getItem('admin_activity_tab') : null;
    if (lastTab === 'all' || lastTab === 'users' || lastTab === 'clients' || lastTab === 'services') {
      setActivityTab(lastTab as any);
    }

    // Gentle welcome toast
    try {
      addToast(`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}`, 'success', 1500);
    } catch {}

    const loadMetrics = async (initial: boolean) => {
      if (initial) {
        setMetricsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      await fetchDashboardData();

      if (initial) {
        setMetricsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    };

    loadMetrics(true);
    const interval = setInterval(() => loadMetrics(false), 30000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!loading) {
      fetchActivityData(activityTab);
      // Persist selection
      try {
        localStorage.setItem('admin_activity_tab', activityTab);
      } catch {}
    }
  }, [activityTab, loading]);

  useEffect(() => {
    if (!loading) {
      fetchWorkQueueData();
      fetchKanbanData();
      fetchEventStream();
      fetchModerationAlerts(); // Always fetch moderation alerts
      if (activeTab === 'freelancers') {
        fetchFreelancers();
      }
      if (activeTab === 'moderation') {
        fetchModerationAlerts();
      }
    }
  }, [loading, activeTab]);

  const handleEntitySelect = (entityType: string, entityId: string) => {
    setSelectedEntityType(entityType as any);
    setSelectedEntity({ id: entityId });
    setDrawerOpen(true);
  };

  const handleActionExecute = async (action: string, params: any) => {
    try {
      addToast(`Executing ${action}...`, 'info', 1000);
      const response = await fetch('/api/admin/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });

      if (response.ok) {
        addToast(`${action} completed successfully`, 'success');
        fetchDashboardData();
        fetchWorkQueueData();
      } else {
        throw new Error('Action failed');
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      addToast(`Failed to execute ${action}`, 'error');
    }
  };

  const handleWorkQueueBulkAction = async (action: string, selectedRows: any[]) => {
    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rows: selectedRows }),
      });

      if (response.ok) {
        fetchWorkQueueData();
      }
    } catch (error) {
      console.error(`Error executing bulk ${action}:`, error);
    }
  };

  const handleKPIEdit = async (field: string, newValue: string | number) => {
    try {
      addToast(`Updating ${field}...`, 'info', 1000);
      const response = await fetch('/api/admin/update-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: newValue }),
      });

      if (response.ok) {
        addToast(`${field} updated successfully`, 'success');
        fetchDashboardData();
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      addToast(`Failed to update ${field}`, 'error');
    }
  };

  const handleKanbanCardMove = async (cardId: string, fromStatus: string, toStatus: string) => {
    try {
      addToast(`Moving card to ${toStatus}...`, 'info', 1000);
      const response = await fetch('/api/admin/move-kanban-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, fromStatus, toStatus }),
      });

      if (response.ok) {
        addToast('Card moved successfully', 'success');
        fetchKanbanData();
      } else {
        throw new Error('Move failed');
      }
    } catch (error) {
      addToast('Failed to move card', 'error');
    }
  };

  const handleEventClick = (event: any) => {
    const map: Record<string, string> = {
      user_registered: 'user',
      order_placed: 'order',
      project_created: 'project',
      service_created: 'service',
      dispute_opened: 'dispute',
    };
    const entityType = map[event.type] || 'user';
    handleEntitySelect(entityType, event.entityId || event.id);
  };

  const handleManualRefresh = () => {
    fetchDashboardData();
    fetchWorkQueueData();
    fetchKanbanData();
    fetchEventStream();
    fetchActivityData(activityTab);
  };

  const metricsReady = Boolean(metrics) && !metricsLoading;
  const displayMetrics = metrics ?? EMPTY_METRICS;

  const firstName = user?.name ? String(user.name).split(' ')[0] : null;
  const heroGreeting = firstName ? `Welcome back, ${firstName}` : 'Admin Command Center';
  const lastUpdatedLabel = lastUpdated ? formatTimestamp(lastUpdated) : 'Sync pending';

  const primaryHighlights = useMemo(
    () => [
      {
        title: 'GMV Today',
        value: formatCurrency(displayMetrics.gmvToday),
        caption: 'Gross merchandise processed today',
        delta: displayMetrics.revenueChange,
        icon: '💸',
        accent: 'from-brand-a via-brand-b to-brand-c',
      },
      {
        title: 'Net Revenue',
        value: formatCurrency(displayMetrics.netRevenueAfterRefunds),
        caption: 'After refunds & adjustments',
        icon: '🏦',
        accent: 'from-brand-b via-brand-c to-brand-a',
      },
      {
        title: 'Active Users',
        value: formatNumber(displayMetrics.activeUsers),
        caption: 'Engaged accounts in the last 24h',
        icon: '👥',
        accent: 'from-emerald-500 to-teal-500',
      },
      {
        title: 'Total Orders',
        value: formatNumber(displayMetrics.totalOrders),
        caption: 'Orders logged this month',
        icon: '📦',
        accent: 'from-amber-400 to-rose-400',
      },
    ],
    [displayMetrics],
  );

  const pipelineHighlights = useMemo(
    () => [
      {
        label: 'New Requests',
        value: formatNumber(displayMetrics.newRequests),
        delta: displayMetrics.newRequestsChange,
        icon: '🧾',
      },
      {
        label: 'Quotes Under Review',
        value: formatNumber(displayMetrics.quotesUnderReview),
        delta: 0,
        icon: '📝',
      },
      {
        label: 'In Delivery',
        value: formatNumber(displayMetrics.inDelivery),
        delta: 0,
        icon: '🚚',
      },
      {
        label: 'Completed',
        value: formatNumber(displayMetrics.completed),
        delta: displayMetrics.completedChange,
        icon: '✅',
      },
    ],
    [displayMetrics],
  );

  const workQueueHighlights = useMemo(
    () => [
      {
        label: 'Pending KYC',
        value: workQueueData.pendingKYC.length,
        helper: 'Applications awaiting review',
        accent: 'bg-brand-b/15 text-brand-b',
        icon: '🛂',
      },
      {
        label: 'Refund Requests',
        value: workQueueData.refundRequests.length,
        helper: 'Orders needing attention',
        accent: 'bg-rose-500/15 text-rose-400',
        icon: '💳',
      },
      {
        label: 'Open Flags',
        value: displayMetrics.workQueue.totalItems,
        helper: 'Across moderation & payments',
        accent: 'bg-amber-500/15 text-amber-400',
        icon: '🚩',
      },
    ],
    [displayMetrics.workQueue.totalItems, workQueueData.pendingKYC.length, workQueueData.refundRequests.length],
  );

  const healthHighlights = useMemo(
    () => [
      {
        label: 'Database latency',
        value: `${displayMetrics.systemHealth.databaseLatency}ms`,
        status: displayMetrics.systemHealth.databaseLatency < 80 ? 'Healthy' : 'Investigate',
      },
      {
        label: 'Email uptime',
        value: `${displayMetrics.systemHealth.emailApiUptime}%`,
        status: 'Transactional mail',
      },
      {
        label: 'Payment webhook',
        value: displayMetrics.systemHealth.paymentWebhook,
        status: 'Stripe listener',
      },
      {
        label: 'File scan service',
        value: displayMetrics.systemHealth.fileScanService,
        status: 'Uploads & AV',
      },
    ],
    [displayMetrics.systemHealth],
  );

  const quickLinks = useMemo(
    () => [
      {
        title: 'Quote Requests',
        description: `${quoteRequests} awaiting action`,
        href: '/admin/quotes',
        icon: '💬',
      },
      {
        title: 'Manage Products',
        description: 'Inventory, pricing & bundles',
        href: '/admin/products-enhanced',
        icon: '📦',
      },
      {
        title: 'Database Setup',
        description: 'Migrations & seed scripts',
        href: '/admin/setup',
        icon: '⚙️',
      },
      {
        title: 'Team Directory',
        description: 'Invite or manage teammates',
        href: '/admin/team',
        icon: '👥',
      },
    ],
    [quoteRequests],
  );

  const activityFilters = useMemo(
    () => [
      { id: 'all', label: 'All' },
      { id: 'users', label: 'Users' },
      { id: 'clients', label: 'Clients' },
      { id: 'services', label: 'Services' },
    ],
    [],
  );

  const pendingKYCRows = workQueueData.pendingKYC || [];
  const refundRows = workQueueData.refundRequests || [];
  const topFreelancers = useMemo(() => freelancers.slice(0, 4), [freelancers]);

  return (
    <>
      <Head>
        <title>Admin Dashboard · Uniti</title>
      </Head>
      <div className="min-h-screen bg-superhuman text-text-base">
        <Header />
        <CommandBar onEntitySelect={handleEntitySelect} onActionExecute={handleActionExecute} />
        <EntityDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          entity={selectedEntity}
          entityType={selectedEntityType}
        />

        <main className="mx-auto max-w-7xl px-6 pb-24 pt-28 space-y-10">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-lg shadow-card sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-text-mute mb-3">
                  Command Center
                </p>
                <h1 className="font-display text-3xl text-text-base sm:text-4xl">{heroGreeting}</h1>
                <p className="mt-3 max-w-2xl text-sm text-text-soft">
                  Track revenue, service delivery, and trust signals in real-time. Surface the work
                  that needs human judgement and keep Uniti moving.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-text-mute">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    <span className="h-2 w-2 rounded-full bg-brand-a"></span>
                    Updated {lastUpdatedLabel}
                  </span>
                  {isRefreshing && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                      <span className="h-2 w-2 animate-ping rounded-full bg-brand-b"></span>
                      Refreshing data…
                    </span>
                  )}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { id: 'overview', label: 'Snapshot' },
                    { id: 'work', label: 'Work Queue' },
                    { id: 'events', label: 'Events & Activity' },
                    { id: 'pipeline', label: 'Delivery Pipeline' },
                    { id: 'freelancers', label: 'Freelancers' },
                    { id: 'clients', label: 'Clients' },
                    { id: 'orders', label: 'Orders' },
                    { id: 'products', label: 'Products' },
                    { id: 'team', label: 'Team' },
                    { id: 'moderation', label: `Moderation${unreadModerationCount > 0 ? ` (${unreadModerationCount})` : ''}` },
                    { id: 'settings', label: 'Settings' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition border ${
                        activeTab === (tab.id as any)
                          ? 'border-brand-b/60 bg-brand-b/15 text-brand-b'
                          : 'border-white/10 bg-white/5 text-text-mute hover:border-white/20 hover:text-text-base'
                      }`}
                      aria-pressed={activeTab === (tab.id as any)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={handleManualRefresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-text-base transition hover:border-brand-b hover:text-brand-b"
                >
                  <span className="h-2 w-2 rounded-full bg-brand-b"></span>
                  Refresh Metrics
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('user');
                    router.push('/login');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:from-rose-400 hover:to-red-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* Work Queue tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'work' ? 'block' : 'hidden'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text-base">Work queue</h3>
                <p className="text-xs text-text-mute">Escalations that require a human decision</p>
              </div>
              <button
                onClick={handleManualRefresh}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-text-soft transition hover:text-brand-b"
              >
                Refresh queue
              </button>
            </div>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <DataGrid
                title="Pending KYC"
                rows={pendingKYCRows}
                columns={[
                  { field: 'email', headerName: 'Email' },
                  { field: 'role', headerName: 'Role' },
                  { field: 'created_at', headerName: 'Submitted', renderCell: (row) => formatDate(row.created_at) },
                  {
                    field: 'status',
                    headerName: 'Status',
                    renderCell: (row) => (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          row.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-white/10 text-text-soft'
                        }`}
                      >
                        {row.status}
                      </span>
                    ),
                  },
                ]}
                onRowClick={(row) => handleEntitySelect('kyc', row.id)}
                bulkActions={[
                  { label: 'Approve All', action: 'approve_kyc', icon: '✅' },
                  { label: 'Reject All', action: 'reject_kyc', icon: '❌', variant: 'destructive' },
                ]}
                onBulkAction={handleWorkQueueBulkAction}
              />
              <DataGrid
                title="Refund Requests"
                rows={refundRows}
                columns={[
                  { field: 'id', headerName: 'Order ID' },
                  { field: 'total_amount', headerName: 'Amount', renderCell: (row) => formatCurrency(row.total_amount || 0) },
                  { field: 'status', headerName: 'Status' },
                  { field: 'created_at', headerName: 'Requested', renderCell: (row) => formatDate(row.created_at) },
                ]}
                onRowClick={(row) => handleEntitySelect('order', row.id)}
                bulkActions={[
                  { label: 'Approve Refunds', action: 'approve_refunds', icon: '✅' },
                  { label: 'Reject Refunds', action: 'reject_refunds', icon: '❌', variant: 'destructive' },
                ]}
                onBulkAction={handleWorkQueueBulkAction}
              />
            </div>
          </section>

          {/* Clients tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'clients' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Clients</h3>
              <span className="text-xs text-text-mute">Manage client accounts and briefs</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/client-dashboard" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Client Dashboard</p>
                <p className="text-xs text-text-mute mt-1">View client-side experience</p>
              </Link>
              <Link href="/admin/quotes" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Quote Requests</p>
                <p className="text-xs text-text-mute mt-1">Review and respond to briefs</p>
              </Link>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-text-mute">
                Coming soon: Client directory and segments
              </div>
            </div>
          </section>

          {/* Orders tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'orders' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Orders</h3>
              <span className="text-xs text-text-mute">Track orders and fulfillment</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link href="/admin/orders" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Orders Table</p>
                <p className="text-xs text-text-mute mt-1">View and manage orders</p>
              </Link>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-text-mute">
                Coming soon: Order detail and refunds workflow
              </div>
            </div>
          </section>

          {/* Products tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'products' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Products & Services</h3>
              <span className="text-xs text-text-mute">Catalog and pricing</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link href="/admin/products-enhanced" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Manage Products</p>
                <p className="text-xs text-text-mute mt-1">Inventory, pricing & bundles</p>
              </Link>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-text-mute">
                Coming soon: Promotions and bundles
              </div>
            </div>
          </section>

          {/* Team tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'team' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Team</h3>
              <span className="text-xs text-text-mute">Invite and manage teammates</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link href="/admin/team" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Team Directory</p>
                <p className="text-xs text-text-mute mt-1">Invites, roles, access</p>
              </Link>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-text-mute">
                Coming soon: Role policies and audit logs
              </div>
            </div>
          </section>

          {/* Settings tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'settings' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Settings</h3>
              <span className="text-xs text-text-mute">Platform configuration</span>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Link href="/admin/setup" className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm hover:border-brand-b/40 transition">
                <p className="font-semibold text-text-base">Admin Setup</p>
                <p className="text-xs text-text-mute mt-1">Database, environment, migrations</p>
              </Link>
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-text-mute">
                Coming soon: Brand, email, payments
              </div>
            </div>
          </section>
          <section className={`space-y-4 ${activeTab === 'overview' ? 'block' : 'hidden'}`}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm uppercase tracking-[0.3em] text-text-mute">Snapshot</h2>
              <span className="text-xs text-text-mute">
                GMV trailing 28d · Net revenue · Active users · Orders
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {primaryHighlights.map((metric) => (
                <div
                  key={metric.title}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card transition hover:-translate-y-1 hover:border-brand-b/60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{metric.icon}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-text-mute">
                      {metric.caption}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text-soft">{metric.title}</h3>
                  <p className="mt-2 text-2xl font-semibold text-text-base">{metric.value}</p>
                  {typeof metric.delta === 'number' && (
                    <p
                      className={`mt-3 text-xs font-semibold ${
                        metric.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {metric.delta >= 0 ? '▲' : '▼'} {Math.abs(metric.delta).toFixed(1)}% vs. last month
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className={`grid gap-6 lg:grid-cols-[2fr_1fr] ${activeTab === 'overview' ? 'grid' : 'hidden'}`}>
            <div className="space-y-6">
              <div className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'work' ? 'block' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-base">Pipeline health</h3>
                  <span className="text-xs text-text-mute">
                    Conversion from request → delivery → completion
                  </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {pipelineHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-brand-b/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{item.icon}</span>
                        {item.delta !== 0 && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              (item.delta || 0) >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {(item.delta || 0) >= 0 ? '+' : '-'}
                            {Math.abs(item.delta || 0).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-text-soft">{item.label}</p>
                      <p className="text-xl font-semibold text-text-base">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-base">Adjustable KPIs</h3>
                  <span className="text-xs text-text-mute">
                    Tap a card to tweak goals or log interventions.
                  </span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <EditableCard
                    title="GMV Today"
                    value={formatCurrency(displayMetrics.gmvToday)}
                    icon="💰"
                    color="from-green-500 to-emerald-500"
                    editable
                    onEdit={(value) => handleKPIEdit('gmvToday', value)}
                    fastActions={[
                      { label: 'Export Transactions (CSV)', action: 'export_transactions', icon: '📑' },
                      { label: 'View Transactions', action: 'view_transactions', icon: '👁️' },
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="GMV (MTD)"
                    value={formatCurrency(displayMetrics.gmvMTD)}
                    icon="📈"
                    color="from-blue-500 to-cyan-500"
                    editable
                    onEdit={(value) => handleKPIEdit('gmvMTD', value)}
                  />
                  <EditableCard
                    title="Net Revenue"
                    value={formatCurrency(displayMetrics.netRevenueAfterRefunds)}
                    icon="🏦"
                    color="from-purple-500 to-indigo-500"
                    editable
                    onEdit={(value) => handleKPIEdit('netRevenueAfterRefunds', value)}
                    fastActions={[
                      { label: 'Adjust Platform Fee', action: 'adjust_platform_fee', icon: '⚙️' },
                      { label: 'Process Refunds', action: 'process_refunds', icon: '💳' },
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="Active Users"
                    value={formatNumber(displayMetrics.activeUsers)}
                    icon="👥"
                    color="from-emerald-500 to-teal-500"
                    editable
                    onEdit={(value) => handleKPIEdit('activeUsers', value)}
                    fastActions={[
                      { label: 'Send Broadcast', action: 'send_user_notification', icon: '📢' },
                      { label: 'Export User List', action: 'export_users', icon: '📃' },
                    ]}
                    onFastAction={handleActionExecute}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-text-base">Work queue</h3>
                    <p className="text-xs text-text-mute">
                      Escalations that require a human decision
                    </p>
                  </div>
                  <button
                    onClick={handleManualRefresh}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-text-soft transition hover:text-brand-b"
                  >
                    Refresh queue
                  </button>
                </div>
                <div className="mt-5 grid gap-6 lg:grid-cols-2">
                  <DataGrid
                    title="Pending KYC"
                    rows={pendingKYCRows}
                    columns={[
                      { field: 'email', headerName: 'Email' },
                      { field: 'role', headerName: 'Role' },
                      {
                        field: 'created_at',
                        headerName: 'Submitted',
                        renderCell: (row) => formatDate(row.created_at),
                      },
                      {
                        field: 'status',
                        headerName: 'Status',
                        renderCell: (row) => (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              row.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-white/10 text-text-soft'
                            }`}
                          >
                            {row.status}
                          </span>
                        ),
                      },
                    ]}
                    onRowClick={(row) => handleEntitySelect('kyc', row.id)}
                    bulkActions={[
                      { label: 'Approve All', action: 'approve_kyc', icon: '✅' },
                      { label: 'Reject All', action: 'reject_kyc', icon: '❌', variant: 'destructive' },
                    ]}
                    onBulkAction={handleWorkQueueBulkAction}
                  />
                  <DataGrid
                    title="Refund Requests"
                    rows={refundRows}
                    columns={[
                      { field: 'id', headerName: 'Order ID' },
                      {
                        field: 'total_amount',
                        headerName: 'Amount',
                        renderCell: (row) => formatCurrency(row.total_amount || 0),
                      },
                      { field: 'status', headerName: 'Status' },
                      {
                        field: 'created_at',
                        headerName: 'Requested',
                        renderCell: (row) => formatDate(row.created_at),
                      },
                    ]}
                    onRowClick={(row) => handleEntitySelect('order', row.id)}
                    bulkActions={[
                      { label: 'Approve Refunds', action: 'approve_refunds', icon: '✅' },
                      { label: 'Reject Refunds', action: 'reject_refunds', icon: '❌', variant: 'destructive' },
                    ]}
                    onBulkAction={handleWorkQueueBulkAction}
                  />
                </div>
              </div>
            </div>

            <aside className={`space-y-6 ${activeTab === 'overview' ? 'block' : 'hidden'}`}>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <h3 className="text-sm font-semibold text-text-base">Urgent tasks</h3>
                <div className="mt-4 space-y-3">
                  {workQueueHighlights.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-text-base">{item.label}</p>
                          <p className="text-xs text-text-mute">{item.helper}</p>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-text-base">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <h3 className="text-sm font-semibold text-text-base">System health</h3>
                <ul className="mt-4 space-y-3 text-sm text-text-soft">
                  {healthHighlights.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-text-base">{item.label}</p>
                        <p className="text-xs text-text-mute">{item.status}</p>
                      </div>
                      <span className="text-sm font-semibold text-text-base">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-base">Quick links</h3>
                  <span className="text-xs text-text-mute">Jump straight into workflows</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-text-base transition hover:border-brand-b/50 hover:text-brand-b"
                    >
                      <span className="flex items-center gap-2">
                        <span>{link.icon}</span>
                        {link.title}
                      </span>
                      <span className="text-xs text-text-mute">{link.description}</span>
                    </Link>
                  ))}
                  <Link
                    href="/admin/moderation"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-text-base transition hover:border-rose-500/50 hover:text-rose-300"
                  >
                    <span className="flex items-center gap-2">
                      <span>🛡️</span>
                      Moderation dashboard
                    </span>
                    <span className="text-xs text-text-mute">Conversations & flags</span>
                  </Link>
                </div>
              </div>
            </aside>
          </section>

          <section className={`grid gap-6 lg:grid-cols-[3fr_2fr] ${activeTab === 'events' ? 'grid' : 'hidden'}`}>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-base">Live event stream</h3>
                  <span className="text-xs text-text-mute">{eventStream.length} events</span>
                </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5">
                <EventStream
                  events={eventStream}
                  onEventClick={handleEventClick}
                  onAssign={(eventId, assignee) => {
                    addToast(`Assigned event to ${assignee}`, 'success');
                    fetchEventStream();
                  }}
                  onPin={() => fetchEventStream()}
                  filters={[
                    {
                      field: 'event_type',
                      label: 'Event Type',
                      options: [
                        { value: 'user_registered', label: 'User Registration' },
                        { value: 'order_placed', label: 'Order Placed' },
                        { value: 'project_created', label: 'Project Created' },
                        { value: 'service_created', label: 'Service Created' },
                        { value: 'dispute_opened', label: 'Dispute Opened' },
                      ],
                    },
                  ]}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-base">Activity feed</h3>
                {activityLoading && (
                  <div className="flex items-center gap-2 text-xs text-text-mute">
                    <span className="h-2 w-2 animate-ping rounded-full bg-brand-b"></span>
                    Loading…
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {activityFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActivityTab(filter.id as typeof activityTab)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      activityTab === filter.id
                        ? 'bg-brand-b/20 text-brand-b'
                        : 'bg-white/5 text-text-mute hover:bg-white/10'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
                {activityLoading ? (
                  <div className="flex items-center justify-center py-20 text-sm text-text-mute">
                    Pulling latest activity…
                  </div>
                ) : activityFeed.length === 0 ? (
                  <div className="flex items-center justify-center py-20 text-sm text-text-mute">
                    No activity for this filter yet.
                  </div>
                ) : (
                  activityFeed.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-soft transition hover:border-brand-b/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getActivityIcon(item.type)}</span>
                          <div>
                            <p className="font-medium text-text-base">{item.message}</p>
                            {item.user && (
                              <p className="text-xs text-text-mute">
                                {item.user} {item.role && `· ${item.role}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-text-mute">{item.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'pipeline' ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-base">Delivery pipeline</h3>
              <span className="text-xs text-text-mute">
                Drag-and-drop between stages to keep the team aligned.
              </span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <KanbanPipeline
                columns={kanbanColumns}
                onCardMove={handleKanbanCardMove}
                onCardClick={(card) => handleEntitySelect('project', card.id)}
                onAddCard={(status) => addToast(`New card placeholder for ${status}`, 'info')}
              />
            </div>
          </section>

          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'freelancers' ? 'block' : 'hidden'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                <h3 className="text-lg font-semibold text-text-base">Freelancers</h3>
                <p className="text-xs text-text-mute">{pendingCount} pending · {approvedCount} approved</p>
                  </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-text-mute">Status</label>
                <select
                  value={freelancerStatus}
                  onChange={(e) => { setFreelancerStatus(e.target.value); fetchFreelancers(e.target.value); }}
                  className="rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs text-text-base"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                </div>
                      </div>
              <div className="mt-4">
              <DataGrid
                title="Freelancers"
                rows={displayedFreelancerRows}
                columns={[
                  { field: 'id', headerName: 'ID' },
                  { field: 'display_name', headerName: 'Name' },
                  { field: 'status', headerName: 'Status' },
                  { field: 'verification_state', headerName: 'Verification', renderCell: (row: any) => {
                    const v = String(row.verification_state || '').toLowerCase();
                    if (v === 'verified') return 'Verified';
                    if (v === 'pending') return 'Pending';
                    if (v === 'rejected') return 'Rejected';
                    return v || '—';
                  } },
                  { field: 'rating', headerName: 'Rating' },
                  { field: 'created_at', headerName: 'Joined', renderCell: (row: any) => formatDate(row.created_at) },
                ]}
                bulkActions={[
                  { label: 'Approve', action: 'approve' },
                  { label: 'Reject', action: 'reject', variant: 'destructive' },
                ]}
                onBulkAction={async (action, rows) => {
                  if (action === 'approve') {
                    await Promise.all(rows.map((r: any) => updateFreelancerStatus(r.id, 'approved')));
                  } else if (action === 'reject') {
                    await Promise.all(rows.map((r: any) => updateFreelancerStatus(r.id, 'rejected')));
                  }
                  // Ensure list reflects all changes
                  fetchFreelancers();
                }}
              />
            </div>
          </section>

          {/* Moderation tab */}
          <section className={`rounded-3xl border border-white/10 bg-white/5 p-6 shadow-card ${activeTab === 'moderation' ? 'block' : 'hidden'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-text-base">Moderation Alerts</h3>
                <p className="text-xs text-text-mute">Blocked messages and security violations</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchModerationAlerts}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-text-soft transition hover:text-brand-b"
                >
                  Refresh
                </button>
                <button
                  onClick={async () => {
                    const response = await fetch('/api/admin/mark-notification-read', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ markAllRead: true })
                    });
                    if (response.ok) {
                      fetchModerationAlerts();
                      addToast('All notifications marked as read', 'success');
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-text-soft transition hover:text-emerald-400"
                >
                  Mark All Read
                </button>
              </div>
            </div>
            <div className="mt-5">
              {moderationLoading ? (
                <div className="flex items-center justify-center py-20 text-sm text-text-mute">
                  Loading moderation alerts...
                </div>
              ) : moderationAlerts.length === 0 ? (
                <div className="flex items-center justify-center py-20 text-sm text-text-mute">
                  No moderation alerts yet
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {moderationAlerts.map((alert: any) => {
                    const metadata = typeof alert.metadata === 'string' ? JSON.parse(alert.metadata) : alert.metadata || {};
                    const isRead = alert.is_read === 'TRUE' || alert.is_read === true;
                    return (
                      <div
                        key={alert.id}
                        className={`rounded-2xl border p-4 transition ${
                          isRead
                            ? 'border-white/10 bg-white/5'
                            : 'border-rose-500/30 bg-rose-500/10'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🛡️</span>
                              <h4 className="font-semibold text-text-base">{alert.title}</h4>
                              {!isRead && (
                                <span className="rounded-full bg-rose-500/20 text-rose-300 px-2 py-0.5 text-xs font-semibold">
                                  New
                                </span>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                alert.severity === 'high' ? 'bg-rose-500/20 text-rose-300' :
                                alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {alert.severity || 'medium'}
                              </span>
                            </div>
                            <p className="text-sm text-text-soft mb-3">{alert.message}</p>
                            <div className="grid gap-2 text-xs text-text-mute">
                              {metadata.senderName && (
                                <div>
                                  <span className="font-semibold">User:</span> {metadata.senderName} ({metadata.senderEmail})
                                </div>
                              )}
                              {metadata.projectTitle && (
                                <div>
                                  <span className="font-semibold">Project:</span> {metadata.projectTitle} (ID: {metadata.projectId})
                                </div>
                              )}
                              {metadata.detectedContent && (
                                <div>
                                  <span className="font-semibold">Detected:</span> <span className="text-rose-300">{metadata.detectedContent}</span>
                                </div>
                              )}
                              {metadata.blockedContent && (
                                <div className="mt-2 p-2 rounded-lg bg-black/20 border border-white/10">
                                  <span className="font-semibold">Blocked Message:</span>
                                  <p className="mt-1 text-text-soft font-mono text-xs break-all">{metadata.blockedContent}</p>
                                </div>
                              )}
                              {metadata.reasons && Array.isArray(metadata.reasons) && (
                                <div>
                                  <span className="font-semibold">Reasons:</span> {metadata.reasons.join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="mt-3 text-xs text-text-mute">
                              {formatDate(alert.created_at)}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {!isRead && (
                              <button
                                onClick={() => markNotificationRead(alert.id)}
                                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-text-base hover:bg-white/10 transition"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    let freelancers: any[] = [];
    let quoteRequests = 0;

    try {
      freelancers = await query(
        `
          SELECT id, display_name, status, verification_state, rating, created_at, updated_at
          FROM freelancers
          ORDER BY created_at DESC
          LIMIT 50
        `,
      );
    } catch (error: any) {
      if (error?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching freelancers:', error);
      }
    }

    const serializedFreelancers = Array.isArray(freelancers)
      ? freelancers.map((freelancer) => ({
          ...freelancer,
          created_at: freelancer?.created_at
            ? new Date(freelancer.created_at).toISOString()
            : null,
          updated_at: freelancer?.updated_at
            ? new Date(freelancer.updated_at).toISOString()
            : null,
        }))
      : [];

    let pendingCount = serializedFreelancers.filter((f) => f.status === 'pending').length;
    let approvedCount = serializedFreelancers.filter((f) => f.status === 'approved').length;

    try {
      const [row] = await query<{ count: number }>(
        `SELECT COUNT(*) as count FROM quote_requests WHERE status = 'pending'`,
      );
      quoteRequests = row?.count ?? 0;
    } catch (error: any) {
      if (error?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error counting quote requests:', error);
      }
    }

    return {
      props: {
        freelancers: serializedFreelancers,
        pendingCount,
        approvedCount,
        quoteRequests,
      },
    };
  } catch (error) {
    console.error('Error in admin page:', error);
    return {
      props: {
        freelancers: [],
        pendingCount: 0,
        approvedCount: 0,
        quoteRequests: 0,
      },
    };
  }
};

