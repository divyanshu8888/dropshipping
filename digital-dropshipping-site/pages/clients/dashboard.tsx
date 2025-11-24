import React, { useState, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const Header = dynamic(() => import('../../src/components/Header'));
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/components/Toast';
import {
  Calendar,
  MessageCircle,
  Upload,
  CheckCircle,
  Clock,
  User,
  FileText,
  Settings,
  Bell,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
  Send,
  Paperclip,
  Download,
  Play,
  Pause,
  Edit3,
  Save,
  X,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Zap,
  Award,
  Target,
  BarChart3,
  Activity,
  Plus,
  MoreVertical,
  Globe,
  MapPin,
  Briefcase,
  Users,
  MessageSquare,
  Code,
  Info
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (selectedProject && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedProject?.messages]);

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

  const fetchClientData = async (signal?: AbortSignal) => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetch(`/api/clients/projects?userId=${user?.id}`, { signal }),
        fetch(`/api/clients/dashboard-metrics?userId=${user?.id}`, { signal })
      ]);

      // Projects
      const projectsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      if (projectsRes && projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } else if (projectsRes && !projectsRes.ok) {
        setProjects([]);
      }

      // Metrics
      const metricsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      if (metricsRes && metricsRes.ok) {
        const data = await metricsRes.json();
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('Error fetching client data:', e);
      setError('Unable to load your dashboard right now. Please try again shortly.');
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
          error: `Payment information cannot be shared. Use Uniti's payment system instead.` 
        };
      }
    }

    // Block standalone currency words (also check before phone numbers)
    const currencyMatch = extractMatch(currencyWords, originalContent);
    if (currencyMatch && content.split(/\s+/).length <= 3) {
      return { 
        valid: false, 
        error: `Payment information cannot be shared. Use Uniti's payment system instead.` 
      };
    }

    // Check for payment/banking info
    for (const pattern of paymentPatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Payment methods cannot be shared. Use Uniti's payment system instead.` 
        };
      }
    }

    // Check for phone numbers
    for (const pattern of phonePatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Phone numbers cannot be shared. Keep communication within Uniti.` 
        };
      }
    }

    // Check for email addresses
    const emailMatch = extractMatch(emailPattern, originalContent);
    if (emailMatch) {
      return { 
        valid: false, 
        error: `Email addresses cannot be shared. Keep communication within Uniti.` 
      };
    }

    // Check for URLs
    const urlMatch = extractMatch(urlPattern, originalContent);
    if (urlMatch) {
      return { 
        valid: false, 
        error: `External links cannot be shared. Keep communication within Uniti.` 
      };
    }

    // Check for social media
    for (const pattern of socialPatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        return { 
          valid: false, 
          error: `Social media handles cannot be shared. Keep communication within Uniti.` 
        };
      }
    }

    // Check for contact sharing attempts
    for (const pattern of contactPatterns) {
      if (pattern.test(content)) {
        return { 
          valid: false, 
          error: 'Contact information cannot be shared. Keep communication within Uniti.' 
        };
      }
    }

    // Block messages that are primarily spelled-out numbers (likely phone number bypass attempt)
    const words = content.split(/\s+/);
    const spelledNumberMatches = words.filter(w => spelledNumbers.test(w));
    if (spelledNumberMatches.length >= 2 && words.length <= 5) {
      return { 
        valid: false, 
        error: 'Contact information cannot be shared. Keep communication within Uniti.' 
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
            error: 'Phone numbers cannot be shared. Keep communication within Uniti.' 
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
            error: 'Phone numbers cannot be shared. Keep communication within Uniti.' 
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
            error: 'Phone numbers cannot be shared. Keep communication within Uniti.' 
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
      case 'draft': return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
      case 'open': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'in_review': return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'contracted': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'in_progress': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'delivered': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'completed': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'disputed': return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default: return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
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

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
      case 'funded': return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'in_progress': return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'submitted': return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'approved': return 'bg-green-500/15 text-green-300 border-green-500/30';
      case 'released': return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/15 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/15 text-gray-300 border-gray-500/30';
    }
  };


  return (
    <>
      <Head>
        <title>Client Dashboard - Uniti</title>
        <meta name="description" content="Manage your projects and collaborate with freelancers" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10] text-white">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Client'}!</h1>
            <p className="text-white/60">Manage your projects and collaborate with freelancers</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
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
                  className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-white/60 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Total Projects</span>
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <p className="text-3xl font-bold">{metrics.totalProjects}</p>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Active Projects</span>
                    <Activity className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-bold">{metrics.activeProjects}</p>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Completed</span>
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold">{metrics.completedProjects}</p>
                </div>
                <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Total Spent</span>
                    <DollarSign className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-3xl font-bold">${metrics.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>
            </div>

              {/* Recent Projects */}
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Briefcase className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold">Recent Projects</h2>
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
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${getStatusColor(project.status)}`}>
                            {formatStatusLabel(project.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-white/60">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                      <Briefcase className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-base font-medium mb-1">No projects yet</p>
                    <p className="text-sm text-white/40 mb-6">Get started by creating your first project</p>
                    <button
                      onClick={() => {
                        setActiveTab('projects');
                        setCreatingProject(true);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 flex items-center gap-2 mx-auto"
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
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder:text-white/40"
                  />
                </div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="px-4 py-2 bg-[#1a1d24] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white appearance-none cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value="all" className="bg-[#1a1d24] text-white">All Status</option>
                  <option value="open" className="bg-[#1a1d24] text-white">Open</option>
                  <option value="in_review" className="bg-[#1a1d24] text-white">In Review</option>
                  <option value="contracted" className="bg-[#1a1d24] text-white">Contracted</option>
                  <option value="in_progress" className="bg-[#1a1d24] text-white">In Progress</option>
                  <option value="delivered" className="bg-[#1a1d24] text-white">Delivered</option>
                  <option value="completed" className="bg-[#1a1d24] text-white">Completed</option>
                </select>
                <button
                  onClick={() => setCreatingProject(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              {/* Projects List */}
              {filteredProjects.length > 0 ? (
                <div className="space-y-4">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 hover:border-white/20 transition-all shadow-lg"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border whitespace-nowrap ${getStatusColor(project.status)}`}>
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
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Messages ({project.messages.length})
                        </button>
                        {project.milestones.length > 0 && (
                          <button
                            onClick={() => toggleProjectExpanded(project.id)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
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
                            <h4 className="font-semibold text-base flex items-center gap-2">
                              <Target className="w-4 h-4 text-cyan-400" />
                              Milestones ({project.milestones.length})
                            </h4>
                          </div>
                          <div className="space-y-3">
                            {project.milestones.map((milestone, index) => {
                              const milestoneNumber = index + 1;
                              const isExpanded = expandedMilestones.has(milestone.id);
                              return (
                              <div
                                key={milestone.id}
                                className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20 transition-all"
                              >
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
                                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                                        milestone.status === 'approved' || milestone.status === 'released' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                        milestone.status === 'submitted' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                                        milestone.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                        milestone.status === 'funded' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                        milestone.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                        'bg-gray-500/20 text-gray-300 border border-gray-500/30'
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
                                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                                    >
                                      <DollarSign className="w-3.5 h-3.5" />
                                      Fund Milestone
                                    </button>
                                  )}
                                  {milestone.status === 'submitted' && (
                                    <>
                                      <button
                                        onClick={() => updateMilestoneStatus(milestone.id, 'approved', project.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-green-600/20"
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => updateMilestoneStatus(milestone.id, 'rejected', project.id)}
                                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20"
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
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-white/60 mb-4">No projects found</p>
                  <button
                    onClick={() => setCreatingProject(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition"
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
                  <h3 className="font-semibold">Projects</h3>
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
                  <div className="text-center py-8 text-white/60">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                    <button
                      onClick={() => {
                        setActiveTab('projects');
                        setCreatingProject(true);
                      }}
                      className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition text-sm"
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
                                  className={`max-w-[70%] p-3 rounded-lg ${
                                    isMilestoneMessage
                                      ? 'bg-amber-500/20 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                                      : message.sender === 'client'
                                      ? 'bg-cyan-500/20 border border-cyan-500/30'
                                      : 'bg-white/10 border border-white/20'
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
                        <div className="text-center py-8 text-white/60">
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
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white placeholder:text-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage || !user?.id}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  <div className="bg-white/5 rounded-lg border border-white/10 h-[600px] flex items-center justify-center">
                    <div className="text-center text-white/60">
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
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white min-h-[100px]"
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
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Currency</label>
                      <select
                        value={projectForm.currency}
                        onChange={(e) => setProjectForm({ ...projectForm, currency: e.target.value })}
                        className="w-full px-4 py-2 bg-[#1a1d24] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      >
                        <option value="AUD" className="bg-[#1a1d24] text-white">AUD</option>
                        <option value="USD" className="bg-[#1a1d24] text-white">USD</option>
                        <option value="EUR" className="bg-[#1a1d24] text-white">EUR</option>
                        <option value="GBP" className="bg-[#1a1d24] text-white">GBP</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deadline</label>
                    <input
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-white"
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
                      className="flex-1 px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createProject}
                      disabled={creatingProject || !projectForm.title.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
    </>
  );
}
