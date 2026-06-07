import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../../src/components/Header'));
import { useAuth } from '../../src/contexts/AuthContext';
import { useRoleGuard } from '../../src/lib/useRoleGuard';
import { useToast } from '../../src/components/Toast';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  Download,
  FileText,
  Info,
  MessageCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Star,
  Target,
  Upload,
  User,
  DollarSign,
  Activity,
  Briefcase,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  freelancer: string | null;
  freelancerId: string | null;
  freelancerRating: number | null;
  status: string;
  budget: number | null;
  currency: string;
  deadline: string | null;
  description: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  progress: number;
  milestones: any[];
  messages: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    read: boolean;
    messageType?: string;
  }>;
}

// Milestone definitions from template
const MILESTONE_DEFINITIONS: Record<string, string> = {
  'Discovery & Specification': 'Scope finalization, success metrics, timelines, wireframe/plan, and requirements documentation',
  'Foundations & Architecture': 'Architecture setup, design system, base components, core flows, and initial infrastructure',
  'Feature Pack 1': 'First major feature set with demo, testing, and client acceptance',
  'Feature Pack 2': 'Additional features/modules, integration testing, and refinement',
  'Handover & Launch': 'Final QA, documentation, deployment, knowledge transfer, and 7-14 days warranty support'
};

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalSpent: number;
  pendingProjects: number;
  totalMessages: number;
  unreadMessages: number;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isClient, loading: authLoading, verified: authVerified } = useAuth();
  useRoleGuard(['CLIENT', 'ADMIN', 'TEAM_MEMBER'], { FREELANCER: '/freelancers/dashboard' });
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    pendingProjects: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    budget: '',
    currency: 'AUD',
    deadline: '',
    freelancerId: ''
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [commandProjectFilter, setCommandProjectFilter] = useState('all');
  const [commandVendorFilter, setCommandVendorFilter] = useState('all');
  const [commandTimeFilter, setCommandTimeFilter] = useState('30d');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const milestoneSnapshotRef = useRef<Map<string, string>>(new Map());
  const displayCurrency = 'USD';
  const formatCurrency = (value: number, currency = displayCurrency) =>
    `${currency} ${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const cn = (...classes: Array<string | undefined | null | false>) =>
    classes.filter(Boolean).join(' ');

  type PillTone = 'neutral' | 'ok' | 'warn' | 'danger';

  const Pill = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: PillTone }) => (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 h-6 text-[11px] font-semibold tracking-[0.04em]',
        tone === 'ok' && 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30',
        tone === 'warn' && 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30',
        tone === 'danger' && 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30',
        tone === 'neutral' && 'bg-white/10 text-white/80 ring-1 ring-white/10'
      )}
    >
      {children}
    </span>
  );

  const cardRadius = 'rounded-[28px]';
  const cardShadow = 'shadow-[0_20px_45px_rgba(5,5,15,0.55)]';


  const handleMilestoneNotifications = (projectsData: Project[]) => {
    const nextSnapshot = new Map<string, string>();

    projectsData.forEach((project) => {
      project.milestones.forEach((milestone) => {
        const key = `${project.id}-${milestone.id}`;
        const currentStatus = milestone.status || 'pending';
        nextSnapshot.set(key, currentStatus);

      });
    });

    milestoneSnapshotRef.current = nextSnapshot;
  };

  const heroProject =
    projects.find((p) => p.status === 'in_progress') ||
    projects.find((p) => p.status === 'open') ||
    projects[0] ||
    null;

  const approvalsCount = useMemo(
    () =>
      projects.reduce(
        (count, project) =>
          count + project.milestones.filter((milestone) => ['submitted', 'pending'].includes(milestone.status || 'pending')).length,
        0
      ),
    [projects]
  );

  const budgetStats = useMemo(() => {
    const totals = projects.reduce(
      (acc, project) => {
        const projectBudget = project.budget ?? 0;
        const spentEstimate = projectBudget * (project.progress / 100);
        return {
          budget: acc.budget + projectBudget,
          spent: acc.spent + spentEstimate
        };
      },
      { budget: 0, spent: 0 }
    );
    const remaining = Math.max(totals.budget - totals.spent, 0);
    const ratio = totals.budget > 0 ? remaining / totals.budget : 1;
    return {
      remaining,
      ratio,
      warning: ratio < 0.2 && totals.budget > 0
    };
  }, [projects]);

  const upcomingDeadlinesCount = useMemo(() => {
    const now = Date.now();
    const inSevenDays = now + 7 * 24 * 60 * 60 * 1000;
    return projects.filter((project) => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline).getTime();
      return deadline >= now && deadline <= inSevenDays;
    }).length;
  }, [projects]);

  const focusToolbarOptions = ['Milestones', 'Files', 'Invoices', 'Team', 'Scope'];
  const heroBurn = heroProject ? Math.min((heroProject.budget ?? 0) * (heroProject.progress / 100), heroProject.budget ?? 0) : 0;
  const heroPlan = heroProject?.budget ?? 0;
  const heroDaysLeft = heroProject?.deadline
    ? Math.max(
        0,
        Math.ceil((new Date(heroProject.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : null;
  const heroScopeChange = heroProject ? Math.max(heroProject.milestones.length - 4, 0) : 0;
  const heroAcceptedMilestones = heroProject
    ? heroProject.milestones.filter((m) =>
        ['approved', 'completed', 'released'].includes(m.status || '')
      ).length
    : 0;
  const heroTotalMilestones = Math.max(heroProject?.milestones.length ?? 1, 1);
  const heroProgressFraction = heroProject
    ? Math.min(100, Math.round((heroAcceptedMilestones / heroTotalMilestones) * 100))
    : 0;
  const heroHealth = heroProject
    ? heroProject.progress >= 70
      ? 'On track'
      : 'At risk'
    : 'Awaiting kickoff';
  const heroRemainingBudget = Math.max(heroPlan - heroBurn, 0);
  const heroLastUpdatedLabel = lastUpdated ? `Updated ${getRelativeTime(lastUpdated)} ago` : null;
  const heroSubmittedMilestone = heroProject?.milestones.find((milestone) => milestone.status === 'submitted');
  const heroPendingMilestone = heroProject?.milestones.find((milestone) => milestone.status === 'pending');
  const heroHealthTone: PillTone =
    heroHealth === 'On track' ? 'ok' : heroHealth === 'At risk' ? 'warn' : 'neutral';
  const focusPrimaryAction = heroProject
    ? heroSubmittedMilestone
      ? {
          label: `Approve ${heroSubmittedMilestone.title}`,
          onClick: () =>
            updateMilestoneStatus(heroSubmittedMilestone.id, 'approved', heroProject.id)
        }
      : heroPendingMilestone
        ? {
            label: 'Fund next milestone',
            onClick: () =>
              updateMilestoneStatus(heroPendingMilestone.id, 'funded', heroProject.id)
          }
      : {
          label: 'Open project workspace',
          onClick: () => setActiveTab('projects')
        }
    : null;
  const focusSecondaryActions = heroProject
    ? heroSubmittedMilestone
      ? [
          {
            label: 'Request changes',
            onClick: () =>
              updateMilestoneStatus(heroSubmittedMilestone.id, 'rejected', heroProject.id)
          },
          { label: 'More ▾', onClick: () => setActiveTab('projects') }
        ]
      : [{ label: 'More ▾', onClick: () => setActiveTab('projects') }]
    : [];

  const fundedAmount = Math.min(heroBurn, heroPlan);
  const committedAmount = Math.max(heroPlan - heroBurn - heroRemainingBudget, 0);
  const stackedTotal = heroPlan > 0 ? heroPlan : 1;
  const stackedSegments = [
    { label: 'Funded', value: fundedAmount, color: 'from-cyan-400 to-blue-500' },
    { label: 'Committed', value: committedAmount, color: 'from-purple-500 to-pink-500' },
    { label: 'Remaining', value: heroRemainingBudget, color: 'from-emerald-500 to-cyan-400' }
  ];

  const stackTooltip = stackedSegments
    .map((segment) => `${segment.label}: ${formatCurrency(segment.value)}`)
    .join(' · ');

  const stackedSegmentData = stackedSegments.map((segment, index) => {
    const prevValue = stackedSegments.slice(0, index).reduce((sum, seg) => sum + seg.value, 0);
    const widthPct = (segment.value / stackedTotal) * 100;
    return {
      ...segment,
      widthPct,
      offsetPct: (prevValue / stackedTotal) * 100
    };
  });

  type FooterAction = {
    label: string;
    onClick: () => void;
    tone?: 'primary' | 'secondary';
  };

  type KpiTile = {
    id: string;
    title: string;
    value: string | number;
    caption: string;
    hint: string;
    Icon?: React.ComponentType<{ className?: string }>;
    iconColor?: string;
    accent: string;
    badgeLabel?: string;
    badgeTone?: PillTone;
    tooltip?: string;
    delta?: string;
    secondaryValue?: string;
    iconAction?: () => void;
    footerAction?: FooterAction;
    onClick?: () => void;
  };

  const budgetPct = budgetStats.ratio;
  const budgetTone: PillTone =
    budgetPct <= 0.1 ? 'danger' : budgetPct <= 0.25 ? 'warn' : 'neutral';

  const budgetAccentMap: Record<PillTone, string> = {
    neutral: 'from-cyan-500/70 to-blue-500/70',
    ok: 'from-emerald-500/70 to-cyan-500/70',
    warn: 'from-amber-500/80 to-orange-500/80',
    danger: 'from-rose-500/80 to-pink-600/80'
  };

  const calculateUnread = (list: Project[]) =>
    list.reduce(
      (sum, project) =>
        sum +
        project.messages.filter((message) => message.sender !== 'client' && !message.read).length,
      0
    );

  const hasUrgentDeadline = useMemo(() => {
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return projects.some((project) => {
      if (!project.deadline) return false;
      const due = new Date(project.deadline).getTime();
      return due >= now && due <= now + threeDaysMs;
    });
  }, [projects]);

  const approvalsBadgeTone: PillTone = approvalsCount > 0 ? 'warn' : 'neutral';
  const deadlinesBadgeTone: PillTone = hasUrgentDeadline ? 'warn' : 'neutral';

  const budgetBadgeTone: PillTone | undefined =
    budgetTone === 'warn' ? 'warn' : budgetTone === 'danger' ? 'danger' : undefined;

  const confidenceIndicators = [
    {
      label: 'Schedule',
      reason: heroDaysLeft !== null ? `${heroDaysLeft} days remaining` : 'Date TBD',
      strength: heroDaysLeft !== null && heroDaysLeft >= 5 ? 'strong' : 'caution'
    },
    {
      label: 'Scope',
      reason: heroScopeChange > 0 ? `+${heroScopeChange} scope items` : 'Stable',
      strength: heroScopeChange <= 0 ? 'strong' : 'caution'
    },
    {
      label: 'Budget',
      reason: budgetTone === 'danger' ? 'Urgent' : budgetTone === 'warn' ? 'Monitor' : 'Healthy',
      strength: budgetTone === 'danger' ? 'weak' : 'strong'
    }
  ];

  const milestoneChecklist = heroProject?.milestones ?? [];

  const pendingMilestones = useMemo(() => {
    return projects
      .flatMap((project) =>
        project.milestones.map((milestone) => ({
          ...milestone,
          projectTitle: project.title,
          projectId: project.id
        }))
      )
      .filter((milestone) => ['submitted', 'pending'].includes(milestone.status || 'pending'))
      .slice(0, 3);
  }, [projects]);

  const kpiTiles = useMemo<KpiTile[]>(
    () => {
      const deltas = [
        approvalsCount > 0 ? '+2 since yesterday' : 'What happens here?',
        `${metrics.unreadMessages} replies waiting`,
        hasUrgentDeadline ? '+1 due soon' : 'On track'
      ];

      const goToSection = (section: 'projects' | 'messages' | 'overview') => {
        setActiveTab(section);
        if (section === 'messages' && !selectedProject && projects.length > 0) {
          setSelectedProject(projects[0]);
        }
      };

      return [
      {
        id: 'approvals',
          title: 'Approvals waiting for you',
        value: approvalsCount,
        caption: 'Milestones & invoices awaiting your sign-off',
        hint: 'Pending milestone approvals, invoices, and briefs that need your OK',
        Icon: ShieldCheck,
        iconColor: 'text-purple-300',
          onClick: () => goToSection('projects'),
          iconAction: () => goToSection('projects'),
          accent: 'from-slate-800/70 to-slate-700/70',
          badgeLabel: approvalsCount > 0 ? 'ACTION REQUIRED' : undefined,
          badgeTone: approvalsBadgeTone,
          delta: deltas[0],
          secondaryValue: approvalsCount ? 'SLA 24h' : 'Need approvals?'
      },
        {
        id: 'milestones',
        title: 'Milestones awaiting action',
        value: `${pendingMilestones.length}`,
        caption: 'Check & close approvals',
        hint: 'Submitted/pending milestones waiting on your sign-off',
        Icon: CheckCircle,
        iconColor: 'text-emerald-300',
        onClick: () => goToSection('projects'),
        iconAction: () => goToSection('projects'),
        accent: pendingMilestones.length > 0
          ? 'from-emerald-500/80 to-cyan-400/80'
          : 'from-slate-500/60 to-slate-400/60',
        badgeLabel: pendingMilestones.length > 0 ? `${pendingMilestones.length} need review` : 'All clear',
        badgeTone: pendingMilestones.length > 0 ? 'warn' : 'ok',
        delta: pendingMilestones.length > 0 ? '+1 submitted' : 'All caught up',
        secondaryValue: 'Milestone check'
      },
      {
        id: 'deadlines',
        title: 'Upcoming deadlines',
        value: `${upcomingDeadlinesCount}`,
        caption: 'Due in the next 7 days',
          hint: 'Projects or milestones closing within a week',
        Icon: Calendar,
          iconColor: 'text-amber-200',
          onClick: () => goToSection('projects'),
          iconAction: () => goToSection('projects'),
          accent: hasUrgentDeadline
            ? 'from-amber-500/80 to-orange-500/80'
            : 'from-emerald-500/70 to-teal-500/70',
          badgeLabel: hasUrgentDeadline ? '3 DAYS' : undefined,
          badgeTone: deadlinesBadgeTone,
          delta: deltas[2],
          secondaryValue: hasUrgentDeadline ? 'SLA 48h' : 'No alerts'
        },
        {
          id: 'budget',
          title: 'Budget remaining',
          value: formatCurrency(budgetStats.remaining),
          caption: 'Total budget left across active projects',
          hint: 'Calculated from budgets minus estimated burn across open work',
          Icon: DollarSign,
          iconColor: 'text-amber-300',
          onClick: () => goToSection('overview'),
          iconAction: () => goToSection('overview'),
          accent: budgetAccentMap[budgetTone],
          badgeLabel: budgetTone === 'warn' ? 'LOW' : budgetTone === 'danger' ? 'CRITICAL' : undefined,
          badgeTone: budgetBadgeTone,
          tooltip:
            'Sum of remaining budget across active projects. Alerts at 25% and 10% to give you a head start.',
          delta: 'SLA 24h',
          secondaryValue: `${formatCurrency(budgetStats.remaining)} • ${budgetTone === 'danger' ? 'Critical' : 'Watchful'}`,
          footerAction: {
            label: 'Add funds',
            onClick: () => router.push('/billing'),
            tone: 'primary'
          }
        }
      ];
    },
    [
      approvalsCount,
      metrics.unreadMessages,
      projects,
      upcomingDeadlinesCount,
      budgetStats.remaining,
      budgetTone,
      hasUrgentDeadline,
      selectedProject,
      router
    ]
  );

  const renderKpiTile = (tile: KpiTile, extraClass = '') => (
    <button
      type="button"
      key={tile.id}
      title={tile.hint}
      onClick={tile.onClick}
      className={cn(
        'premium-card group flex flex-col gap-3 min-h-[140px] p-4 text-left border border-white/10 bg-gradient-to-br transition hover:shadow-[0_20px_45px_rgba(5,5,15,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 relative overflow-hidden',
        cardRadius,
        cardShadow,
        tile.accent,
        extraClass
      )}
    >
      <div className="metric-bar" />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.35em] text-white/60">{tile.title}</span>
        <div className="flex items-center gap-2">
          {tile.tooltip && (
            <span title={tile.tooltip} className="text-white/60">
              <Info className="w-4 h-4" aria-hidden />
            </span>
          )}
          {tile.Icon && (tile.iconAction ? (
            <button
              type="button"
              onClick={tile.iconAction}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              aria-label={`${tile.title} shortcut`}
            >
              <tile.Icon className={cn('w-5 h-5', tile.iconColor)} aria-hidden />
            </button>
          ) : (
            <tile.Icon className={cn('w-5 h-5', tile.iconColor)} aria-hidden />
          ))}
        </div>
      </div>
      <span className="text-4xl font-semibold text-white">{tile.value}</span>
      {tile.secondaryValue && (
        <span className="text-sm uppercase tracking-[0.4em] text-white/60">{tile.secondaryValue}</span>
      )}
      {tile.delta && (
        <span className="text-[10px] text-cyan-300">{tile.delta}</span>
      )}
      <span className="text-xs text-white/70">{tile.caption}</span>
      <p className="text-[10px] text-white/40">{tile.hint}</p>
      {tile.badgeLabel && <Pill tone={tile.badgeTone}>{tile.badgeLabel}</Pill>}
      {tile.footerAction && (
        <button
          type="button"
          onClick={tile.footerAction.onClick}
          className={cn(
            'mt-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
            tile.footerAction.tone === 'primary'
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/50'
              : 'border border-white/20 text-white/70 hover:border-white/40'
          )}
        >
          {tile.footerAction.label}
        </button>
      )}
    </button>
  );

  function getRelativeTime(value: Date | null) {
    if (!value) return null;
    const diffMinutes = Math.round((Date.now() - value.getTime()) / 1000 / 60);
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    }
    if (diffMinutes < 60 * 24) {
      return `${Math.round(diffMinutes / 60)}h`;
    }
    return `${Math.round(diffMinutes / 60 / 24)}d`;
  }

  useEffect(() => {
    // Wait for auth to finish loading and verifying before checking user
    if (authLoading || !authVerified) {
      return;
    }

    // Only redirect if auth is verified and user is not a client
    if (!user || !isClient()) {
      router.push('/login');
      return;
    }
    
    let active = true;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        await fetchClientData(controller.signal);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [user, router, isClient, authLoading, authVerified]);

  const currentProjectIdRef = useRef<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Auto-scroll messages to bottom when a new thread or new message appears
  useEffect(() => {
    if (!selectedProject || !messagesEndRef.current) {
      return;
    }

    if (currentProjectIdRef.current !== selectedProject.id) {
      currentProjectIdRef.current = selectedProject.id;
      lastMessageIdRef.current = null;
    }

    const latestMessageId = selectedProject.messages?.[selectedProject.messages.length - 1]?.id ?? null;
    const shouldScroll = latestMessageId && latestMessageId !== lastMessageIdRef.current;
    if (!shouldScroll) return;

    lastMessageIdRef.current = latestMessageId;
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [selectedProject?.id, selectedProject?.messages.length]);

  // Refresh data when switching to messages tab if no project is selected
  useEffect(() => {
    if (activeTab === 'messages' && !selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [activeTab, projects, selectedProject]);

  // Auto-refresh all dashboard data every 30 seconds
  useEffect(() => {
    if (!user?.id || authLoading || !authVerified) return;

    const refreshAllData = async () => {
      try {
        await fetchClientData();
        // Update selected project if it exists
        if (selectedProject) {
          const freshProjects = await fetch(`/api/clients/projects?userId=${user.id}`).then(r => r.json()).catch(() => ({ projects: [] }));
          if (freshProjects?.projects) {
            const updated = freshProjects.projects.find((p: Project) => p.id === selectedProject.id);
            if (updated) {
              setSelectedProject(updated);
            }
          }
        }
      } catch (error) {
        // Silently fail on auto-refresh to avoid spamming errors
        console.debug('Auto-refresh error (non-critical):', error);
      }
    };

    // Refresh every 30 seconds
    const interval = setInterval(refreshAllData, 30000);

    return () => clearInterval(interval);
  }, [user?.id, authLoading, authVerified, selectedProject?.id]);

  useEffect(() => {
    const selectedProjectId = selectedProject?.id;
    if (activeTab !== 'messages' || !selectedProjectId || !user?.id) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const refreshThread = async () => {
      try {
        const response = await fetch(
          `/api/clients/messages?projectId=${selectedProjectId}&userId=${user.id}`,
          { signal: controller.signal }
        );
        if (!isActive || !response.ok) return;
        const payload = await response.json();
        if (!Array.isArray(payload.messages)) return;

        if (!isActive) return;

        setSelectedProject((prev) =>
          prev && prev.id === selectedProjectId ? { ...prev, messages: payload.messages } : prev
        );
        setProjects((prev) => {
          const next = prev.map((project) =>
            project.id === selectedProjectId ? { ...project, messages: payload.messages } : project
          );
          const unread = calculateUnread(next);
          setMetrics((prevMetrics) =>
            prevMetrics.unreadMessages === unread
              ? prevMetrics
              : { ...prevMetrics, unreadMessages: unread }
          );
          return next;
        });
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('Error refreshing message thread:', err);
      }
    };

    refreshThread();
    const threadInterval = setInterval(refreshThread, 5000);

    return () => {
      isActive = false;
      controller.abort();
      clearInterval(threadInterval);
    };
  }, [activeTab, selectedProject?.id, user?.id]);

  const fetchClientData = async (signal?: AbortSignal) => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetch(`/api/clients/projects?userId=${user?.id}`, { signal }),
        fetch(`/api/clients/dashboard-metrics?userId=${user?.id}`, { signal })
      ]);

      const projectsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const metricsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      let unreadFromProjects: number | undefined;

      if (projectsRes && projectsRes.ok) {
        const data = await projectsRes.json();
        const projectList = Array.isArray(data.projects) ? data.projects : [];
        unreadFromProjects = calculateUnread(projectList);
        setProjects(projectList);
        handleMilestoneNotifications(projectList);
        if (!metricsRes || !metricsRes.ok) {
          setMetrics((prev) =>
            typeof unreadFromProjects === 'number' && prev.unreadMessages !== unreadFromProjects
              ? { ...prev, unreadMessages: unreadFromProjects }
              : prev
          );
        }
      } else if (projectsRes && !projectsRes.ok) {
        setProjects([]);
      }

      if (metricsRes && metricsRes.ok) {
        const data = await metricsRes.json();
        if (data?.metrics) {
          setMetrics({
            ...data.metrics,
            unreadMessages:
              typeof unreadFromProjects === 'number'
                ? unreadFromProjects
                : data.metrics.unreadMessages ?? metrics.unreadMessages
          });
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('Error fetching client data:', e);
      setError('Unable to load your dashboard right now. Please try again shortly.');
    } finally {
      setLastUpdated(new Date());
    }
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects || [];
    
    if (projectFilter !== 'all') {
      filtered = filtered.filter((p: Project) => p.status === projectFilter);
    }
    
    if (projectSearch) {
      const query = projectSearch.toLowerCase();
      filtered = filtered.filter((p: Project) =>
        p.title.toLowerCase().includes(query) ||
        (p.freelancer && p.freelancer.toLowerCase().includes(query)) ||
        p.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [projects, projectFilter, projectSearch]);

  const validateMessageContent = (message: string): { valid: boolean; error?: string } => {
    const content = message.toLowerCase().trim();
    const originalContent = message.trim();
    
    // Phone number patterns (various formats)
    const phonePatterns = [
      /\b\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, // International: +91 83188 11781, +1-234-567-8900
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US format: 123-456-7890
      /\b\d{10,15}\b/g, // Long numbers: 8318811781
      /\b\+?\d{10,15}\b/g, // With country code: +918318811781
    ];

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

    // URL pattern
    const urlPattern = /(https?:\/\/|www\.)\S+/gi;

    // Social media patterns
    const socialPatterns = [
      /\b(whats?app|telegram|discord|signal|wechat|instagram|facebook|snapchat|skype)\b/gi,
      /@[a-z0-9_.]{3,}/gi, // Handles like @username
    ];

    // Payment/banking patterns
    const paymentPatterns = [
      /\b(upi|gpay|googlepay|phonepe|paytm|iban|swift|ifsc|routing|account\s?no|bank\s?account|venmo|cashapp|paypal)\b/gi,
    ];

    // Price/cost patterns
    const pricePatterns = [
      /\$\d+|\d+\s*(dollars?|usd|eur|gbp|inr|rupees?)/gi,
      /\b(price|cost|fee|charge|payment|invoice|budget|rate|hourly|per hour)\s*:?\s*\$?\d+/gi,
      /\b\d+\s*(per|\/)\s*(hour|hr|day|week|month)/gi,
    ];

    // Personal contact patterns
    const contactPatterns = [
      /\b(contact|reach|call|text|whatsapp|telegram|skype|discord)\s*(me|at|on|via)?\s*:?\s*[+\d@]/gi,
      /\b(my|personal|direct)\s+(number|phone|email|contact|whatsapp)/gi,
    ];

    // Block suspicious patterns that could be used to bypass restrictions
    // Standalone currency words
    const currencyWords = /\b(dollar|dollars|usd|eur|gbp|inr|rupee|rupees|price|cost|fee|charge|payment|invoice|budget|rate)\b/gi;
    
    // Spelled-out numbers (common phone number digits)
    const spelledNumbers = /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi;
    
    // Suspicious number sequences (3-4 digit numbers that could be phone number parts)
    const suspiciousNumbers = /\b\d{3,4}\b/g;

    // Helper function to extract detected content
    const extractMatch = (pattern: RegExp, text: string): string | null => {
      const match = text.match(pattern);
      return match ? match[0] : null;
    };

    // Check for prices/costs FIRST (before phone numbers to avoid false positives)
    for (const pattern of pricePatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Payment information cannot be shared. Use Unitiv's payment system instead.` 
        };
      }
    }

    // Block standalone currency words (also check before phone numbers)
    const currencyMatch = extractMatch(currencyWords, originalContent);
    if (currencyMatch && content.split(/\s+/).length <= 3) {
      return { 
        valid: false, 
        error: `Payment information cannot be shared. Use Unitiv's payment system instead.` 
      };
    }

    // Check for payment/banking info
    for (const pattern of paymentPatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Payment methods cannot be shared. Use Unitiv's payment system instead.` 
        };
      }
    }

    // Check for phone numbers
    for (const pattern of phonePatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Phone numbers cannot be shared. Keep communication within Unitiv.` 
        };
      }
    }

    // Check for email addresses
    const emailMatch = extractMatch(emailPattern, originalContent);
    if (emailMatch) {
      return { 
        valid: false, 
        error: `Email addresses cannot be shared. Keep communication within Unitiv.` 
      };
    }

    // Check for URLs
    const urlMatch = extractMatch(urlPattern, originalContent);
    if (urlMatch) {
      return { 
        valid: false, 
        error: `External links cannot be shared. Keep communication within Unitiv.` 
      };
    }

    // Check for social media
    for (const pattern of socialPatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Social media handles cannot be shared. Keep communication within Unitiv.` 
        };
      }
    }

    // Check for contact sharing attempts
    for (const pattern of contactPatterns) {
      if (pattern.test(content)) {
        return { 
          valid: false, 
          error: 'Contact information cannot be shared. Keep communication within Unitiv.' 
        };
      }
    }

    // Block messages that are primarily spelled-out numbers (likely phone number bypass attempt)
    const words = content.split(/\s+/);
    const spelledNumberMatches = words.filter(w => spelledNumbers.test(w));
    if (spelledNumberMatches.length >= 2 && words.length <= 5) {
      return { 
        valid: false, 
        error: 'Contact information cannot be shared. Keep communication within Unitiv.' 
      };
    }

    // Check for split number patterns (e.g., "2 2" or "1 2 3" that could be phone number parts)
    // Count all digits in the message
    const allDigits = originalContent.replace(/\D/g, '');
    const digitCount = allDigits.length;
    
    // Check for multiple small numbers separated by spaces (potential phone number bypass)
    const smallNumberPattern = /\b\d{1,2}\b/g;
    const smallNumbers = originalContent.match(smallNumberPattern);
    
    if (smallNumbers && smallNumbers.length >= 2) {
      const totalDigitsFromSmallNumbers = smallNumbers.join('').replace(/\D/g, '').length;
      // If we have 2+ small numbers that together form 8-15 digits (phone number range)
      if (totalDigitsFromSmallNumbers >= 8 && totalDigitsFromSmallNumbers <= 15) {
        // Skip if message contains payment-related words (already checked above)
        const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(content);
        if (!hasPaymentContext) {
          return { 
            valid: false, 
            error: 'Phone numbers cannot be shared. Keep communication within Unitiv.' 
          };
        }
      }
    }

    // Block suspicious number sequences in short messages (likely phone number parts)
    // But exclude if it's clearly a payment amount (has currency words nearby)
    const numberMatches = content.match(suspiciousNumbers);
    if (numberMatches && numberMatches.length >= 1 && words.length <= 3) {
      // Skip if message contains payment-related words (already checked above)
      const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(content);
      if (!hasPaymentContext) {
        // Check if message is mostly numbers
        const numberChars = content.replace(/\D/g, '').length;
        const totalChars = content.replace(/\s/g, '').length;
        if (totalChars > 0 && numberChars / totalChars > 0.5) {
          return { 
            valid: false, 
            error: 'Phone numbers cannot be shared. Keep communication within Unitiv.' 
          };
        }
      }
    }

    // Final check: if message has 8-15 digits total (phone number range) and no payment context
    if (digitCount >= 8 && digitCount <= 15) {
      const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(content);
      // Also check if it's not a date or time pattern
      const isDateOrTime = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{1,2}:\d{2}\b/gi.test(originalContent);
      if (!hasPaymentContext && !isDateOrTime) {
        // Check if digits are separated (potential bypass attempt)
        const digitGroups = originalContent.match(/\b\d{1,4}\b/g);
        if (digitGroups && digitGroups.length >= 2) {
          return { 
            valid: false, 
            error: 'Phone numbers cannot be shared. Keep communication within Unitiv.' 
          };
        }
      }
    }

    return { valid: true };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedProject || !user?.id) return;

    // Validate message content for restricted information
    const validation = validateMessageContent(newMessage);
    if (!validation.valid) {
      addToast(validation.error || 'Message contains restricted content', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      // Send message using client messages API
      const response = await fetch('/api/clients/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          content: newMessage,
          senderId: user.id
        })
      });

      if (response.ok) {
        const messageData = await response.json();
        setNewMessage('');
        
        // Optimistically update the selected project with the new message
        if (messageData.message) {
          setSelectedProject({
            ...selectedProject,
            messages: [
              ...selectedProject.messages,
              {
                id: messageData.message.id,
                sender: 'client',
                content: messageData.message.content,
                timestamp: messageData.message.timestamp,
                read: false
              }
            ]
          });
        }
        
        // Refresh all data in the background
        await fetchClientData();
        
        // Update selected project with fresh data
        const freshProjects = await fetch(`/api/clients/projects?userId=${user.id}`).then(r => r.json());
        if (freshProjects?.projects) {
          const updatedProject = freshProjects.projects.find((p: Project) => p.id === selectedProject.id);
          if (updatedProject) {
            setSelectedProject(updatedProject);
          }
        }
      } else {
        const error = await response.json();
        // Display server-side validation errors
        if (error?.reasons && Array.isArray(error.reasons)) {
          addToast(error.reasons.join('; ') || error?.error || 'Message contains restricted content', 'error');
        } else {
          addToast(error?.error || 'Failed to send message', 'error');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: string, projectId: string) => {
    if (!user?.id) {
      addToast('You must be logged in to update milestones', 'error');
      return;
    }

    try {
      console.log('Updating milestone:', { milestoneId, status, projectId, userId: user.id });
      
      const response = await fetch(`/api/clients/milestones/${milestoneId}?userId=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log('Milestone updated successfully:', responseData);
        const statusLabel = formatStatusLabel(status);
        addToast(`Milestone status updated to ${statusLabel}`, 'success');
        
        // Refresh projects data
        await fetchClientData();
        
        // Update selected project if it's the one being updated
        if (selectedProject && selectedProject.id === projectId) {
          const freshProjects = await fetch(`/api/clients/projects?userId=${user.id}`).then(r => r.json());
          if (freshProjects?.projects) {
            const updatedProject = freshProjects.projects.find((p: Project) => p.id === projectId);
            if (updatedProject) {
              setSelectedProject(updatedProject);
            }
          }
        }
      } else {
        console.error('Failed to update milestone:', responseData);
        addToast(responseData?.error || `Failed to update milestone status: ${response.status} ${response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('Error updating milestone status:', error);
      addToast(`Failed to update milestone status: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const createProject = async () => {
    if (!projectForm.title.trim() || !user?.id) {
      addToast('Please provide a project title', 'error');
      return;
    }

    setCreatingProject(true);
    try {
      const response = await fetch(`/api/clients/projects?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectForm.title,
          description: projectForm.description || null,
          budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
          currency: projectForm.currency,
          deadline: projectForm.deadline || null,
          freelancerId: projectForm.freelancerId || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        addToast('Project created successfully', 'success');
        setProjectForm({
          title: '',
          description: '',
          budget: '',
          currency: 'AUD',
          deadline: '',
          freelancerId: ''
        });
        setCreatingProject(false);
        
        // Refresh data and switch to projects tab
        await fetchClientData();
        setActiveTab('projects');
        
        // If a project was created, select it
        if (data?.project) {
          const newProject = projects.find(p => p.id === data.project.id) || data.project;
          setSelectedProject(newProject);
        }
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to create project', 'error');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      addToast('Failed to create project', 'error');
    } finally {
      setCreatingProject(false);
    }
  };

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400/30 border-t-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white/70 text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
      case 'open': return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
      case 'in_review': return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
      case 'contracted': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
      case 'in_progress': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20';
      case 'delivered': return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
      case 'completed': return 'bg-blue-500/15 text-blue-300 border-blue-500/20';
      case 'cancelled': return 'bg-rose-500/15 text-rose-300 border-rose-500/20';
      case 'disputed': return 'bg-rose-500/15 text-rose-300 border-rose-500/20';
      case 'on_hold': return 'bg-amber-500/15 text-amber-300 border-amber-500/20';
      case 'pending': return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
      default: return 'bg-slate-500/15 text-slate-300 border-slate-500/20';
    }
  };

  const formatStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'open': 'Open',
      'in_review': 'In Review',
      'contracted': 'Contracted',
      'in_progress': 'In Progress',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed',
      'pending': 'Pending',
      'funded': 'Funded',
      'submitted': 'Submitted',
      'approved': 'Approved',
      'released': 'Released',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  return (
    <>
      <Head>
        <title>Client Dashboard - Unitiv</title>
        <meta name="description" content="Manage your projects and collaborate with freelancers" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10] text-white">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back, {user?.name || 'Client'}!
                </h1>
                <p className="text-white/60">
                  Track budgets, approvals, and milestones across all projects—without switching tools.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setCreatingProject(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/40 transition hover:shadow-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Start a new project
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className="px-4 py-2 rounded-2xl border border-white/20 text-sm font-semibold text-white/80 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 flex items-center gap-2"
                >
                  Review messages
                  {metrics.unreadMessages > 0 && (
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-300">
                      {metrics.unreadMessages}
                    </span>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {kpiTiles.map((tile) => renderKpiTile(tile))}
              </div>
              <div className="md:hidden">
                <div className="flex gap-4 overflow-x-auto pb-2 pr-2">
                  {kpiTiles.map((tile) => renderKpiTile(tile, 'min-w-[220px] flex-shrink-0'))}
                </div>
              </div>
              <div
                role="status"
                aria-live="polite"
                className="flex items-center justify-between text-xs text-white/50"
              >
                <span>{lastUpdated ? `Synced ${lastUpdated.toLocaleTimeString()}` : 'Syncing metrics…'}</span>
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400/40" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                  </span>
                  <RefreshCw className="h-3 w-3 text-white/60 animate-spin" aria-hidden />
                  Auto-refresh every 30s
                </span>
              </div>
            </div>

          {/* Insight Hero */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#141a2a] via-[#0b0d15] to-[#050607] shadow-[0_35px_60px_rgba(0,0,0,0.65)] mb-8">
            <div className="pointer-events-none absolute inset-0 opacity-70">
              <div className="absolute -top-12 right-4 h-48 w-48 rounded-full bg-cyan-400/20 blur-[120px]" />
              <div className="absolute bottom-0 left-12 h-32 w-32 rounded-full bg-purple-500/25 blur-[110px]" />
            </div>
            <div className="relative p-6 md:p-10 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Command Center</p>
                  <h2 className="text-2xl md:text-3xl font-semibold">Elevate your collaborations</h2>
                  <p className="text-sm text-white/70">
                    Track budgets, approvals, and milestones across all projects—without switching tools.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('messages');
                    }}
                    className="px-4 py-2 rounded-2xl border border-white/20 text-sm font-semibold text-white/80 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    Open inbox
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Project
                  <select
                    value={commandProjectFilter}
                    onChange={(e) => setCommandProjectFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 text-sm focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition w-full"
                  >
                    <option value="all" className="bg-[#0B0D10]">All projects</option>
                    <option value="design" className="bg-[#0B0D10]">Website redesign</option>
                    <option value="mobile" className="bg-[#0B0D10]">Mobile app</option>
                    <option value="automation" className="bg-[#0B0D10]">Automation</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Vendor
                  <select
                    value={commandVendorFilter}
                    onChange={(e) => setCommandVendorFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 text-sm focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition w-full"
                  >
                    <option value="all" className="bg-[#0B0D10]">All vendors</option>
                    <option value="studio" className="bg-[#0B0D10]">Studio A</option>
                    <option value="freelancer" className="bg-[#0B0D10]">Freelancer B</option>
                  </select>
                </label>
                <label className="space-y-1 text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Time window
                  <select
                    value={commandTimeFilter}
                    onChange={(e) => setCommandTimeFilter(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 text-sm focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition w-full"
                  >
                    <option value="7d" className="bg-[#0B0D10]">Last 7 days</option>
                    <option value="30d" className="bg-[#0B0D10]">Last 30 days</option>
                    <option value="90d" className="bg-[#0B0D10]">Last 90 days</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-[0_25px_55px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Focus project</p>
                      <p className="text-[10px] text-white/60">
                        {heroLastUpdatedLabel || 'Updated just now'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Pill tone={heroHealthTone}>{heroHealth}</Pill>
                      <div className="flex items-center gap-1 text-white/50 text-[10px]">
                        {confidenceIndicators.map((indicator) => (
                    <span
                            key={indicator.label}
                            title={`${indicator.label}: ${indicator.reason}`}
                            className={cn(
                              'text-lg select-none leading-none',
                              indicator.strength === 'strong'
                                ? 'text-emerald-300'
                                : indicator.strength === 'caution'
                                  ? 'text-amber-300'
                                  : 'text-rose-300'
                            )}
                          >
                            ●
                    </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {heroProject ? (
                    <>
                      <div className="space-y-3 mt-3">
                        <h3 className="text-2xl md:text-3xl font-semibold text-white">{heroProject.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-white/70 flex-wrap">
                          <span className="px-2 py-1 rounded-full border border-white/15 text-white/70 text-xs uppercase tracking-[0.2em]">
                            {formatStatusLabel(heroProject.status)}
                          </span>
                          <span className="text-white/50">
                            {heroProject.freelancer || 'Freelancer pending assignment'}
                          </span>
                        </div>
                        {heroProject.description && (
                          <p className="text-sm text-white/60 leading-relaxed">{heroProject.description}</p>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {focusToolbarOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.5fr]">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Budget stack</p>
                          <div
                            className="mt-2 relative h-3 w-full overflow-hidden rounded-full bg-white/10"
                            title={stackTooltip}
                          >
                            {stackedSegmentData.map((segment) => (
                              <div
                                key={segment.label}
                                className={cn(
                                  'absolute inset-y-0 rounded-full transition-all duration-500',
                                  `bg-gradient-to-r ${segment.color}`
                                )}
                                style={{
                                  width: `${Math.max(segment.widthPct, 0)}%`,
                                  left: `${segment.offsetPct}%`
                                }}
                              />
                            ))}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-white/60">
                            <span>Funded {formatCurrency(fundedAmount)}</span>
                            <span>Committed {formatCurrency(committedAmount)}</span>
                            <span>Remaining {formatCurrency(heroRemainingBudget)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">Days left</p>
                          <p className="text-base font-semibold text-white">
                            {heroDaysLeft !== null ? `${heroDaysLeft} days` : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/60">
                        <span className="rounded-full border border-white/15 px-3 py-1">
                          Scope change {heroScopeChange > 0 ? `+${heroScopeChange}` : 'stable'}
                        </span>
                        <span className="text-[10px] flex items-center gap-1">
                          Auto-approves in 3d 4h
                          <Link
                            href="/docs/MILESTONE_WORKFLOW"
                            className="inline-flex items-center justify-center rounded-full p-1 text-cyan-300 hover:text-cyan-200"
                          >
                            <Info className="w-3.5 h-3.5" aria-hidden />
                            <span className="sr-only">View auto-approval policy</span>
                          </Link>
                        </span>
                      </div>
                      <div
                        className="mt-4"
                        title={`${heroAcceptedMilestones} of ${heroTotalMilestones} milestones approved`}
                      >
                        <div className="relative h-3 w-full rounded-full bg-white/10">
                          <div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                            style={{ width: `${heroProgressFraction}%` }}
                          />
                          {Array.from({ length: heroTotalMilestones }).map((_, index) => (
                              <span
                                key={`tick-${index}`}
                              className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-white/20"
                              style={{ left: `${((index + 1) / heroTotalMilestones) * 100}%` }}
                              />
                            ))}
                          </div>
                        <p className="mt-2 text-xs text-white/60">
                          {heroAcceptedMilestones}/{heroTotalMilestones} milestones approved ({heroProgressFraction}
                          %)
                        </p>
                      </div>
                      {milestoneChecklist.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {milestoneChecklist.map((milestone) => {
                            const isApproved = ['approved', 'released'].includes(milestone.status || '');
                            const iconColor = isApproved ? 'text-emerald-400' : 'text-white/50';
                            const dueDate = milestone.due_at
                              ? new Date(milestone.due_at).toLocaleDateString()
                              : 'TBD';
                            const amount =
                              milestone.amount_cents && Number(milestone.amount_cents) > 0
                                ? formatCurrency(Number(milestone.amount_cents) / 100)
                                : null;
                            return (
                              <div
                                key={milestone.id}
                                className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-sm"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate">{milestone.title}</p>
                                  <p className="text-[11px] text-white/60">
                                    {dueDate} {amount ? `· ${amount}` : ''}
                                  </p>
                                </div>
                                <span
                                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full ${
                                    isApproved
                                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-white/5 text-white/70 border border-white/10'
                                  }`}
                                >
                                  {isApproved ? (
                                    <CheckCircle className={`w-3 h-3 ${iconColor}`} />
                                  ) : (
                                    <Clock className={`w-3 h-3 ${iconColor}`} />
                                  )}
                                  {formatStatusLabel(milestone.status || 'pending')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-5 flex flex-wrap gap-3">
                        {focusPrimaryAction && (
                          <button
                            type="button"
                            onClick={focusPrimaryAction.onClick}
                            className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:shadow-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          >
                            {focusPrimaryAction.label}
                          </button>
                        )}
                        {focusSecondaryActions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className="rounded-full border border-white/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="mt-3 text-sm text-white/60">
                      Launch your first project to unlock a live pulse on delivery and milestones.
                    </p>
                  )}
                </div>
                <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[#05060a] via-[#151827] to-[#05060a] p-6 shadow-[0_25px_55px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/50">Milestone Pulse</p>
                      <p className="text-[10px] text-white/50">Pending approvals & funding</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {pendingMilestones.length === 0 ? (
                      <p className="text-sm text-white/60">
                        No pending milestones—everything is funded or approved.
                      </p>
                    ) : (
                      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                          Milestones needing action
                        </p>
                        {pendingMilestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between gap-3 text-sm text-white/80"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{milestone.title}</p>
                              <p className="text-[10px] text-white/60">
                                {milestone.projectTitle} ·{' '}
                                {milestone.due_at
                                  ? new Date(milestone.due_at).toLocaleDateString()
                                  : 'TBD'}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                milestone.status === 'submitted'
                                  ? updateMilestoneStatus(milestone.id, 'approved', milestone.projectId)
                                  : updateMilestoneStatus(milestone.id, 'funded', milestone.projectId)
                              }
                              className="text-[10px] font-semibold uppercase tracking-[0.3em] rounded-full border border-white/20 px-3 py-1 transition hover:border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                            >
                              {milestone.status === 'submitted' ? 'Approve' : 'Fund'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 border-b border-white/10 pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'projects', label: 'Projects', icon: Briefcase },
              { id: 'messages', label: 'Messages', icon: MessageSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all border ${
                    activeTab === tab.id
                      ? 'border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-blue-500/15 text-cyan-300'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => {
                    setError(null);
                    fetchClientData();
                  }}
                  className="text-red-300 hover:text-red-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-card relative overflow-hidden bg-white/[0.04] rounded-2xl border border-white/10 p-6">
                  <div className="metric-bar" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Total Projects</span>
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{metrics.totalProjects}</p>
                </div>
                <div className="premium-card relative overflow-hidden bg-white/[0.04] rounded-2xl border border-white/10 p-6">
                  <div className="metric-bar" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Active Projects</span>
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{metrics.activeProjects}</p>
                </div>
                <div className="premium-card relative overflow-hidden bg-white/[0.04] rounded-2xl border border-white/10 p-6">
                  <div className="metric-bar" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Completed</span>
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">{metrics.completedProjects}</p>
                </div>
                <div className="premium-card relative overflow-hidden bg-white/[0.04] rounded-2xl border border-white/10 p-6">
                  <div className="metric-bar" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-widest text-white/40">Total Spent</span>
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">${metrics.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-transparent p-6 shadow-xl backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                href="/freelancers"
                    className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition"
                  >
                    <Users className="w-6 h-6 text-cyan-400 mb-2" />
                    <h3 className="font-semibold mb-1">Browse Freelancers</h3>
                    <p className="text-sm text-white/60">Find talented professionals</p>
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab('projects');
                      setCreatingProject(true);
                    }}
                    className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-lg hover:from-emerald-500/30 hover:to-green-500/30 transition text-left"
                  >
                    <Plus className="w-6 h-6 text-emerald-400 mb-2" />
                    <h3 className="font-semibold mb-1">Create Project</h3>
                    <p className="text-sm text-white/60">Start a new project</p>
                  </button>
                  <Link
                    href="/request-quote"
                    className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition"
                  >
                    <FileText className="w-6 h-6 text-purple-400 mb-2" />
                    <h3 className="font-semibold mb-1">Request Quote</h3>
                    <p className="text-sm text-white/60">Get custom quotes</p>
              </Link>
                  <button
                    onClick={() => {
                      setActiveTab('projects');
                      setProjectFilter('in_review');
                    }}
                    className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition text-left"
                  >
                    <Target className="w-6 h-6 text-blue-400 mb-2" />
                    <h3 className="font-semibold mb-1">Approve invoices & milestones</h3>
                    <p className="text-sm text-white/60">Keep approvals moving</p>
                  </button>
                </div>
            </div>

              {/* Recent Projects */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Recent Projects</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 group"
                  >
                    View All
                    <ChevronDown className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform rotate-[-90deg]" />
                  </button>
                </div>
                {projects.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {projects.slice(0, 5).map((project) => (
                      <div
                        key={project.id}
                        className="group p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg border border-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setActiveTab('messages');
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                                {project.title}
                              </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                              {project.freelancer && (
                                <span className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[120px]">{project.freelancer}</span>
                                  {project.freelancerRating && (
                                    <span className="flex items-center gap-0.5 text-amber-400">
                                      <Star className="w-3 h-3 fill-amber-400" />
                                      <span className="text-xs">{Number(project.freelancerRating).toFixed(1)}</span>
                                    </span>
                                  )}
                                </span>
                              )}
                              {project.budget && (
                                <span className="flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>{project.currency} {project.budget.toLocaleString()}</span>
                                </span>
                              )}
                              {project.deadline && (
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(project.deadline).toLocaleDateString()}</span>
                                </span>
                              )}
                              {project.messages.length > 0 && (
                                <span className="flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>{project.messages.length} messages</span>
                                </span>
                              )}
                            </div>
                            {project.progress > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-white/50">Progress</span>
                                  <span className="text-white/70 font-medium">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {(() => {
                            const daysLeft =
                              project.deadline !== null && project.deadline !== undefined
                                ? Math.max(
                                    0,
                                    Math.ceil(
                                      (new Date(project.deadline).getTime() - Date.now()) /
                                        (1000 * 60 * 60 * 24)
                                    )
                                  )
                                : null;
                            const etaLabel = daysLeft !== null ? `${daysLeft}d left` : 'TBD';
                            return (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border shrink-0 ${getStatusColor(project.status)}`}
                              >
                                {`${formatStatusLabel(project.status)} • ${project.progress}% • ${etaLabel}`}
                          </span>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                      <Briefcase className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-base font-medium mb-1 text-white/60">No projects yet</p>
                    <p className="mb-6">Get started by creating your first project</p>
                    <button
                      onClick={() => {
                        setActiveTab('projects');
                        setCreatingProject(true);
                      }}
                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 pl-10 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                  />
                </div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="all" className="bg-[#0B0D10]">All Status</option>
                  <option value="open" className="bg-[#0B0D10]">Open</option>
                  <option value="in_review" className="bg-[#0B0D10]">In Review</option>
                  <option value="contracted" className="bg-[#0B0D10]">Contracted</option>
                  <option value="in_progress" className="bg-[#0B0D10]">In Progress</option>
                  <option value="delivered" className="bg-[#0B0D10]">Delivered</option>
                  <option value="completed" className="bg-[#0B0D10]">Completed</option>
                </select>
                <button
                  onClick={() => setCreatingProject(true)}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              {/* Projects List */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-32 rounded-xl" />
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-white/20 transition-all cursor-pointer border-l-2 ${
                        project.status === 'in_progress' || project.status === 'contracted'
                          ? 'border-l-cyan-400'
                          : project.status === 'completed' || project.status === 'delivered'
                          ? 'border-l-emerald-400'
                          : project.status === 'on_hold' || project.status === 'in_review'
                          ? 'border-l-amber-400'
                          : project.status === 'cancelled' || project.status === 'disputed'
                          ? 'border-l-rose-400'
                          : 'border-l-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap ${getStatusColor(project.status)}`}>
                              {formatStatusLabel(project.status)}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-sm text-white/60 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {project.freelancer && (
                              <div className="flex items-center gap-1.5 text-white/70">
                                <div className="w-5 h-5 rounded bg-cyan-500/10 flex items-center justify-center">
                                  <User className="w-3 h-3 text-cyan-400" />
                                </div>
                                <span className="font-medium">{project.freelancer}</span>
                                {project.freelancerRating && (
                                  <span className="flex items-center gap-1 text-amber-400">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {Number(project.freelancerRating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                            )}
                            {project.budget && (
                              <div className="flex items-center gap-1.5 text-white/70">
                                <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center">
                                  <DollarSign className="w-3 h-3 text-emerald-400" />
                                </div>
                                <span className="font-medium">{project.currency} {project.budget.toLocaleString()}</span>
                              </div>
                            )}
                            {project.deadline && (
                              <div className="flex items-center gap-1.5 text-white/70">
                                <div className="w-5 h-5 rounded bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="w-3 h-3 text-blue-400" />
                                </div>
                                <span>{new Date(project.deadline).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {project.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white/60">Progress</span>
                            <span className="text-white">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-cyan-400 h-2 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setActiveTab('messages');
                          }}
                          className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 text-sm hover:bg-white/10 transition flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Messages ({project.messages.length})
                        </button>
                        {project.milestones.length > 0 && (
                          <button
                            onClick={() => toggleProjectExpanded(project.id)}
                            className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 text-sm hover:bg-white/10 transition flex items-center gap-1.5"
                          >
                            {expandedProjects.has(project.id) ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                Hide Milestones
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                View Milestones ({project.milestones.length})
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {expandedProjects.has(project.id) && project.milestones.length > 0 && (
                        <div className="mt-5 pt-5 border-t border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Target className="w-4 h-4 text-cyan-400" />
                              Milestones ({project.milestones.length})
                            </h4>
                          </div>
                          <div className="relative pl-6 space-y-3">
                            <div className="timeline-connector" />
                            {project.milestones.map((milestone, index) => {
                              const milestoneNumber = index + 1;
                              const isExpanded = expandedMilestones.has(milestone.id);
                              const dotColor =
                                milestone.status === 'approved' || milestone.status === 'released' ? 'bg-emerald-400 border-emerald-400' :
                                milestone.status === 'submitted' ? 'bg-cyan-400 border-cyan-400' :
                                milestone.status === 'in_progress' ? 'bg-blue-400 border-blue-400' :
                                milestone.status === 'funded' ? 'bg-purple-400 border-purple-400' :
                                milestone.status === 'rejected' ? 'bg-rose-400 border-rose-400' :
                                'bg-white/30 border-white/30';
                              const isUrgent = milestone.due_date
                                ? (new Date(milestone.due_date).getTime() - Date.now()) < 3 * 24 * 60 * 60 * 1000
                                : false;
                              return (
                              <div
                                key={milestone.id}
                                className={`relative rounded-xl border bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20 transition-all ${isUrgent ? 'urgency-border border-amber-400/30' : 'border-white/10'}`}
                              >
                                <span className={`absolute -left-[6px] top-1 h-3 w-3 rounded-full border-2 ${dotColor}`} />
                                {/* Header - Clickable */}
                                <div 
                                  onClick={() => {
                                    setExpandedMilestones(prev => {
                                      const next = new Set(prev);
                                      if (next.has(milestone.id)) {
                                        next.delete(milestone.id);
                                      } else {
                                        next.add(milestone.id);
                                      }
                                      return next;
                                    });
                                  }}
                                  className="flex items-start justify-between p-5 cursor-pointer"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 mb-2">
                                      <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                                        #{milestoneNumber}
                                      </span>
                                      <h5 className="font-semibold text-sm text-white">{milestone.title}</h5>
                                      {MILESTONE_DEFINITIONS[milestone.title] && (
                                        <div className="group relative">
                                          <button
                                            type="button"
                                            className="w-4 h-4 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 flex items-center justify-center transition-colors"
                                            title={MILESTONE_DEFINITIONS[milestone.title]}
                                          >
                                            <Info className="w-2.5 h-2.5 text-cyan-400" />
                                          </button>
                                          <div className="absolute left-0 top-6 z-50 hidden group-hover:block w-64 p-3 bg-[#1a1d24] border border-white/20 rounded-lg shadow-xl">
                                            <p className="text-xs text-white/90 font-medium mb-1.5">{milestone.title}</p>
                                            <p className="text-xs text-white/70 leading-relaxed">{MILESTONE_DEFINITIONS[milestone.title]}</p>
                                          </div>
                                        </div>
                                      )}
                                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap ${
                                        milestone.status === 'approved' || milestone.status === 'released' ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300' :
                                        milestone.status === 'submitted' ? 'bg-blue-500/15 border-blue-500/20 text-blue-300' :
                                        milestone.status === 'in_progress' ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300' :
                                        milestone.status === 'funded' ? 'bg-slate-500/15 border-slate-500/20 text-slate-300' :
                                        milestone.status === 'rejected' ? 'bg-rose-500/15 border-rose-500/20 text-rose-300' :
                                        'bg-slate-500/15 border-slate-500/20 text-slate-300'
                                      }`}>
                                        {milestone.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                      </span>
                                    </div>
                                  </div>
                                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                
                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="px-5 pb-5 space-y-4">
                                    {milestone.description && (
                                      <p className="text-xs text-white/60 leading-relaxed">{milestone.description}</p>
                                    )}
                                    {milestone.amount_cents && Number(milestone.amount_cents) > 0 && (
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-white/80 font-medium">{project.currency} {(Number(milestone.amount_cents) / 100).toLocaleString()}</span>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/5">
                                  {milestone.status === 'pending' && (
                                    <button
                                      onClick={() => updateMilestoneStatus(milestone.id, 'funded', project.id)}
                                      className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm flex items-center gap-1.5"
                                    >
                                      <DollarSign className="w-3.5 h-3.5" />
                                      Fund Milestone
                                    </button>
                                  )}
                                  {milestone.status === 'submitted' && (
                                    <>
                                      <button
                                        onClick={() => updateMilestoneStatus(milestone.id, 'approved', project.id)}
                                        className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm flex items-center gap-1.5"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => updateMilestoneStatus(milestone.id, 'rejected', project.id)}
                                        className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 px-4 py-2 text-sm flex items-center gap-1.5"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {(milestone.status === 'funded' || milestone.status === 'in_progress') && (
                                    <div className="text-xs text-white/50 italic">
                                      Waiting for freelancer to submit work
                                    </div>
                                  )}
                                  {(milestone.status === 'approved' || milestone.status === 'released') && (
                                    <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      {milestone.status === 'approved' ? 'Approved - funds releasing' : 'Payment released'}
                                    </div>
                                  )}
                                  {milestone.status === 'rejected' && (
                                    <div className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                                      <X className="w-3.5 h-3.5" />
                                      Rejected - awaiting resubmission
                                    </div>
                                  )}
                                    </div>

                                    {/* Deliverables Section */}
                                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-white/10">
                                        <h6 className="text-xs font-semibold text-white/80 mb-3 flex items-center gap-1.5">
                                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                                          <span>Deliverables ({milestone.deliverables.length})</span>
                                        </h6>
                                        <div className="space-y-2">
                                          {milestone.deliverables.map((deliverable: any) => (
                                            <div key={deliverable.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                  deliverable.type === 'code' ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
                                                }`}>
                                                  {deliverable.type === 'code' ? (
                                                    <Code className="w-4 h-4 text-emerald-300" />
                                                  ) : (
                                                    <FileText className="w-4 h-4 text-cyan-300" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-medium text-white truncate">{deliverable.name}</p>
                                                  <p className="text-xs text-white/50 mt-0.5">
                                                    {deliverable.uploadedAt ? new Date(deliverable.uploadedAt).toLocaleDateString() : ''}
                                                  </p>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 ml-3">
                                                <a
                                                  href={deliverable.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-cyan-300 hover:text-cyan-200 text-xs flex items-center space-x-1 transition-colors"
                                                >
                                                  <Download className="w-3 h-3" />
                                                  <span>Download</span>
                                                </a>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No projects found</p>
                  <button
                    onClick={() => setCreatingProject(true)}
                    className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm"
                  >
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projects List */}
              <div className="lg:col-span-1 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Projects</h3>
                  <button
                    onClick={() => fetchClientData()}
                    className="text-xs text-cyan-400 hover:text-cyan-300"
                    title="Refresh"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {projects.map((project) => {
                      const unreadCount = project.messages.filter(m => !m.read && m.sender === 'freelancer').length;
                      return (
                        <button
                          key={project.id}
                          onClick={() => {
                            setSelectedProject(project);
                            // Refresh project data when selecting
                            fetchClientData().then(() => {
                              const updated = projects.find(p => p.id === project.id);
                              if (updated) setSelectedProject(updated);
                            });
                          }}
                          className={`w-full text-left p-4 rounded-lg border transition ${
                            selectedProject?.id === project.id
                              ? 'bg-cyan-500/20 border-cyan-500/50'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <p className="font-semibold mb-1">{project.title}</p>
                          <p className="text-sm text-white/60">
                            {project.messages.length} message{project.messages.length !== 1 ? 's' : ''}
                            {unreadCount > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
                                {unreadCount} new
                              </span>
                            )}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                    <button
                      onClick={() => {
                        setActiveTab('projects');
                        setCreatingProject(true);
                      }}
                      className="mt-4 rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Create Project
                    </button>
                  </div>
                )}
          </div>

              {/* Messages */}
              <div className="lg:col-span-2">
                {selectedProject ? (
                  <div className="bg-white/5 rounded-lg border border-white/10 h-[600px] flex flex-col">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold">{selectedProject.title}</h3>
                      <p className="text-sm text-white/60">
                        {selectedProject.freelancer || 'No freelancer assigned'}
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedProject.messages.length > 0 ? (
                        <>
                          {selectedProject.messages.map((message) => {
                            const isMilestoneMessage = message.messageType === 'milestone';
                            return (
                              <div
                                key={message.id}
                                className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`px-4 py-3 ${
                                    isMilestoneMessage
                                      ? 'bg-amber-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/10 rounded-2xl max-w-[80%]'
                                      : message.sender === 'client'
                                      ? 'bg-gradient-to-br from-cyan-500/15 to-blue-500/20 border border-cyan-500/10 rounded-2xl rounded-tr-sm ml-auto max-w-[80%]'
                                      : 'bg-white/[0.04] border border-white/[0.08] rounded-2xl rounded-tl-sm mr-auto max-w-[80%]'
                                  }`}
                                >
                                  {isMilestoneMessage && (
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Target className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">Milestone Update</span>
                                    </div>
                                  )}
                                  <p className={`text-sm ${isMilestoneMessage ? 'text-amber-100' : ''}`}>{message.content}</p>
                                  <p className={`text-xs mt-1 ${isMilestoneMessage ? 'text-amber-300/70' : 'text-white/40'}`}>
                                    {new Date(message.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No messages yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                          placeholder="Type a message..."
                          disabled={sendingMessage}
                          className="bg-white/5 border border-white/10 rounded-xl text-white px-3 py-2 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage || !user?.id}
                          className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                        >
                          {sendingMessage ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 h-[600px] flex items-center justify-center">
                    <div className="text-center text-sm text-white/40">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a project to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Project Modal */}
          {creatingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <div className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-[#0B0D12] backdrop-blur-xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Create New Project</h3>
                  <button
                    onClick={() => {
                      setCreatingProject(false);
                      setProjectForm({
                        title: '',
                        description: '',
                        budget: '',
                        currency: 'AUD',
                        deadline: '',
                        freelancerId: ''
                      });
                    }}
                    className="text-white/50 hover:text-white transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full min-h-[100px]"
                      placeholder="Describe your project..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Budget</label>
                      <input
                        type="number"
                        value={projectForm.budget}
                        onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <select
                        value={projectForm.currency}
                        onChange={(e) => setProjectForm({ ...projectForm, currency: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      >
                        <option value="AUD" className="bg-[#0B0D10]">AUD</option>
                        <option value="USD" className="bg-[#0B0D10]">USD</option>
                        <option value="EUR" className="bg-[#0B0D10]">EUR</option>
                        <option value="GBP" className="bg-[#0B0D10]">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setCreatingProject(false);
                        setProjectForm({
                          title: '',
                          description: '',
                          budget: '',
                          currency: 'AUD',
                          deadline: '',
                          freelancerId: ''
                        });
                      }}
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 text-sm hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createProject}
                      disabled={creatingProject || !projectForm.title.trim()}
                      className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingProject ? 'Creating...' : 'Create Project'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}
