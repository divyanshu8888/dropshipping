import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../src/components/Header'
import { 
  EntityDrawer, 
  CommandBar, 
  DataGrid, 
  EditableCard, 
  KanbanPipeline, 
  EventStream 
} from '../src/components/admin'
import { useToast } from '../src/components/Toast'
import { supabase } from '../src/lib/supabase'

interface DashboardMetrics {
  // Real KPIs
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
  type: 'user_registered' | 'freelancer_registered' | 'client_registered' | 'work_request' | 'project_created' | 'order_placed' | 'service_created' | 'review_posted' | 'quote_request' | 'escrow_funded' | 'chat_flagged' | 'dispute_opened';
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
}

interface AdminProps {
  freelancers: any[];
  pendingCount: number;
  approvedCount: number;
  quoteRequests: number;
}

export default function AdminDashboard({ freelancers, pendingCount, approvedCount, quoteRequests }: AdminProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [user, setUser] = useState<{name: string, role: string} | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Real data from database
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [activityTab, setActivityTab] = useState<'all' | 'users' | 'clients' | 'services'>('all')
  const [activityLoading, setActivityLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // New control room state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [selectedEntityType, setSelectedEntityType] = useState<'user' | 'order' | 'project' | 'service' | 'dispute' | 'kyc'>('user')
  const [workQueueData, setWorkQueueData] = useState<any>({
    pendingKYC: [],
    refundRequests: [],
    chargebacks: [],
    payoutHolds: [],
    failedWebhooks: []
  })
  
  // Advanced control room state
  const [kanbanColumns, setKanbanColumns] = useState<any[]>([])
  const [eventStream, setEventStream] = useState<any[]>([])
  const [isStreamPaused, setIsStreamPaused] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    
    const userObj = JSON.parse(userData)
    if (userObj.role !== 'ADMIN' && userObj.role !== 'TEAM_MEMBER') {
      router.push('/login')
      return
    }

    setUser(userObj)
    setLoading(false)
  }, [router])

  // Fetch dashboard data (metrics only)
  useEffect(() => {
    const fetchDashboardData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setDataLoading(true)
        } else {
          setIsRefreshing(true)
        }
        
        // Fetch only metrics
        const metricsResponse = await fetch('/api/admin/dashboard-metrics')

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData.metrics)
          setLastUpdated(metricsData.lastUpdated)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        if (isInitialLoad) {
          setDataLoading(false)
        } else {
          setIsRefreshing(false)
        }
      }
    }

    if (!loading) {
      // Initial load with loading state
      fetchDashboardData(true)
      
      // Set up auto-refresh every 30 seconds (without loading state)
      const interval = setInterval(() => fetchDashboardData(false), 30000)
      return () => clearInterval(interval)
    }
  }, [loading])

  // Fetch activity feed data separately
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        setActivityLoading(true)
        const activityResponse = await fetch(`/api/admin/activity-feed?type=${activityTab}`)
        
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setActivityFeed(activityData.activities)
        }
      } catch (error) {
        console.error('Error fetching activity data:', error)
      } finally {
        setActivityLoading(false)
      }
    }

    if (!loading) {
      fetchActivityData()
    }
  }, [activityTab, loading])

  // Fetch work queue data on mount
  useEffect(() => {
    if (!loading) {
      fetchWorkQueueData()
      fetchKanbanData()
      fetchEventStream()
    }
  }, [loading])


  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return '👨‍💻'
      case 'freelancer_registered': return '👨‍💼'
      case 'client_registered': return '👨‍💻'
      case 'work_request': return '💬'
      case 'project_created': return '📋'
      case 'order_placed': return '🛒'
      case 'service_created': return '🔧'
      case 'review_posted': return '⭐'
      case 'quote_request': return '💰'
      case 'escrow_funded': return '🔒'
      case 'chat_flagged': return '🚫'
      case 'dispute_opened': return '⚖️'
      default: return '📢'
    }
  }

  // Control room handlers
  const handleEntitySelect = (entityType: string, entityId: string) => {
    setSelectedEntityType(entityType as any)
    setSelectedEntity({ id: entityId })
    setDrawerOpen(true)
  }

  const handleActionExecute = async (action: string, params: any) => {
    try {
      // Optimistic update
      addToast(`Executing ${action}...`, 'info', 1000)
      
      const response = await fetch('/api/admin/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params })
      })
      
      if (response.ok) {
        addToast(`${action} completed successfully`, 'success')
        // Refresh data
        fetchDashboardData()
        fetchWorkQueueData()
      } else {
        throw new Error('Action failed')
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      addToast(`Failed to execute ${action}`, 'error')
    }
  }

  const handleWorkQueueBulkAction = async (action: string, selectedRows: any[]) => {
    try {
      const response = await fetch('/api/admin/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rows: selectedRows })
      })
      
      if (response.ok) {
        console.log(`Bulk ${action} completed for ${selectedRows.length} items`)
        // Refresh work queue data
        fetchWorkQueueData()
      }
    } catch (error) {
      console.error(`Error executing bulk ${action}:`, error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const metricsResponse = await fetch('/api/admin/dashboard-metrics')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData.metrics)
        setLastUpdated(metricsData.lastUpdated)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchWorkQueueData = async () => {
    try {
      const response = await fetch('/api/admin/work-queue-data')
      const data = await response.json()
      if (data.success) {
        setWorkQueueData(data.data)
      }
    } catch (error) {
      console.error('Error fetching work queue data:', error)
    }
  }

  // Advanced control room handlers
  const handleKPIEdit = async (field: string, newValue: string | number) => {
    try {
      addToast(`Updating ${field}...`, 'info', 1000)
      
      const response = await fetch('/api/admin/update-kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: newValue })
      })
      
      if (response.ok) {
        addToast(`${field} updated successfully`, 'success')
        fetchDashboardData()
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      addToast(`Failed to update ${field}`, 'error')
    }
  }

  const handleKanbanCardMove = async (cardId: string, fromStatus: string, toStatus: string) => {
    try {
      addToast(`Moving card to ${toStatus}...`, 'info', 1000)
      
      const response = await fetch('/api/admin/move-kanban-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, fromStatus, toStatus })
      })
      
      if (response.ok) {
        addToast('Card moved successfully', 'success')
        fetchKanbanData()
      } else {
        throw new Error('Move failed')
      }
    } catch (error) {
      addToast('Failed to move card', 'error')
    }
  }

  const handleEventClick = (event: any) => {
    // Open entity drawer based on event type
    const entityTypeMap: Record<string, string> = {
      'user_registered': 'user',
      'order_placed': 'order',
      'project_created': 'project',
      'service_created': 'service',
      'dispute_opened': 'dispute'
    }
    
    const entityType = entityTypeMap[event.type] || 'user'
    handleEntitySelect(entityType, event.entityId || event.id)
  }

  const fetchKanbanData = async () => {
    try {
      const response = await fetch('/api/admin/kanban-data')
      const data = await response.json()
      if (data.success) {
        setKanbanColumns(data.columns)
      }
    } catch (error) {
      console.error('Error fetching kanban data:', error)
    }
  }

  const fetchEventStream = async () => {
    try {
      const response = await fetch('/api/admin/event-stream')
      const data = await response.json()
      if (data.success) {
        setEventStream(data.events)
      }
    } catch (error) {
      console.error('Error fetching event stream:', error)
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-cyan mx-auto"></div>
          <p className="mt-4 text-text-soft">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-text-soft">Failed to load dashboard data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-violet transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const StatCard = ({ title, value, icon, color, change, onClick }: any) => (
    <div 
      className="relative bg-bg-surface rounded-2xl shadow-card border border-white/5 p-6 transform hover:-translate-y-1 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
      <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
      <div className="relative flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-text-base">{value}</div>
          <div className="text-text-soft font-medium">{title}</div>
          {change && (
            <div className={`text-sm font-semibold ${change > 0 ? 'text-accent-cyan' : 'text-red-400'}`}>
              {change > 0 ? '+' : ''}{change}% vs last week
            </div>
          )}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-3xl shadow-metallic group-hover:animate-metallic-glow`}>
          {icon}
        </div>
      </div>
    </div>
  )

  const PipelineStage = ({ stage, count, change, color }: any) => (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-4 h-4 rounded-full ${color}`}></div>
        <span className="text-2xl font-bold text-gray-900">{count}</span>
      </div>
      <div className="text-sm text-gray-600">{stage}</div>
      <div className={`text-xs font-semibold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change > 0 ? '+' : ''}{change}%
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Admin Dashboard - Uniti</title>
      </Head>
      <div className="min-h-screen bg-bg-base">
        <Header />
        
        {/* Command Bar */}
        <CommandBar 
          onEntitySelect={handleEntitySelect}
          onActionExecute={handleActionExecute}
        />
        
        {/* Entity Drawer */}
        <EntityDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          entity={selectedEntity}
          entityType={selectedEntityType}
        />

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-hero-gradient"></div>
          <div className="relative bg-gradient-to-r from-accent-blue to-accent-violet text-white py-12 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">🧭 Admin Command Center</h1>
                <p className="text-xl text-white/80">Welcome back, {user?.name}! Platform health overview & management</p>
                {lastUpdated && (
                  <p className="text-sm text-white/60 mt-2">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                    {isRefreshing && (
                      <span className="ml-2 text-white/80">
                        <span className="animate-spin inline-block">🔄</span> Refreshing...
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('user')
                    router.push('/login')
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex space-x-4">
              {[
                { id: 'overview', label: '📊 Overview', icon: '📊' },
                { id: 'finance', label: '💰 Finance', icon: '💰' },
                { id: 'moderation', label: '🛡️ Moderation', icon: '🛡️' },
                { id: 'operations', label: '⚙️ Operations', icon: '⚙️' },
                { id: 'users', label: '👥 Users', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* Real KPIs Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Key Performance Indicators</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <EditableCard
                    title="GMV Today"
                    value={formatCurrency(metrics.gmvToday)}
                    icon="💰"
                    color="from-green-500 to-emerald-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('gmvToday', newValue)}
                    fastActions={[
                      { label: 'Export Transactions (CSV)', action: 'export_transactions', icon: '📊' },
                      { label: 'View Transaction Details', action: 'view_transactions', icon: '👁️' }
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="GMV (MTD)"
                    value={formatCurrency(metrics.gmvMTD)}
                    icon="📈"
                    color="from-blue-500 to-cyan-500"
                    change={metrics.revenueChange}
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('gmvMTD', newValue)}
                    fastActions={[
                      { label: 'Adjust Revenue Target', action: 'adjust_revenue_target', icon: '🎯' },
                      { label: 'Generate Revenue Report', action: 'generate_revenue_report', icon: '📈' }
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="GMV (28d)"
                    value={formatCurrency(metrics.gmvTrailing28d)}
                    icon="📊"
                    color="from-purple-500 to-pink-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('gmvTrailing28d', newValue)}
                  />
                  <EditableCard
                    title="Net Revenue"
                    value={formatCurrency(metrics.netRevenueAfterRefunds)}
                    icon="💸"
                    color="from-indigo-500 to-purple-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('netRevenueAfterRefunds', newValue)}
                    fastActions={[
                      { label: 'Adjust Platform Fee', action: 'adjust_platform_fee', icon: '⚙️' },
                      { label: 'Process Refunds', action: 'process_refunds', icon: '💰' }
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="Average Order Value"
                    value={formatCurrency(metrics.aov)}
                    icon="🛒"
                    color="from-yellow-500 to-orange-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('aov', newValue)}
                  />
                  <EditableCard
                    title="Active Users"
                    value={metrics.activeUsers}
                    icon="👥"
                    color="from-teal-500 to-cyan-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('activeUsers', newValue)}
                    fastActions={[
                      { label: 'Send User Notification', action: 'send_user_notification', icon: '📧' },
                      { label: 'Export User List', action: 'export_users', icon: '👥' }
                    ]}
                    onFastAction={handleActionExecute}
                  />
                  <EditableCard
                    title="Total Orders"
                    value={metrics.totalOrders}
                    icon="📦"
                    color="from-red-500 to-pink-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('totalOrders', newValue)}
                  />
                  <EditableCard
                    title="Conversion Rate"
                    value={`${metrics.conversionRate}%`}
                    icon="🎯"
                    color="from-emerald-500 to-green-500"
                    editable={true}
                    onEdit={(newValue) => handleKPIEdit('conversionRate', newValue)}
                    fastActions={[
                      { label: 'Optimize Conversion', action: 'optimize_conversion', icon: '🚀' },
                      { label: 'A/B Test Landing Page', action: 'ab_test_landing', icon: '🧪' }
                    ]}
                    onFastAction={handleActionExecute}
                  />
                </div>
              </div>

              {/* Work Queue Section - Actionable Tables */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Work Queue - Action Required</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending KYC */}
                  <DataGrid
                    title="Pending KYC"
                    rows={workQueueData.pendingKYC}
                    columns={[
                      { field: 'email', headerName: 'Email' },
                      { field: 'role', headerName: 'Role' },
                      { field: 'created_at', headerName: 'Submitted', renderCell: (row) => 
                        new Date(row.created_at).toLocaleDateString()
                      },
                      { field: 'status', headerName: 'Status', renderCell: (row) => (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {row.status}
                        </span>
                      )}
                    ]}
                    onRowClick={(row) => handleEntitySelect('kyc', row.id)}
                    bulkActions={[
                      { label: 'Approve All', action: 'approve_kyc', icon: '✅' },
                      { label: 'Reject All', action: 'reject_kyc', icon: '❌', variant: 'destructive' }
                    ]}
                    onBulkAction={handleWorkQueueBulkAction}
                    filters={[
                      { field: 'role', label: 'Role', options: [
                        { value: 'freelancer', label: 'Freelancer' },
                        { value: 'client', label: 'Client' }
                      ]},
                      { field: 'status', label: 'Status', options: [
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' }
                      ]}
                    ]}
                  />

                  {/* Refund Requests */}
                  <DataGrid
                    title="Refund Requests"
                    rows={workQueueData.refundRequests}
                    columns={[
                      { field: 'id', headerName: 'Order ID' },
                      { field: 'total_amount', headerName: 'Amount', renderCell: (row) => 
                        `$${row.total_amount}`
                      },
                      { field: 'status', headerName: 'Status' },
                      { field: 'created_at', headerName: 'Requested', renderCell: (row) => 
                        new Date(row.created_at).toLocaleDateString()
                      }
                    ]}
                    onRowClick={(row) => handleEntitySelect('order', row.id)}
                    bulkActions={[
                      { label: 'Approve Refunds', action: 'approve_refunds', icon: '✅' },
                      { label: 'Reject Refunds', action: 'reject_refunds', icon: '❌', variant: 'destructive' }
                    ]}
                    onBulkAction={handleWorkQueueBulkAction}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Event Stream */}
                <div className="lg:col-span-2">
                  <EventStream
                    events={eventStream}
                    onEventClick={handleEventClick}
                    onAssign={(eventId, assignee) => {
                      addToast(`Assigned event to ${assignee}`, 'success')
                    }}
                    onPin={(eventId) => {
                      addToast('Event pinned', 'success')
                    }}
                    filters={[
                      { field: 'event_type', label: 'Event Type', options: [
                        { value: 'user_registered', label: 'User Registration' },
                        { value: 'order_placed', label: 'Order Placed' },
                        { value: 'project_created', label: 'Project Created' },
                        { value: 'service_created', label: 'Service Created' },
                        { value: 'kyc_submitted', label: 'KYC Submitted' },
                        { value: 'payment_processed', label: 'Payment Processed' },
                        { value: 'dispute_opened', label: 'Dispute Opened' },
                        { value: 'review_posted', label: 'Review Posted' },
                        { value: 'message_flagged', label: 'Message Flagged' }
                      ]},
                      { field: 'priority', label: 'Priority', options: [
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' }
                      ]},
                      { field: 'status', label: 'Status', options: [
                        { value: 'active', label: 'Active' },
                        { value: 'archived', label: 'Archived' },
                        { value: 'deleted', label: 'Deleted' }
                      ]}
                    ]}
                    onFilterChange={(filters) => {
                      console.log('Event filters changed:', filters)
                    }}
                  />
                </div>

                {/* Kanban Pipeline */}
                <KanbanPipeline
                  columns={kanbanColumns}
                  onCardMove={handleKanbanCardMove}
                  onCardClick={(card) => handleEntitySelect('project', card.id)}
                  onAddCard={(status) => {
                    addToast(`Adding new card to ${status}`, 'info')
                    // Handle add card logic
                  }}
                />
                        </div>

              {/* Quick Actions */}
              <div className="relative bg-bg-surface rounded-2xl shadow-card border border-white/5 p-6">
                <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
                <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-text-base mb-6">⚡ Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Link href="/admin/quotes" className="group p-4 border-2 border-white/10 rounded-xl hover:border-accent-blue/50 hover:bg-white/5 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💬</div>
                    <div className="font-semibold text-text-base">Quote Requests</div>
                    <div className="text-sm text-text-mute">{quoteRequests} pending</div>
                  </Link>
                  <Link href="/admin/products-enhanced" className="group p-4 border-2 border-white/10 rounded-xl hover:border-accent-violet/50 hover:bg-white/5 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
                    <div className="font-semibold text-text-base">Manage Products</div>
                    <div className="text-sm text-text-mute">Add & edit items with image upload</div>
                  </Link>
                  <Link href="/admin/setup" className="group p-4 border-2 border-white/10 rounded-xl hover:border-yellow-400/50 hover:bg-yellow-500/10 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚙️</div>
                    <div className="font-semibold text-text-base">Database Setup</div>
                    <div className="text-sm text-text-mute">Create tables & sample data</div>
                  </Link>
                  <Link href="/admin/orders" className="group p-4 border-2 border-white/10 rounded-xl hover:border-accent-cyan/50 hover:bg-white/5 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
                    <div className="font-semibold text-text-base">Order Management</div>
                    <div className="text-sm text-text-mute">{metrics.activeOrders} active</div>
                  </Link>
                  <button className="group p-4 border-2 border-white/10 rounded-xl hover:border-red-400/50 hover:bg-red-500/10 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛡️</div>
                    <div className="font-semibold text-text-base">Moderation</div>
                    <div className="text-sm text-text-mute">{metrics.chatsUnderReview} under review</div>
                          </button>
                  <Link href="/admin/team" className="group p-4 border-2 border-white/10 rounded-xl hover:border-accent-blue/50 hover:bg-white/5 transition-all text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                    <div className="font-semibold text-text-base">Team Management</div>
                    <div className="text-sm text-text-mute">Manage team members</div>
                  </Link>
                </div>
                </div>
              </div>
                            </>
                          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Escrow & Payouts</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Total Escrow Balance</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(125000)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Pending Release Approvals</span>
                    <span className="text-xl font-semibold text-orange-600">{formatCurrency(metrics.pendingPayouts)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Upcoming Payout Runs</span>
                    <span className="text-xl font-semibold text-blue-600">3 scheduled</span>
                        </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Refunds This Week</span>
                    <span className="text-xl font-semibold text-red-600">{formatCurrency(2400)}</span>
            </div>
          </div>
        </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Revenue Analytics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Platform Commission</span>
                    <span className="text-xl font-semibold text-purple-600">15.2%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Net Payouts to Freelancers</span>
                    <span className="text-xl font-semibold text-green-600">{formatCurrency(40100)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Refund Ratio</span>
                    <span className="text-xl font-semibold text-orange-600">2.1%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Revenue Trend</span>
                    <span className="text-xl font-semibold text-green-600">↗ +18% MoM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'moderation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🛡️ Moderation Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Messages Blocked</span>
                    <span className="text-xl font-semibold text-red-600">{metrics.moderation.messagesBlocked} this week</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Muted Users</span>
                    <span className="text-xl font-semibold text-orange-600">{metrics.moderation.mutedUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Top Violation Type</span>
                    <span className="text-xl font-semibold text-purple-600">{metrics.moderation.topViolationType}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Chats Under Review</span>
                    <span className="text-xl font-semibold text-blue-600">{metrics.moderation.chatsUnderReview}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <button className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                    View Flagged Chats
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Violation Breakdown</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Contact Sharing</span>
                    <span className="text-xl font-semibold text-red-600">61%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Pricing Language</span>
                    <span className="text-xl font-semibold text-orange-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">External URLs</span>
                    <span className="text-xl font-semibold text-yellow-600">12%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">PII Sharing</span>
                    <span className="text-xl font-semibold text-purple-600">4%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">👥 User Analytics</h2>
                  <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Active Freelancers</span>
                    <span className="text-xl font-semibold text-blue-600">{metrics.activeFreelancers} (▲15% MoM)</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Active Clients</span>
                    <span className="text-xl font-semibold text-green-600">{metrics.activeClients} (▲10% MoM)</span>
                    </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Verified Suppliers</span>
                    <span className="text-xl font-semibold text-purple-600">{metrics.verifiedSuppliers}</span>
                    </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Applications Pending</span>
                    <span className="text-xl font-semibold text-orange-600">{metrics.applicationsPending}</span>
                    </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Suspended Accounts</span>
                    <span className="text-xl font-semibold text-red-600">{metrics.suspendedAccounts}</span>
                    </div>
                    </div>
                  </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📦 Dropshipping Summary</h2>
                  <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Orders in Fulfillment</span>
                    <span className="text-xl font-semibold text-blue-600">32</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Avg Fulfillment Time</span>
                    <span className="text-xl font-semibold text-green-600">19 hrs</span>
                    </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Supplier Fill Rate</span>
                    <span className="text-xl font-semibold text-purple-600">98%</span>
                    </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Avg Margin per Order</span>
                    <span className="text-xl font-semibold text-green-600">18.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
          )}

          {activeTab === 'operations' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Platform Operations</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Freelancer Approvals</span>
                    <span className="text-xl font-semibold text-orange-600">{metrics.applicationsPending} pending</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Product Updates</span>
                    <span className="text-xl font-semibold text-blue-600">3 pending</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Unreplied Quotes</span>
                    <span className="text-xl font-semibold text-yellow-600">6 overdue</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">System Flags</span>
                    <span className="text-xl font-semibold text-red-600">2 active</span>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <button className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
                    Approve All Pending
                      </button>
                  <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Review System Flags
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 System Health</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Database Latency</span>
                    <span className="text-xl font-semibold text-green-600">✅ {metrics.systemHealth.databaseLatency}ms</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Edge Function Errors</span>
                    <span className={`text-xl font-semibold ${metrics.systemHealth.edgeFunctionErrors > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {metrics.systemHealth.edgeFunctionErrors > 0 ? '⚠️' : '✅'} {metrics.systemHealth.edgeFunctionErrors} today
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Email API Uptime</span>
                    <span className="text-xl font-semibold text-green-600">✅ {metrics.systemHealth.emailApiUptime}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">Payment Webhook</span>
                    <span className="text-xl font-semibold text-green-600">✅ {metrics.systemHealth.paymentWebhook}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-medium">File Scan Service</span>
                    <span className="text-xl font-semibold text-green-600">✅ {metrics.systemHealth.fileScanService}</span>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* Notifications & Tasks Panel */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Notifications & Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border-2 border-orange-200 rounded-xl bg-orange-50">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-900">Approve Pending Freelancers</div>
                <div className="text-sm text-gray-600">{metrics.applicationsPending} waiting</div>
              </div>
              <div className="p-4 border-2 border-red-200 rounded-xl bg-red-50">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="font-semibold text-gray-900">Review Flagged Chats</div>
                <div className="text-sm text-gray-600">{metrics.chatsUnderReview} under review</div>
              </div>
              <div className="p-4 border-2 border-green-200 rounded-xl bg-green-50">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-gray-900">Release Escrow</div>
                <div className="text-sm text-gray-600">3 completed projects</div>
              </div>
              <div className="p-4 border-2 border-purple-200 rounded-xl bg-purple-50">
                <div className="text-2xl mb-2">⚖️</div>
                <div className="font-semibold text-gray-900">Respond to Disputes</div>
                <div className="text-sm text-gray-600">{metrics.openDisputes} open cases</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    let freelancers = []
    let quoteRequests = 0

    try {
      const { data: freelancersData, error } = await supabase
      .from('freelancers')
      .select('*')
      .order('created_at', { ascending: false })

      if (!error && freelancersData) {
        freelancers = freelancersData
      }

      // Fetch quote requests count from Supabase
      try {
    const { count: quoteCount } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        quoteRequests = quoteCount || 0;
      } catch (supabaseError) {
        console.log('Error fetching quote requests count:', supabaseError);
      }
    } catch (supabaseError) {
      console.log('Supabase not configured, using fallback data')
    }

    const pendingCount = freelancers?.filter(f => f.status === 'pending').length || 0
    const approvedCount = freelancers?.filter(f => f.status === 'approved').length || 0

    return {
      props: {
        freelancers: freelancers || [],
        pendingCount,
        approvedCount,
        quoteRequests,
      },
    }
  } catch (error) {
    console.error('Error in admin page:', error)
    return {
      props: {
        freelancers: [],
        pendingCount: 0,
        approvedCount: 0,
        quoteRequests: 0,
      },
    }
  }
}
