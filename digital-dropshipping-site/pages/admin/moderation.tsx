import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../src/components/Header';

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

        const [servicesRes, usersRes] = await Promise.all([
          fetch('/api/admin/activity-feed?type=services'),
          fetch('/api/admin/activity-feed?type=users')
        ]);

        const servicesData = servicesRes.ok ? await servicesRes.json() : { activities: [] };
        const usersData = usersRes.ok ? await usersRes.json() : { activities: [] };

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-96 pt-28">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-96 pt-28">
          <div className="text-red-600">Failed to load moderation dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>Moderation Dashboard - Admin</title>
        <meta name="description" content="Admin moderation dashboard for platform oversight" />
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Moderation Dashboard</h1>
              <p className="mt-2 text-gray-600">Monitor and manage platform communications</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Violations Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.total_violations_today}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.critical_violations_today}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.blocked_messages_today}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Muted Users</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.stats.muted_users_count}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.active_conversations.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
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
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      selectedTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.count === null && selectedTab === tab.id && loadingMessages && (
                    <span className="ml-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 inline-block"></div>
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
                <h3 className="text-lg font-semibold text-gray-900">Active Conversations with Violations</h3>
                {dashboardData.active_conversations.map((conversation) => (
                  <div key={conversation.conversation_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                        <p className="text-sm text-gray-600">
                          {conversation.participant_count} participants • {conversation.violation_count} violations
                        </p>
                        <p className="text-xs text-gray-500">
                          Last activity: {new Date(conversation.last_message_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conversation.conversation_id)}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                        >
                          View Chat
                        </button>
                        <button
                          onClick={() => sendSystemMessage(conversation.conversation_id, 'Please keep pricing discussions out of chat. Use the Quote system instead.')}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
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
                <h3 className="text-lg font-semibold text-gray-900">Recent Violations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rule
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.recent_violations.map((violation) => (
                        <tr key={violation.message_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{violation.sender_name}</div>
                              <div className="text-sm text-gray-500">{violation.sender_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {violation.rule_code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              violation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              violation.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {violation.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {violation.action_taken}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(violation.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleUserMute(violation.sender_email, violation.conversation_id)}
                              className="text-indigo-600 hover:text-indigo-900"
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
                <h3 className="text-lg font-semibold text-gray-900">Currently Muted Users</h3>
                {dashboardData.muted_users.map((user) => (
                  <div key={user.user_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.user_name}</h4>
                        <p className="text-sm text-gray-600">{user.user_email}</p>
                        <p className="text-xs text-gray-500">
                          Muted since: {new Date(user.muted_at).toLocaleString()}
                          {user.muted_until && (
                            <span> • Until: {new Date(user.muted_until).toLocaleString()}</span>
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleUserMute(user.user_id, user.conversation_id)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
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
                <h3 className="text-lg font-semibold text-gray-900">All Active Conversations</h3>
                {dashboardData.active_conversations.map((conversation) => (
                  <div key={conversation.conversation_id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{conversation.title}</h4>
                        <p className="text-sm text-gray-600">
                          Status: {conversation.status} • {conversation.participant_count} participants
                        </p>
                        <p className="text-xs text-gray-500">
                          Last activity: {new Date(conversation.last_message_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedConversation(conversation.conversation_id)}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
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
                  <h3 className="text-lg font-semibold text-gray-900">All Messages & Milestone Descriptions</h3>
                  {loadingMessages && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  )}
                </div>

                {allMessagesData && (
                  <>
                    {/* Messages Section */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Chat Messages ({allMessagesData.messages.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {allMessagesData.messages.length === 0 ? (
                          <p className="text-sm text-gray-500">No messages found</p>
                        ) : (
                          allMessagesData.messages.map((message: any) => (
                            <div key={message.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">
                                      {message.sender_name || message.sender_email}
                                    </span>
                                    <span className="text-xs text-gray-500">({message.sender_role})</span>
                                    {message.project_title && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        Project: {message.project_title}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.body}</p>
                                  {message.message_type && message.message_type !== 'text' && (
                                    <span className="inline-block mt-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                                      Type: {message.message_type}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
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
                      <h4 className="text-md font-semibold text-gray-800 mb-3">
                        Milestone Descriptions ({allMessagesData.milestones.length})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {allMessagesData.milestones.length === 0 ? (
                          <p className="text-sm text-gray-500">No milestone descriptions found</p>
                        ) : (
                          allMessagesData.milestones.map((milestone: any) => (
                            <div key={milestone.milestone_id} className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {milestone.milestone_title}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      milestone.status === 'approved' || milestone.status === 'released' ? 'bg-green-100 text-green-700' :
                                      milestone.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                      milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {milestone.status}
                                    </span>
                                    {milestone.project_title && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                        Project: {milestone.project_title}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    Freelancer: {milestone.freelancer_name || milestone.freelancer_email || 'N/A'} • 
                                    Client: {milestone.client_name || milestone.client_email || 'N/A'}
                                  </div>
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-gray-200">
                                    {milestone.description}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-500 ml-4">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-sm text-gray-600">Loading messages and descriptions...</span>
                  </div>
                )}

                {messagesError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{messagesError}</p>
                    <button
                      onClick={() => {
                        setMessagesError(null);
                        const userData = localStorage.getItem('user');
                        if (userData) {
                          const user = JSON.parse(userData);
                          fetch(`/api/admin/all-messages?userId=${user.id}&limit=200`)
                            .then(res => res.json())
                            .then(data => setAllMessagesData(data))
                            .catch(err => setMessagesError('Failed to load messages'));
                        }
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!allMessagesData && !loadingMessages && !messagesError && (
                  <p className="text-sm text-gray-500">Click the tab to load all messages and descriptions</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Conversation Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl h-96 mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Conversation Monitor</h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4 h-full overflow-y-auto">
                <div className="text-center text-gray-500">
                  Conversation monitoring interface would go here
                  <br />
                  <small>Chat ID: {selectedConversation}</small>
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
