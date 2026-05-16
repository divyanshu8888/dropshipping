import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../src/components/Header';
import {
  AlertTriangle,
  Clock,
  Ban,
  Eye,
  MessageSquare,
  ShieldAlert,
  X,
} from 'lucide-react';

interface ModerationStats {
  total_violations_today: number;
  total_violations_week: number;
  critical_violations_today: number;
  blocked_messages_today: number;
  muted_users_count: number;
}

interface Violation {
  message_id: string;
  rule_code: string;
  severity: string;
  action_taken: string;
  created_at: string;
  conversation_id: string;
  sender_name: string;
  sender_email: string;
}

interface MutedUser {
  user_id: string;
  user_name: string;
  user_email: string;
  conversation_id: string;
  muted_until: string | null;
  muted_at: string;
}

interface ActiveConversation {
  conversation_id: string;
  title: string;
  status: string;
  participant_count: number;
  last_message_at: string;
  violation_count: number;
}

interface ModerationDashboard {
  stats: ModerationStats;
  recent_violations: Violation[];
  muted_users: MutedUser[];
  active_conversations: ActiveConversation[];
}

const ModerationDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<ModerationDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'live' | 'violations' | 'muted' | 'conversations' | 'all-messages'>('live');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [allMessagesData, setAllMessagesData] = useState<{ messages: any[]; milestones: any[] } | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    };

    checkAuth();
  }, [router]);

  // Load moderation dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [servicesRes] = await Promise.all([
          fetch('/api/admin/activity-feed?type=services'),
          fetch('/api/admin/activity-feed?type=users'),
        ]);

        const servicesData = servicesRes.ok ? await servicesRes.json() : { activities: [] };

        const recentViolations: Violation[] = (servicesData.activities || []).map((activity: any) => ({
          message_id: activity.id,
          rule_code: activity.type || 'policy',
          severity: activity.rating >= 4 ? 'critical' : activity.rating >= 3 ? 'high' : 'medium',
          action_taken: activity.status || 'logged',
          created_at: activity.createdAt,
          conversation_id: activity.entityId || activity.id,
          sender_name: activity.user || 'Unknown',
          sender_email: activity.user?.includes('@') ? activity.user : `${activity.user}@example.com`
        }));

        const mutedUsers: MutedUser[] = [];

        const activeConversations: ActiveConversation[] = (servicesData.activities || []).map(
          (activity: any) => ({
            conversation_id: activity.entityId || activity.id,
            title: activity.message || 'Conversation',
            status: 'active',
            participant_count: 2,
            last_message_at: activity.createdAt,
            violation_count: activity.rating ? Math.max(1, Math.round(activity.rating)) : 1
          })
        );

        const stats: ModerationStats = {
          total_violations_today: recentViolations.length,
          total_violations_week: recentViolations.length,
          critical_violations_today: recentViolations.filter(
            (violation) => violation.severity === 'critical'
          ).length,
          blocked_messages_today: recentViolations.filter(
            (violation) => violation.action_taken === 'blocked'
          ).length,
          muted_users_count: mutedUsers.length
        };

        const dashboardPayload: ModerationDashboard = {
          stats,
          recent_violations: recentViolations,
          muted_users: mutedUsers,
          active_conversations: activeConversations
        };

        setDashboardData(dashboardPayload);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading moderation dashboard:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();

    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load all messages and milestone descriptions
  useEffect(() => {
    const loadAllMessages = async () => {
      if (selectedTab !== 'all-messages') return;

      try {
        setLoadingMessages(true);
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        const response = await fetch(`/api/admin/all-messages?userId=${user.id}&limit=200`);

        if (response.ok) {
          const data = await response.json();
          setAllMessagesData(data);
          setMessagesError(null);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to load messages' }));
          setMessagesError(errorData.error || 'Failed to load messages');
        }
      } catch (error) {
        console.error('Error loading all messages:', error);
        setMessagesError('Failed to load messages. Please try again.');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadAllMessages();
  }, [selectedTab]);

  // Toggle user mute
  const toggleUserMute = async (userId: string, conversationId: string) => {
    console.log('toggle mute', { userId, conversationId });
  };

  // Send system message to conversation
  const sendSystemMessage = async (conversationId: string, message: string) => {
    console.log('system message', { conversationId, message });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0D10]">
        <Header />
        <div className="flex items-center justify-center h-96 pt-28">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#0B0D10]">
        <Header />
        <div className="flex items-center justify-center h-96 pt-28">
          <div className="text-rose-400">Failed to load moderation dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D10]">
      <Head>
        <title>Moderation Dashboard - Admin</title>
        <meta name="description" content="Admin moderation dashboard for platform oversight" />
      </Head>

      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(239,68,68,0.25)_0%,rgba(24,24,27,0.95)_55%,rgba(11,13,16,1)_100%)] pt-28 pb-16 text-white">
        <div className="absolute inset-x-0 -bottom-16 h-32 bg-gradient-to-b from-transparent to-black/80" />
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <ShieldAlert className="h-3.5 w-3.5" />
              Moderation Command
            </span>
            <h1 className="font-display text-4xl leading-tight sm:text-5xl">
              Moderation{' '}
              <span className="bg-gradient-to-r from-rose-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="max-w-xl text-sm text-white/70">
              Monitor and manage platform communications, violations, and user activity in real time.
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-3 text-sm">
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-white/80 transition hover:border-white/40 hover:text-white"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center">
              <div className="p-2 bg-rose-500/15 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div className="ml-4">
                <p className="text-xs uppercase tracking-widest text-white/40">Violations Today</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboardData.stats.total_violations_today}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center">
              <div className="p-2 bg-amber-500/15 rounded-xl">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div className="ml-4">
                <p className="text-xs uppercase tracking-widest text-white/40">Critical Today</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboardData.stats.critical_violations_today}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500/15 rounded-xl">
                <Ban className="w-6 h-6 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-xs uppercase tracking-widest text-white/40">Blocked Today</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboardData.stats.blocked_messages_today}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center">
              <div className="p-2 bg-cyan-500/15 rounded-xl">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="ml-4">
                <p className="text-xs uppercase tracking-widest text-white/40">Muted Users</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboardData.stats.muted_users_count}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/15 rounded-xl">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="ml-4">
                <p className="text-xs uppercase tracking-widest text-white/40">Active Chats</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboardData.active_conversations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] mb-8">
          <div className="border-b border-white/10">
            <nav className="-mb-px flex space-x-1 px-6 overflow-x-auto">
              {[
                { id: 'live', name: 'Live Monitor', count: dashboardData?.active_conversations?.length || 0 },
                { id: 'violations', name: 'Recent Violations', count: dashboardData?.recent_violations?.length || 0 },
                { id: 'muted', name: 'Muted Users', count: dashboardData?.muted_users?.length || 0 },
                { id: 'conversations', name: 'All Conversations', count: dashboardData?.active_conversations?.length || 0 },
                { id: 'all-messages', name: '💬 All Messages & Descriptions', count: allMessagesData ? allMessagesData.messages.length + allMessagesData.milestones.length : null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    selectedTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/30'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      selectedTab === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.count === null && selectedTab === tab.id && loadingMessages && (
                    <span className="ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 inline-block"></div>
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Live Monitor Tab */}
            {selectedTab === 'live' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Active Conversations with Violations</h3>
                {dashboardData.active_conversations.map((conversation) => (
                  <div key={conversation.conversation_id} className="border border-white/10 rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{conversation.title}</h4>
                        <p className="text-sm text-white/60">
                          {conversation.participant_count} participants • {conversation.violation_count} violations
                        </p>
                        <p className="text-xs text-white/40">
                          Last activity: {new Date(conversation.last_message_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conversation.conversation_id)}
                          className="border border-white/10 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 px-4 py-2 text-sm transition-colors"
                        >
                          View Chat
                        </button>
                        <button
                          onClick={() => sendSystemMessage(conversation.conversation_id, 'Please keep pricing discussions out of chat. Use the Quote system instead.')}
                          className="border border-amber-500/30 bg-amber-500/10 text-amber-400 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-amber-500/20"
                        >
                          Send Notice
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Violations Tab */}
            {selectedTab === 'violations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Recent Violations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left rounded-tl-xl">
                          User
                        </th>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">
                          Rule
                        </th>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">
                          Severity
                        </th>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">
                          Action
                        </th>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">
                          Time
                        </th>
                        <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left rounded-tr-xl">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recent_violations.map((violation) => (
                        <tr key={violation.message_id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm text-white/80">
                            <div>
                              <div className="font-medium text-white">{violation.sender_name}</div>
                              <div className="text-white/50 text-xs">{violation.sender_email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                              {violation.rule_code}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              violation.severity === 'critical'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                : violation.severity === 'high'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : violation.severity === 'medium'
                                ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                                : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                            }`}>
                              {violation.severity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white/80">
                            {violation.action_taken}
                          </td>
                          <td className="px-4 py-3 text-sm text-white/50">
                            {new Date(violation.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => toggleUserMute(violation.sender_email, violation.conversation_id)}
                              className="border border-rose-500/30 bg-rose-500/10 text-rose-400 rounded-xl px-3 py-1 text-xs transition-colors hover:bg-rose-500/20"
                            >
                              Mute User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Muted Users Tab */}
            {selectedTab === 'muted' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Currently Muted Users</h3>
                {dashboardData.muted_users.map((user) => (
                  <div key={user.user_id} className="border border-white/10 rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{user.user_name}</h4>
                        <p className="text-sm text-white/60">{user.user_email}</p>
                        <p className="text-xs text-white/40">
                          Muted since: {new Date(user.muted_at).toLocaleString()}
                          {user.muted_until && (
                            <span> • Until: {new Date(user.muted_until).toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleUserMute(user.user_id, user.conversation_id)}
                        className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-emerald-500/20"
                      >
                        Unmute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Conversations Tab */}
            {selectedTab === 'conversations' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">All Active Conversations</h3>
                {dashboardData.active_conversations.map((conversation) => (
                  <div key={conversation.conversation_id} className="border border-white/10 rounded-xl p-4 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{conversation.title}</h4>
                        <p className="text-sm text-white/60">
                          Status: {conversation.status} • {conversation.participant_count} participants
                        </p>
                        <p className="text-xs text-white/40">
                          Last activity: {new Date(conversation.last_message_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conversation.conversation_id)}
                          className="border border-white/10 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 px-4 py-2 text-sm transition-colors"
                        >
                          Monitor
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Messages & Descriptions Tab */}
            {selectedTab === 'all-messages' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">All Messages & Milestone Descriptions</h3>
                  {loadingMessages && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
                  )}
                </div>

                {allMessagesData && (
                  <>
                    {/* Messages Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-widest">
                        Chat Messages ({allMessagesData.messages.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {allMessagesData.messages.length === 0 ? (
                          <p className="text-sm text-white/40">No messages found</p>
                        ) : (
                          allMessagesData.messages.map((message: any) => (
                            <div key={message.id} className="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">
                                      {message.sender_name || message.sender_email}
                                    </span>
                                    <span className="text-xs text-white/40">({message.sender_role})</span>
                                    {message.project_title && (
                                      <span className="text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                        Project: {message.project_title}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-white/70 whitespace-pre-wrap">{message.body}</p>
                                  {message.message_type && message.message_type !== 'text' && (
                                    <span className="inline-block mt-1 text-xs bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                                      Type: {message.message_type}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/40 ml-4">
                                  {new Date(message.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Milestone Descriptions Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-widest">
                        Milestone Descriptions ({allMessagesData.milestones.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {allMessagesData.milestones.length === 0 ? (
                          <p className="text-sm text-white/40">No milestone descriptions found</p>
                        ) : (
                          allMessagesData.milestones.map((milestone: any) => (
                            <div key={milestone.milestone_id} className="border border-white/10 rounded-xl p-4 bg-amber-500/[0.04]">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-white">
                                      {milestone.milestone_title}
                                    </span>
                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                      milestone.status === 'approved' || milestone.status === 'released'
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                        : milestone.status === 'submitted'
                                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                                        : milestone.status === 'in_progress'
                                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                        : 'bg-white/10 text-white/50 border border-white/10'
                                    }`}>
                                      {milestone.status}
                                    </span>
                                    {milestone.project_title && (
                                      <span className="text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                        Project: {milestone.project_title}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-white/50 mb-1">
                                    Freelancer: {milestone.freelancer_name || milestone.freelancer_email || 'N/A'} •{' '}
                                    Client: {milestone.client_name || milestone.client_email || 'N/A'}
                                  </div>
                                  <p className="text-sm text-white/70 whitespace-pre-wrap bg-white/[0.03] p-2 rounded-lg border border-white/10">
                                    {milestone.description}
                                  </p>
                                </div>
                                <div className="text-xs text-white/40 ml-4">
                                  Updated: {new Date(milestone.updated_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}

                {loadingMessages && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="ml-3 text-sm text-white/60">Loading messages and descriptions...</span>
                  </div>
                )}

                {messagesError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                    <p className="text-sm text-rose-400">{messagesError}</p>
                    <button
                      onClick={() => {
                        setMessagesError(null);
                        const userData = localStorage.getItem('user');
                        if (userData) {
                          const user = JSON.parse(userData);
                          fetch(`/api/admin/all-messages?userId=${user.id}&limit=200`)
                            .then(res => res.json())
                            .then(data => setAllMessagesData(data))
                            .catch(() => setMessagesError('Failed to load messages'));
                        }
                      }}
                      className="mt-2 text-sm text-rose-400 hover:text-rose-300 underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!allMessagesData && !loadingMessages && !messagesError && (
                  <p className="text-sm text-white/40">Click the tab to load all messages and descriptions</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Conversation Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="rounded-2xl border border-white/10 bg-[#0F1115] w-full max-w-4xl h-96 mx-4">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Conversation Monitor</h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 h-full overflow-y-auto">
                <div className="text-center text-white/40">
                  Conversation monitoring interface would go here
                  <br />
                  <small className="text-white/30">Chat ID: {selectedConversation}</small>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModerationDashboard;
