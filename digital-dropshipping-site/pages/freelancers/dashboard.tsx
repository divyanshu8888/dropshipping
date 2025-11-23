import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Head from 'next/head';
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
  Code, 
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
  Lock,
  Trash2
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  status: 'draft' | 'open' | 'in_review' | 'contracted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  budget: number;
  deadline: string;
  description: string;
  createdAt: string;
  progress: number;
  messages: Message[];
  deliverables: Deliverable[];
}

interface Message {
  id: string;
  sender: 'freelancer' | 'client';
  content: string;
  timestamp: string;
  attachments?: string[];
  read?: boolean;
}

interface Deliverable {
  id: string;
  name: string;
  type: 'code' | 'document' | 'image' | 'video';
  url: string;
  uploadedAt: string;
  description: string;
}

interface Milestone {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  amount_cents: number;
  due_date: string;
  status: 'pending' | 'funded' | 'in_progress' | 'submitted' | 'approved' | 'released' | 'rejected';
  sort_order: number;
  created_at: string;
  deliverables?: Deliverable[];
}

interface Availability {
  isAvailable: boolean;
  workingHours: string;
  timezone: string;
  nextAvailableDate?: string;
  workingHoursFrom?: string;
  workingHoursTo?: string;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'EST (Eastern Time)' },
  { value: 'America/Chicago', label: 'CST (Central Time)' },
  { value: 'America/Denver', label: 'MST (Mountain Time)' },
  { value: 'America/Los_Angeles', label: 'PST (Pacific Time)' },
  { value: 'Europe/London', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Europe/Paris', label: 'CET (Central European Time)' },
  { value: 'Asia/Dubai', label: 'GST (Gulf Standard Time)' },
  { value: 'Asia/Kolkata', label: 'IST (India Standard Time)' },
  { value: 'Asia/Tokyo', label: 'JST (Japan Standard Time)' },
  { value: 'Australia/Sydney', label: 'AEST (Australian Eastern Time)' },
];

export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, isFreelancer, loading: authLoading, verified: authVerified } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  
  const displayName = useMemo(() => {
    return profileName || user?.name || user?.email?.split('@')[0] || '';
  }, [profileName, user]);

  // Editable profile form state
  const [profileForm, setProfileForm] = useState({
    display_name: '',
    headline: '',
    title: '',
    bio: '',
    description: '',
    country: '',
    skills: '' as string,
    hourly_rate_cents: '' as string,
    availability: '',
  });
  
  const [availability, setAvailability] = useState<Availability>({
    isAvailable: false, // Default to busy
    workingHours: '9 AM - 6 PM',
    timezone: 'UTC',
    nextAvailableDate: '',
    workingHoursFrom: '',
    workingHoursTo: ''
  });
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    projectId: '',
    title: '',
    description: '',
    amount: '',
    dueDate: ''
  });
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    openMilestones: { count: number; totalCents: number; dueIn7Days: number };
    earnings: { unbilledCents: number; escrowCents: number; pendingCents: number };
    avgResponseTime: { hours: number };
    onTimeDelivery: { percentage: number };
    profileStrength: { percentage: number };
    winRate: { percentage: number; total: number; won: number };
  } | null>(null);
  const [kycDocuments, setKycDocuments] = useState<any[]>([]);
  const [uploadingKyc, setUploadingKyc] = useState(false);
  const [editingKycDoc, setEditingKycDoc] = useState<any | null>(null);
  const [deletingKycDoc, setDeletingKycDoc] = useState<number | null>(null);
  const [kycUploadForm, setKycUploadForm] = useState({
    documentType: '',
    documentName: '',
    file: null as File | null
  });
  const [kycEditForm, setKycEditForm] = useState({
    documentName: '',
    file: null as File | null
  });
  
  // Refs to trigger native pickers
  const nextDateRef = useRef<HTMLInputElement | null>(null);
  const timeFromRef = useRef<HTMLInputElement | null>(null);
  const timeToRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Computed metrics (legacy - keeping for backward compatibility)
  const metrics = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed' || p.status === 'delivered').length;
    const totalEarnings = projects
      .filter(p => p.status === 'completed' || p.status === 'delivered')
      .reduce((sum, p) => sum + (p.budget || 0), 0);
    const pendingApproval = projects.filter(p => p.status === 'in_review' || p.status === 'open').length;
    const totalMessages = projects.reduce((sum, p) => sum + (p.messages?.length || 0), 0);
    const unreadMessages = projects.reduce((sum, p) => 
      sum + (p.messages?.filter(m => !m.read && m.sender === 'client').length || 0), 0
    );

    return {
      activeProjects,
      completedProjects,
      totalEarnings,
      pendingApproval,
      totalMessages,
      unreadMessages,
      averageRating: rating ?? 0,
      totalReviews: totalReviews ?? 0,
    };
  }, [projects, rating, totalReviews]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];
    
    if (projectFilter !== 'all') {
      filtered = filtered.filter(p => p.status === projectFilter);
    }
    
    if (projectSearch.trim()) {
      const searchLower = projectSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.client.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [projects, projectFilter, projectSearch]);

  useEffect(() => {
    // Wait for auth to finish loading and verifying before checking user
    if (authLoading || !authVerified) {
      return;
    }

    // Only redirect if auth is verified and user is not a freelancer
    if (!user || !isFreelancer()) {
      router.push('/login');
      return;
    }

    let active = true;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      try {
        await fetchFreelancerData(controller.signal);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();

    return () => {
      active = false;
      controller.abort();
    };
  }, [user, router, isFreelancer, authLoading, authVerified]);

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (selectedProject && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedProject?.messages]);

  // Auto-refresh all dashboard data every 5 seconds
  useEffect(() => {
    if (authLoading || !authVerified || !user?.id || !isFreelancer()) return;

    const refreshAllData = async () => {
      try {
        await fetchFreelancerData();
        // Update selected project if it exists
        if (selectedProject) {
          const freshProjects = await fetch(`/api/freelancers/projects/${user.id}`).then(r => r.json()).catch(() => ({ projects: [] }));
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

    // Refresh every 5 seconds
    const interval = setInterval(refreshAllData, 5000);

    return () => clearInterval(interval);
  }, [user?.id, authLoading, authVerified, isFreelancer, selectedProject?.id]);

  const fetchFreelancerData = async (signal?: AbortSignal) => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetch(`/api/freelancers/projects/${user?.id}`, { signal }),
        fetch(`/api/freelancers/me?userId=${user?.id}`, { signal }),
        fetch(`/api/freelancers/dashboard-metrics?freelancerId=${user?.id}`, { signal }),
        fetch(`/api/freelancers/kyc-documents?userId=${user?.id}`, { signal })
      ]);

      // Projects
      const projectsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      if (projectsRes && projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        
        // Fetch milestones for each project
        const milestonePromises = (Array.isArray(data.projects) ? data.projects : []).map(async (p: Project) => {
          try {
            const milestoneRes = await fetch(`/api/freelancers/milestones?projectId=${p.id}&freelancerId=${user?.id}`, { signal });
            if (milestoneRes.ok) {
              const milestoneData = await milestoneRes.json();
              return { projectId: p.id, milestones: milestoneData.milestones || [] };
            }
          } catch (e) {
            // Ignore errors
          }
          return { projectId: p.id, milestones: [] };
        });
        
        const milestoneResults = await Promise.allSettled(milestonePromises);
        const milestonesMap: Record<string, Milestone[]> = {};
        milestoneResults.forEach(result => {
          if (result.status === 'fulfilled') {
            milestonesMap[result.value.projectId] = result.value.milestones;
          }
        });
        setMilestones(milestonesMap);
      } else if (projectsRes && !projectsRes.ok) {
        setProjects([]);
      }

      // Profile summary (rating)
      const profileRes = results[1].status === 'fulfilled' ? results[1].value : null;
      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        if (data?.profile) {
          if (data.profile.name) setProfileName(data.profile.name);
          setRating(typeof data.profile.rating === 'number' ? data.profile.rating : null);
          setTotalReviews(typeof data.profile.totalReviews === 'number' ? data.profile.totalReviews : null);
          setProfileForm(prev => ({
            ...prev,
            display_name: data.profile.name || prev.display_name,
          }));
        } else {
          setProfileName(null);
          setRating(null);
          setTotalReviews(null);
        }
      }

      // Dashboard metrics
      const metricsRes = results[2].status === 'fulfilled' ? results[2].value : null;
      if (metricsRes && metricsRes.ok) {
        const data = await metricsRes.json();
        if (data?.metrics) {
          setDashboardMetrics(data.metrics);
        }
      }

      // Fetch availability
      try {
        const availRes = await fetch(`/api/freelancers/update-availability?freelancerId=${user?.id}`, { signal });
        if (availRes && availRes.ok) {
          const data = await availRes.json();
          if (data?.availability) {
            setAvailability(prev => ({ ...prev, ...data.availability }));
          }
        }
      } catch (e) {
        // Availability fetch is optional, don't fail if it errors
        console.warn('Could not fetch availability:', e);
      }

      // Fetch KYC documents
      const kycRes = results[3].status === 'fulfilled' ? results[3].value : null;
      if (kycRes && kycRes.ok) {
        const data = await kycRes.json();
        if (data?.documents) {
          setKycDocuments(Array.isArray(data.documents) ? data.documents : []);
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('Error fetching freelancer data:', e);
      setError('Unable to load your dashboard right now. Please try again shortly.');
    }
  };

  // Import the guard function (we'll use it directly)
  const validateMessageContent = (content: string): { valid: boolean; error?: string; reasons?: string[] } => {
    const message = content.toLowerCase().trim();
    const originalContent = content.trim();
    
    // Phone number patterns (various formats)
    const phonePatterns = [
      /\b\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g, // International: +91 83188 11781, +1-234-567-8900
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US format: 123-456-7890
      /\b\d{10,15}\b/g, // Long numbers: 8318811781
      /\b\+?\d{10,15}\b/g, // With country code: +918318811781
    ];

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

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
    if (currencyMatch && message.split(/\s+/).length <= 3) {
      return { 
        valid: false, 
        error: `Payment information cannot be shared. Use Uniti's payment system instead.` 
      };
    }

    // Check for phone numbers
    for (const pattern of phonePatterns) {
      const match = extractMatch(pattern, originalContent);
      if (match) {
        // Mask phone number for privacy
        const masked = match.length > 4 ? match.slice(0, 2) + '***' + match.slice(-2) : '***';
        return { 
          valid: false, 
          error: `Phone numbers cannot be shared. Keep communication within Uniti.` 
        };
      }
    }

    // Check for email addresses
    const emailMatch = extractMatch(emailPattern, originalContent);
    if (emailMatch) {
      // Mask email for privacy
      const [local, domain] = emailMatch.split('@');
      const maskedEmail = local.length > 2 ? local.slice(0, 2) + '***@' + domain : '***@' + domain;
      return { 
        valid: false, 
        error: `Email addresses cannot be shared. Keep communication within Uniti.` 
      };
    }

    // Check for contact sharing attempts
    for (const pattern of contactPatterns) {
      if (pattern.test(message)) {
        return { 
          valid: false, 
          error: 'Contact information cannot be shared. Keep communication within Uniti.' 
        };
      }
    }

    // Block messages that are primarily spelled-out numbers (likely phone number bypass attempt)
    const words = message.split(/\s+/);
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
        const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(message);
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
    const numberMatches = message.match(suspiciousNumbers);
    if (numberMatches && numberMatches.length >= 1 && words.length <= 3) {
      // Skip if message contains payment-related words (already checked above)
      const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(message);
      if (!hasPaymentContext) {
        // Check if message is mostly numbers
        const numberChars = message.replace(/\D/g, '').length;
        const totalChars = message.replace(/\s/g, '').length;
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
      const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(message);
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

  const sendMessage = async (projectId: string) => {
    if (!newMessage.trim() || sendingMessage) return;

    // Validate message content for confidential information
    const validation = validateMessageContent(newMessage);
    if (!validation.valid) {
      addToast(validation.error || 'Message contains restricted content', 'error');
      return;
    }

    setSendingMessage(true);
    try {
      const response = await fetch('/api/freelancers/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          content: newMessage,
          sender: 'freelancer',
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage('');
        addToast('Message sent successfully', 'success');
        await fetchFreelancerData();
        // Update selected project messages
        if (selectedProject) {
          setSelectedProject({
            ...selectedProject,
            messages: [
              ...selectedProject.messages,
              {
                id: Date.now().toString(),
                sender: 'freelancer',
                content: newMessage,
                timestamp: new Date().toISOString(),
                read: true
              }
            ]
          });
        }
      } else {
        // Show detailed error with reasons if available
        const errorMsg = data?.reasons 
          ? `${data.error}\n${data.reasons.join('\n')}`
          : data?.error || data?.details || 'Failed to send message';
        addToast(errorMsg, 'error');
        console.error('Send message error:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const uploadDeliverable = async (projectId: string, file: File, description: string) => {
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('description', description);

    try {
      const response = await fetch('/api/freelancers/upload-deliverable', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        addToast('Deliverable uploaded successfully', 'success');
        await fetchFreelancerData();
      } else {
        addToast('Failed to upload deliverable', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      addToast('Failed to upload deliverable', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const updateProjectProgress = async (projectId: string, progress: number) => {
    try {
      const response = await fetch('/api/freelancers/update-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, progress })
      });

      if (response.ok) {
        addToast('Progress updated successfully', 'success');
        await fetchFreelancerData();
      } else {
        addToast('Failed to update progress', 'error');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      addToast('Failed to update progress', 'error');
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const response = await fetch('/api/freelancers/update-project-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, status, freelancerId: user?.id })
      });

      if (response.ok) {
        addToast('Status updated successfully', 'success');
        // Optimistically update local state
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, status: status as any } : p
        ));
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Failed to update status', 'error');
    }
  };

  const createMilestone = async () => {
    if (!milestoneForm.title.trim() || !milestoneForm.projectId) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate for personal info
    const personalInfoPatterns = [
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\$\d+|\d+\s*(dollars?|usd|eur|gbp)/gi, // Price mentions
      /\b(price|cost|fee|charge|payment|invoice)\s*:?\s*\$\d+/gi // Price context
    ];

    const combinedText = `${milestoneForm.title} ${milestoneForm.description}`.toLowerCase();
    for (const pattern of personalInfoPatterns) {
      if (pattern.test(combinedText)) {
        addToast('Cannot include personal information (email, phone, price) in milestones', 'error');
        return;
      }
    }

    setCreatingMilestone(false);
    setSaving(true);
    try {
      const response = await fetch('/api/freelancers/create-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: milestoneForm.projectId,
          title: milestoneForm.title,
          description: milestoneForm.description || '',
          dueDate: milestoneForm.dueDate || null,
          freelancerId: user?.id
        })
      });

      if (response.ok) {
        addToast('Milestone created successfully', 'success');
        setMilestoneForm({ projectId: '', title: '', description: '', amount: '', dueDate: '' });
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to create milestone', 'error');
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      addToast('Failed to create milestone', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadMilestoneFile = async (milestoneId: string, projectId: string, file: File) => {
    // Validate file name and content for personal info
    const fileName = file.name.toLowerCase();
    const personalInfoPatterns = [
      /email|contact|phone|price|cost|invoice|payment/i,
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    ];

    for (const pattern of personalInfoPatterns) {
      if (pattern.test(fileName)) {
        addToast('File name cannot contain personal information (email, contact, price)', 'error');
        return;
      }
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('milestoneId', milestoneId);
    formData.append('projectId', projectId);
    formData.append('freelancerId', user?.id || '');

    try {
      const response = await fetch('/api/freelancers/upload-milestone-file', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        addToast('File uploaded successfully', 'success');
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to upload file', 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      addToast('Failed to upload file', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const uploadKycDocument = async () => {
    if (!kycUploadForm.documentType || !kycUploadForm.file) {
      addToast('Please select document type and file', 'error');
      return;
    }

    setUploadingKyc(true);
    const formData = new FormData();
    formData.append('file', kycUploadForm.file);
    formData.append('documentType', kycUploadForm.documentType);
    formData.append('documentName', kycUploadForm.documentName || kycUploadForm.file.name);
    formData.append('userId', user?.id || '');

    try {
      const response = await fetch('/api/freelancers/upload-kyc-document', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        addToast('KYC document uploaded successfully', 'success');
        setKycUploadForm({ documentType: '', documentName: '', file: null });
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to upload KYC document', 'error');
      }
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      addToast('Failed to upload KYC document', 'error');
    } finally {
      setUploadingKyc(false);
    }
  };

  const deleteKycDocument = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingKycDoc(docId);
    try {
      const response = await fetch(`/api/freelancers/kyc-documents/${docId}?userId=${user?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        addToast('Document deleted successfully', 'success');
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to delete document', 'error');
      }
    } catch (error) {
      console.error('Error deleting KYC document:', error);
      addToast('Failed to delete document', 'error');
    } finally {
      setDeletingKycDoc(null);
    }
  };

  const startEditKycDocument = (doc: any) => {
    setEditingKycDoc(doc);
    setKycEditForm({
      documentName: doc.document_name || '',
      file: null
    });
  };

  const cancelEditKycDocument = () => {
    setEditingKycDoc(null);
    setKycEditForm({ documentName: '', file: null });
  };

  const updateKycDocument = async () => {
    if (!editingKycDoc) return;

    if (!kycEditForm.documentName && !kycEditForm.file) {
      addToast('Please provide a document name or new file', 'error');
      return;
    }

    setUploadingKyc(true);
    const formData = new FormData();
    
    if (kycEditForm.documentName) {
      formData.append('documentName', kycEditForm.documentName);
    }
    
    if (kycEditForm.file) {
      formData.append('file', kycEditForm.file);
    }
    
    formData.append('userId', user?.id || '');

    try {
      const response = await fetch(`/api/freelancers/kyc-documents/${editingKycDoc.id}?userId=${user?.id}`, {
        method: 'PATCH',
        body: formData
      });

      if (response.ok) {
        addToast('Document updated successfully', 'success');
        setEditingKycDoc(null);
        setKycEditForm({ documentName: '', file: null });
        await fetchFreelancerData();
      } else {
        const error = await response.json();
        addToast(error?.error || 'Failed to update document', 'error');
      }
    } catch (error) {
      console.error('Error updating KYC document:', error);
      addToast('Failed to update document', 'error');
    } finally {
      setUploadingKyc(false);
    }
  };

  const deleteDeliverable = async (deliverableId: string, projectId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await fetch('/api/freelancers/delete-deliverable', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deliverableId, 
          projectId,
          freelancerId: user?.id 
        })
      });

      const data = await response.json();

      if (response.ok) {
        addToast('File deleted successfully', 'success');
        await fetchFreelancerData();
      } else {
        addToast(data?.error || data?.details || 'Failed to delete file', 'error');
        console.error('Delete error:', data);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      addToast('Failed to delete file', 'error');
    }
  };

  // Save availability to server
  const updateAvailability = useCallback(async (newAvailability?: Availability) => {
    if (saving) return;
    setSaving(true);
    try {
      // Use the passed value or get current state
      const availToSave = newAvailability || availability;
      
      const response = await fetch('/api/freelancers/update-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freelancerId: user?.id, 
          availability: availToSave
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state with the parsed response from server
        if (data?.availability) {
          setAvailability(data.availability);
        }
        addToast('Availability updated', 'success');
      } else {
        addToast(data?.error || data?.details || 'Failed to update availability', 'error');
        console.error('Availability update error:', data);
        // Revert state on error by fetching current state
        try {
          const currentRes = await fetch(`/api/freelancers/update-availability?freelancerId=${user?.id}`);
          if (currentRes.ok) {
            const currentData = await currentRes.json();
            if (currentData?.availability) {
              setAvailability(currentData.availability);
            }
          }
        } catch (e) {
          // Ignore fetch error
        }
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      addToast('Failed to update availability', 'error');
      // Revert state on error
      try {
        const currentRes = await fetch(`/api/freelancers/update-availability?freelancerId=${user?.id}`);
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          if (currentData?.availability) {
            setAvailability(currentData.availability);
          }
        }
      } catch (e) {
        // Ignore fetch error
      }
    } finally {
      setSaving(false);
    }
  }, [availability, user?.id, saving, addToast]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'open': return <FileText className="w-4 h-4" />;
      case 'in_review': return <Eye className="w-4 h-4" />;
      case 'contracted': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'delivered': return <Upload className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'disputed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatusLabel = (status: string) => {
    // Map database statuses to user-friendly labels
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'open': 'New',
      'in_review': 'In Review',
      'contracted': 'Contracted',
      'in_progress': 'In Progress',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'disputed': 'Disputed'
    };
    return statusMap[status] || status.replace('_', ' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>Freelancer Dashboard - Uniti</title>
        <meta name="description" content="Manage your projects, communicate with clients, and track your progress" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10] text-white">
        <Header />

        {/* Hero Row */}
        <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Freelancer Dashboard
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-white/70">Welcome back, {displayName}</p>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide flex items-center space-x-2 transition-all hover:scale-105 ${
                      !availability.isAvailable 
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-400/20 hover:bg-rose-500/20' 
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${!availability.isAvailable ? 'bg-rose-400' : 'bg-emerald-400'} animate-pulse`}></div>
                    <span>{!availability.isAvailable ? 'Busy' : 'Available'}</span>
                  </button>
              </div>
                </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/products')}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 hover:border-white/20 text-sm font-medium"
                >
                  New Proposal
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Playbook</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm mb-8 shadow-xl">
            <div className="border-b border-white/10">
              <nav className="-mb-px flex space-x-1 px-6 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp, badge: null },
                  { id: 'pipeline', label: 'Pipeline', icon: FileText, badge: metrics.activeProjects > 0 ? metrics.activeProjects : null },
                  { id: 'playbooks', label: 'Playbooks', icon: Code, badge: null },
                  { id: 'inbox', label: 'Inbox', icon: MessageCircle, badge: metrics.unreadMessages > 0 ? metrics.unreadMessages : null },
                  { id: 'calendar', label: 'Calendar', icon: Calendar, badge: null },
                  { id: 'deliverables', label: 'Deliverables', icon: Upload, badge: null },
                  { id: 'earnings', label: 'Earnings', icon: DollarSign, badge: null },
                  { id: 'profile', label: 'Profile & Settings', icon: User, badge: null }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-all duration-200 relative ${
                      activeTab === tab.id
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                    }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
                    )}
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* New KPI Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Open Milestones */}
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-5 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
                      <Target className="w-5 h-5 text-cyan-300" />
                  </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? formatCurrency((dashboardMetrics.openMilestones.totalCents || 0) / 100) : '$0'}
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">Open Milestones</p>
                  <p className="text-xs text-white/50">{dashboardMetrics?.openMilestones.dueIn7Days || 0} due in 7 days</p>
                </button>

                {/* Unbilled / In Escrow */}
                <button
                  onClick={() => setActiveTab('earnings')}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5 backdrop-blur-sm hover:border-emerald-500/30 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                      <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? formatCurrency((dashboardMetrics.earnings.unbilledCents || 0) / 100) : '$0'}
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">Unbilled / In Escrow</p>
                  <p className="text-xs text-white/50">
                    {dashboardMetrics ? formatCurrency((dashboardMetrics.earnings.escrowCents || 0) / 100) : '$0'} escrow
                  </p>
                </button>

                {/* Avg Response Time */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-5 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/10">
                      <Clock className="w-5 h-5 text-purple-300" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? (Number(dashboardMetrics.avgResponseTime.hours) || 0).toFixed(1) : '0'}h
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">Avg Response Time</p>
                  <p className="text-xs text-white/50">Last 7 days (Goal: &lt;4h)</p>
              </div>

                {/* On-time Delivery */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-5 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                      <CheckCircle className="w-5 h-5 text-amber-300" />
                  </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? dashboardMetrics.onTimeDelivery.percentage : 0}%
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">On-time Delivery</p>
                  <p className="text-xs text-white/50">Last 30 days</p>
                  </div>

                {/* Profile Strength */}
                <button
                  onClick={() => setActiveTab('profile')}
                  className="rounded-xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-5 backdrop-blur-sm hover:border-fuchsia-500/30 transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10">
                      <Award className="w-5 h-5 text-fuchsia-300" />
                </div>
              </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? dashboardMetrics.profileStrength.percentage : 0}%
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">Profile Strength</p>
                  <p className="text-xs text-white/50">
                    {dashboardMetrics && dashboardMetrics.profileStrength.percentage < 100 
                      ? `${Math.ceil((100 - dashboardMetrics.profileStrength.percentage) / 12.5)} steps left`
                      : 'Complete'}
                  </p>
                </button>

                {/* Win Rate */}
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-blue-500/5 p-5 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-blue-500/10">
                      <TrendingUp className="w-5 h-5 text-indigo-300" />
                  </div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-0.5">
                    {dashboardMetrics ? dashboardMetrics.winRate.percentage : 0}%
                  </p>
                  <p className="text-xs font-medium text-white/70 mb-1">Win Rate</p>
                  <p className="text-xs text-white/50">
                    {dashboardMetrics ? `${dashboardMetrics.winRate.won}/${dashboardMetrics.winRate.total} proposals` : '0/0 proposals'}
                    </p>
                  </div>
              </div>

              {/* Recent Activity & Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span>Recent Activity</span>
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {projects.length === 0 ? (
                      <div className="text-center py-8 text-white/50">
                        <FileText className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p>No recent activity</p>
                        <p className="text-sm mt-1">Projects will appear here once assigned</p>
                  </div>
                    ) : (
                      projects.slice(0, 5).map(project => (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              project.status === 'completed' ? 'bg-emerald-400' :
                              project.status === 'in_progress' ? 'bg-cyan-400' :
                              project.status === 'open' ? 'bg-blue-400' :
                              project.status === 'delivered' ? 'bg-amber-400' :
                              project.status === 'cancelled' ? 'bg-red-400' :
                              project.status === 'disputed' ? 'bg-orange-400' :
                              'bg-gray-400'
                            }`}></div>
                            <div>
                              <p 
                                onClick={() => {
                                  setSelectedProject(project);
                                  setActiveTab('inbox');
                                }}
                                className="font-medium text-sm cursor-pointer hover:text-cyan-400 transition-colors"
                              >
                                {project.title}
                              </p>
                              <p className="text-xs text-white/50">{project.client} • {formatDate(project.createdAt)}</p>
                </div>
              </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                            {formatStatusLabel(project.status)}
                          </span>
            </div>
                      ))
                    )}
                </div>
              </div>

                <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <span>Quick Stats</span>
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Total Projects</span>
                      <span className="font-semibold">{projects.length}</span>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Messages</span>
                      <span className="font-semibold">{metrics.totalMessages}</span>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Unread</span>
                      <span className="font-semibold text-cyan-400">{metrics.unreadMessages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Deliverables</span>
                      <span className="font-semibold">
                        {projects.reduce((sum, p) => sum + (p.deliverables?.length || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'pipeline' || activeTab === 'projects') && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    />
              </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-white/10 bg-[#1a1d24] rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white appearance-none cursor-pointer"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%23ffffff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                      <option value="all" className="bg-[#1a1d24] text-white">All Status</option>
                      <option value="open" className="bg-[#1a1d24] text-white">New</option>
                      <option value="draft" className="bg-[#1a1d24] text-white">Draft</option>
                      <option value="in_review" className="bg-[#1a1d24] text-white">In Review</option>
                      <option value="contracted" className="bg-[#1a1d24] text-white">Contracted</option>
                      <option value="in_progress" className="bg-[#1a1d24] text-white">In Progress</option>
                      <option value="delivered" className="bg-[#1a1d24] text-white">Delivered</option>
                      <option value="completed" className="bg-[#1a1d24] text-white">Completed</option>
                      <option value="cancelled" className="bg-[#1a1d24] text-white">Cancelled</option>
                      <option value="disputed" className="bg-[#1a1d24] text-white">Disputed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                {filteredProjects.length === 0 ? (
                  <div className="p-12 text-center text-white/70">
                    <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      {projectSearch || projectFilter !== 'all' ? 'No projects found' : 'No projects yet'}
                    </h3>
                    <p className="text-sm">
                      {projectSearch || projectFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'Projects assigned by admins will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredProjects.map(project => {
                      const isExpanded = expandedProjects.has(project.id);
                      return (
                        <div key={project.id} className="p-6 hover:bg-white/5 transition-colors">
                          <div className="flex items-start justify-between">
                        <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setActiveTab('inbox');
                                  }}
                                  className="text-lg font-semibold cursor-pointer hover:text-cyan-400 transition-colors"
                                >
                                  {project.title}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{formatStatusLabel(project.status)}</span>
                            </span>
                          </div>
                              <p className="text-white/70 text-sm mb-3">{project.description || 'No description provided'}</p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{project.client}</span>
                                </span>
                                {project.deadline && (
                                  <span className="flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(project.deadline)}</span>
                                  </span>
                                )}
                          </div>
                          {project.status === 'in_progress' && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between text-sm text-white/60 mb-2">
                                <span>Progress</span>
                                    <span className="font-semibold">{project.progress}%</span>
                              </div>
                                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                <div 
                                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/50"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                            <div className="flex items-center space-x-2 ml-4">
                          <button
                                onClick={() => toggleProjectExpanded(project.id)}
                                className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {project.status === 'in_progress' && (
                            <button
                              onClick={() => updateProjectProgress(project.id, Math.min(project.progress + 10, 100))}
                                  className="px-3 py-1.5 text-sm rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15 transition-colors"
                            >
                              Update Progress
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => {
                                setSelectedProject(project);
                                setActiveTab('inbox');
                              }}
                              className="px-4 py-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15 transition-colors text-sm font-medium flex items-center space-x-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>View Messages</span>
                              {project.messages && project.messages.filter(m => !m.read && m.sender === 'client').length > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                                  {project.messages.filter(m => !m.read && m.sender === 'client').length}
                                </span>
                              )}
                            </button>
                            {project.deliverables && project.deliverables.length > 0 && (
                              <button
                                onClick={() => setActiveTab('deliverables')}
                                className="px-4 py-2 rounded-lg border border-purple-400/30 bg-purple-400/10 text-purple-200 hover:bg-purple-400/15 transition-colors text-sm font-medium flex items-center space-x-2"
                              >
                                <Upload className="w-4 h-4" />
                                <span>View Deliverables ({project.deliverables.length})</span>
                              </button>
                            )}
                    </div>

                          {/* Messages Preview */}
                          {project.messages && project.messages.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center space-x-2">
                                <MessageCircle className="w-4 h-4" />
                                <span>Recent Messages</span>
                              </h4>
                              <div className="space-y-3 max-h-48 overflow-y-auto">
                                {project.messages.slice(-3).map(message => (
                                  <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                      message.sender === 'freelancer'
                                        ? 'bg-cyan-500/10 border border-cyan-400/20'
                                        : 'bg-white/5 border border-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium text-white/70">
                                        {message.sender === 'freelancer' ? 'You' : project.client}
                                      </span>
                                      <span className="text-xs text-white/50">{formatTime(message.timestamp)}</span>
                                    </div>
                                    <p className="text-sm text-white/80 line-clamp-2">{message.content}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deliverables Preview */}
                          {project.deliverables && project.deliverables.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-white/90 mb-3 flex items-center space-x-2">
                                <Upload className="w-4 h-4" />
                                <span>Deliverables ({project.deliverables.length})</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {project.deliverables.slice(0, 4).map(deliverable => (
                                  <div
                                    key={deliverable.id}
                                    className="p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                  >
                                    <div className="flex items-center space-x-2 mb-1">
                                      {deliverable.type === 'code' ? (
                                        <Code className="w-4 h-4 text-emerald-300" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-cyan-300" />
                                      )}
                                      <span className="text-sm font-medium truncate">{deliverable.name}</span>
                                    </div>
                                    <p className="text-xs text-white/50">{formatDate(deliverable.uploadedAt)}</p>
                                  </div>
                                ))}
              </div>
            </div>
          )}

                          {/* Milestones Section */}
                          <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-white/90 flex items-center space-x-2">
                                <Target className="w-4 h-4" />
                                <span>Milestones</span>
                              </h4>
                              <button
                                onClick={() => {
                                  setMilestoneForm({
                                    projectId: project.id,
                                    title: '',
                                    description: '',
                                    amount: '',
                                    dueDate: ''
                                  });
                                  setCreatingMilestone(true);
                                }}
                                className="px-3 py-1.5 text-xs rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15 transition-colors flex items-center space-x-1"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Create Milestone</span>
                              </button>
                            </div>

                            {milestones[project.id] && milestones[project.id].length > 0 ? (
                              <div className="space-y-3">
                                {milestones[project.id].map(milestone => (
                                  <div key={milestone.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <h5 className="font-medium text-sm text-white">{milestone.title}</h5>
                                        {milestone.description && (
                                          <p className="text-xs text-white/70 mt-1">{milestone.description}</p>
                                        )}
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        milestone.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' :
                                        milestone.status === 'submitted' ? 'bg-cyan-500/15 text-cyan-300' :
                                        milestone.status === 'in_progress' ? 'bg-blue-500/15 text-blue-300' :
                                        'bg-gray-500/15 text-gray-300'
                                      }`}>
                                        {milestone.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 mb-3">
                                      <div className="flex items-center space-x-4 text-xs text-white/50">
                                        {milestone.due_date && (
                                          <span className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(milestone.due_date)}</span>
                                          </span>
                                        )}
                                      </div>
                                      <input
                                        type="file"
                                        id={`milestone-file-${milestone.id}`}
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            uploadMilestoneFile(milestone.id, project.id, file);
                                          }
                                          // Reset input to allow re-uploading same file
                                          e.target.value = '';
                                        }}
                                        accept=".zip,.rar,.7z,.tar,.gz,.pdf,.doc,.docx,.txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml"
                                      />
                                      <label
                                        htmlFor={`milestone-file-${milestone.id}`}
                                        className="px-3 py-1.5 text-xs rounded-lg border border-purple-400/30 bg-purple-400/10 text-purple-200 hover:bg-purple-400/15 transition-colors cursor-pointer flex items-center space-x-1"
                                      >
                                        <Upload className="w-3 h-3" />
                                        <span>Upload Code/File</span>
                                      </label>
                                    </div>
                                    
                                    {/* Files under milestone */}
                                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-white/10">
                                        <h6 className="text-xs font-medium text-white/70 mb-2 flex items-center space-x-1">
                                          <Upload className="w-3 h-3" />
                                          <span>Files ({milestone.deliverables.length})</span>
                                        </h6>
                                        <div className="space-y-2">
                                          {milestone.deliverables.map(deliverable => (
                                            <div key={deliverable.id} className="flex items-center justify-between p-2 rounded border border-white/10 bg-black/30">
                                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                {deliverable.type === 'code' ? (
                                                  <Code className="w-3 h-3 text-emerald-300 flex-shrink-0" />
                                                ) : (
                                                  <FileText className="w-3 h-3 text-cyan-300 flex-shrink-0" />
                                                )}
                                                <span className="text-xs font-medium truncate">{deliverable.name}</span>
                                                <span className="text-xs text-white/40">{formatDate(deliverable.uploadedAt)}</span>
                                              </div>
                                              <div className="flex items-center space-x-2 ml-2">
                                                <a
                                                  href={deliverable.url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-cyan-300 hover:text-cyan-200 text-xs flex items-center space-x-1 transition-colors"
                                                >
                                                  <Download className="w-3 h-3" />
                                                  <span>Download</span>
                                                </a>
                                                <button
                                                  onClick={() => deleteDeliverable(deliverable.id, project.id)}
                                                  className="text-red-300 hover:text-red-200 text-xs flex items-center space-x-1 transition-colors"
                                                >
                                                  <X className="w-3 h-3" />
                                                  <span>Delete</span>
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-white/50 border border-white/10 rounded-lg bg-white/5">
                                <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
                                <p className="text-xs">No milestones yet</p>
                                <p className="text-xs mt-1">Create milestones to organize your work</p>
                              </div>
                            )}
                          </div>

                          {/* Status Change & Project Details */}
                          <div className="space-y-4 pt-4 border-t border-white/10">
                            {/* Status Change */}
                            <div>
                              <label className="block text-xs font-medium text-white/70 mb-2">Update Status</label>
                              <select
                                value={project.status}
                                onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                                className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm"
                              >
                                <option value="open">New</option>
                                <option value="draft">Draft</option>
                                <option value="in_review">In Review</option>
                                <option value="contracted">Contracted</option>
                                <option value="in_progress">In Progress</option>
                                <option value="delivered">Delivered</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* Project Details */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-white/50 mb-1">Created</p>
                                <p className="text-sm font-medium">{formatDate(project.createdAt)}</p>
                              </div>
                              {project.deadline && (
                                <div>
                                  <p className="text-xs text-white/50 mb-1">Deadline</p>
                                  <p className="text-sm font-medium">{formatDate(project.deadline)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-white/50 mb-1">Current Status</p>
                                <p className="text-sm font-medium capitalize">{formatStatusLabel(project.status)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'inbox' || activeTab === 'messages') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                  <h2 className="text-lg font-semibold">Projects with Messages</h2>
                </div>
                <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
                  {projects.filter(p => p.messages && p.messages.length > 0).length === 0 ? (
                    <div className="p-8 text-center text-white/50">
                      <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    projects.filter(p => p.messages && p.messages.length > 0).map(project => {
                      const unreadCount = project.messages?.filter(m => !m.read && m.sender === 'client').length || 0;
                      return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                          className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                            selectedProject?.id === project.id ? 'bg-white/10 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{project.title}</h3>
                              <p className="text-sm text-white/70 truncate">{project.client}</p>
                        </div>
                            <div className="text-right ml-2">
                              {unreadCount > 0 && (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-1">
                                  {unreadCount}
                                </span>
                              )}
                              <p className="text-xs text-white/40">
                                {project.messages && project.messages.length > 0 && 
                                  formatTime(project.messages[project.messages.length - 1]?.timestamp)
                                }
                          </p>
                        </div>
                      </div>
                    </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col">
                {selectedProject ? (
                  <>
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                      <h2 className="text-lg font-semibold">{selectedProject.client}</h2>
                      <p className="text-sm text-white/70">{selectedProject.title}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[400px] max-h-[600px]">
                      {selectedProject.messages && selectedProject.messages.length > 0 ? (
                        selectedProject.messages.map(message => (
                        <div
                          key={message.id}
                            className={`flex ${message.sender === 'freelancer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              message.sender === 'freelancer'
                                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                  : 'bg-white/10 text-white border border-white/20'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-1.5 ${
                                message.sender === 'freelancer' ? 'text-white/80' : 'text-white/50'
                              }`}>
                                {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-white/50">
                          <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-3" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Start the conversation</p>
                    </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(selectedProject.id)}
                          disabled={sendingMessage}
                        />
                        <button
                          onClick={() => sendMessage(selectedProject.id)}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {sendingMessage ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                          <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-[600px] flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a project</h3>
                      <p className="text-white/70">Choose a project to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'calendar' || activeTab === 'availability') && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                <span>Availability Settings</span>
              </h2>
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <h3 className="font-medium mb-1">Current Status</h3>
                    <p className="text-sm text-white/70">
                      {availability.isAvailable 
                        ? 'You are available for new projects' 
                        : 'You are busy and not accepting new projects'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newState = { ...availability, isAvailable: !availability.isAvailable };
                      setAvailability(newState);
                      updateAvailability(newState);
                    }}
                    disabled={saving}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      !availability.isAvailable ? 'bg-rose-500' : 'bg-emerald-500'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        !availability.isAvailable ? 'translate-x-1' : 'translate-x-6'
                      }`}
                    />
                  </button>
                  <div className="ml-3 text-sm font-medium">
                    {!availability.isAvailable ? 'Busy' : 'Available'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Next available date
                  </label>
                  <div className="relative">
                  <input
                      type="date"
                      value={availability.nextAvailableDate || ''}
                      onChange={(e) => {
                        setAvailability(prev => ({ ...prev, nextAvailableDate: e.target.value }));
                      }}
                      ref={nextDateRef}
                      onClick={() => (nextDateRef.current as any)?.showPicker?.()}
                      inputMode="none"
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full pl-11 pr-3 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-white/40 cursor-pointer caret-transparent"
                    />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Working hours
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">From</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={availability.workingHoursFrom || ''}
                          onChange={(e) => {
                            setAvailability(prev => ({ ...prev, workingHoursFrom: e.target.value }));
                          }}
                          ref={timeFromRef}
                          onClick={() => (timeFromRef.current as any)?.showPicker?.()}
                          inputMode="none"
                          onKeyDown={(e) => e.preventDefault()}
                          className="w-full pl-11 pr-3 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer caret-transparent"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">To</label>
                      <div className="relative">
                        <input
                          type="time"
                          value={availability.workingHoursTo || ''}
                          onChange={(e) => {
                            setAvailability(prev => ({ ...prev, workingHoursTo: e.target.value }));
                          }}
                          ref={timeToRef}
                          onClick={() => (timeToRef.current as any)?.showPicker?.()}
                          inputMode="none"
                          onKeyDown={(e) => e.preventDefault()}
                          className="w-full pl-11 pr-3 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer caret-transparent"
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Timezone</span>
                  </label>
                  <select
                    value={availability.timezone}
                    onChange={(e) => {
                      setAvailability(prev => ({ ...prev, timezone: e.target.value }));
                    }}
                    className="w-full px-3 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-white/10">
                <button
                    onClick={() => updateAvailability()}
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'playbooks' && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Playbooks</h2>
                <button
                  onClick={() => router.push('/products')}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Playbook</span>
                </button>
              </div>
              <div className="p-12 text-center text-white/70">
                <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No playbooks yet</h3>
                <p className="text-sm mb-6">Create reusable service templates to streamline proposals and sales.</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push('/products')}
                    className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 font-medium"
                  >
                    Create Playbook
                  </button>
                  <button
                    onClick={() => setActiveTab('pipeline')}
                    className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    New Proposal
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">Available</p>
                      <p className="text-3xl font-bold text-white">
                        {dashboardMetrics ? formatCurrency((dashboardMetrics.earnings.unbilledCents || 0) / 100) : '$0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                      <DollarSign className="w-6 h-6 text-emerald-300" />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">Ready to withdraw</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">In Escrow</p>
                      <p className="text-3xl font-bold text-white">
                        {dashboardMetrics ? formatCurrency((dashboardMetrics.earnings.escrowCents || 0) / 100) : '$0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
                      <Lock className="w-6 h-6 text-cyan-300" />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">Secured until milestone completion</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white/70 mb-1">Pending</p>
                      <p className="text-3xl font-bold text-white">
                        {dashboardMetrics ? formatCurrency((dashboardMetrics.earnings.pendingCents || 0) / 100) : '$0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                      <Clock className="w-6 h-6 text-amber-300" />
                    </div>
                  </div>
                  <p className="text-xs text-white/50">Awaiting payment clearance</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Payout Settings</h3>
                <div className="p-8 text-center text-white/70 border border-white/10 rounded-lg bg-white/5">
                  <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-sm mb-4">Add a payout method to receive funds</p>
                  <div className="flex items-center justify-center gap-3">
                    <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 font-medium">
                      Connect Stripe
                    </button>
                    <button className="px-6 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 font-medium">
                      Add Bank Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                <h2 className="text-lg font-semibold">Project Deliverables</h2>
              </div>
              <div className="p-6">
                {projects.filter(p => (p.deliverables && p.deliverables.length > 0) || p.status === 'delivered').length === 0 ? (
                  <div className="text-center py-12 text-white/70">
                    <Upload className="w-16 h-16 text-white/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No deliverables yet</h3>
                    <p className="text-sm">Upload files and code for your projects</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects.map(project => (
                      ((project.deliverables && project.deliverables.length > 0) || project.status === 'delivered') && (
                        <div key={project.id} className="border border-white/10 rounded-xl p-5 bg-white/5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-cyan-400" />
                              <span>{project.title}</span>
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{formatStatusLabel(project.status)}</span>
                            </span>
                          </div>
                          {project.deliverables && project.deliverables.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {project.deliverables.map(deliverable => (
                                <div key={deliverable.id} className="border border-white/10 rounded-lg p-4 bg-black/30 hover:bg-black/40 transition-colors">
                                  <div className="flex items-center space-x-2 mb-2">
                                    {deliverable.type === 'code' ? (
                                      <Code className="w-5 h-5 text-emerald-300" />
                                    ) : (
                                      <FileText className="w-5 h-5 text-cyan-300" />
                                    )}
                                    <span className="font-medium text-sm truncate">{deliverable.name}</span>
                                  </div>
                                  <p className="text-sm text-white/70 mb-3 line-clamp-2">{deliverable.description}</p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-white/50">
                                      {formatDate(deliverable.uploadedAt)}
                                    </span>
                                    <button className="text-cyan-300 hover:text-cyan-200 text-sm flex items-center space-x-1 transition-colors">
                                      <Download className="w-4 h-4" />
                                      <span>Download</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-white/50 border border-white/10 rounded-lg bg-white/5">
                              <Upload className="w-12 h-12 text-white/20 mx-auto mb-3" />
                              <p className="text-sm">No deliverables uploaded yet</p>
                              <p className="text-xs mt-1">This project is marked as delivered</p>
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center space-x-2">
                <User className="w-5 h-5 text-cyan-400" />
                <span>Edit Profile</span>
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const res = await fetch('/api/freelancers/update-profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        freelancerId: user?.id,
                        ...profileForm,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setProfileName(data?.freelancer?.display_name || profileName);
                      addToast('Profile updated successfully', 'success');
                      await fetchFreelancerData();
                    } else {
                      const error = await res.json();
                      addToast(error?.error || 'Failed to update profile', 'error');
                    }
                  } catch (err) {
                    console.error(err);
                    addToast('Failed to update profile', 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Display Name *</label>
                  <input
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                    required
                    placeholder="Your name"
                  />
        </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Headline</label>
                  <input
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    placeholder="e.g., Senior Web Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Title</label>
                  <input
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    placeholder="Your professional title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2 flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Country</span>
                  </label>
                  <input
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                    placeholder="Your country"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Bio</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40 resize-none"
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="A short bio about yourself"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40 resize-none"
                    rows={4}
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                    placeholder="A detailed description of your skills and experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Skills (comma separated)</label>
                  <input
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                    placeholder="React, TypeScript, Node.js"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hourly Rate (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                    value={profileForm.hourly_rate_cents ? (Number(profileForm.hourly_rate_cents) / 100).toFixed(2) : ''}
                    onChange={(e) => setProfileForm({ ...profileForm, hourly_rate_cents: String(Math.round(Number(e.target.value) * 100)) })}
                    placeholder="50.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* KYC Documents Section */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  <span>KYC Documents & Verification</span>
                </h3>
                <p className="text-sm text-white/70 mb-6">
                  Upload your identity documents for verification. Required documents: ID Card/Passport/Driver's License + Proof of Address.
                </p>

                {/* Upload Form */}
                <div className="bg-black/30 rounded-lg border border-white/10 p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Document Type *</label>
                      <select
                        value={kycUploadForm.documentType}
                        onChange={(e) => setKycUploadForm({ ...kycUploadForm, documentType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                      >
                        <option value="">Select type</option>
                        <option value="id_card">ID Card</option>
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="proof_of_address">Proof of Address</option>
                        <option value="tax_id">Tax ID</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Document Name</label>
                      <input
                        type="text"
                        value={kycUploadForm.documentName}
                        onChange={(e) => setKycUploadForm({ ...kycUploadForm, documentName: e.target.value })}
                        className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                        placeholder="Optional: Document name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">File *</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setKycUploadForm({ ...kycUploadForm, file: e.target.files?.[0] || null })}
                        className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                      />
                    </div>
                  </div>
                  <button
                    onClick={uploadKycDocument}
                    disabled={uploadingKyc || !kycUploadForm.documentType || !kycUploadForm.file}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    {uploadingKyc ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Document</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Existing Documents */}
                {kycDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kycDocuments.map((doc: any) => {
                      const docTypeLabels: Record<string, string> = {
                        'id_card': 'ID Card',
                        'passport': 'Passport',
                        'drivers_license': "Driver's License",
                        'proof_of_address': 'Proof of Address',
                        'tax_id': 'Tax ID',
                        'other': 'Other'
                      };
                      const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                        'pending': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400/30' },
                        'approved': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-400/30' },
                        'rejected': { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-400/30' },
                      };
                      const statusConfig = statusColors[doc.status] || statusColors.pending;
                      const fileUrl = doc.file_path.startsWith('http') ? doc.file_path : `/${doc.file_path.replace(/^\/+/, '')}`;
                      
                      return (
                        <div
                          key={doc.id}
                          className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-text-base">
                                  {docTypeLabels[doc.document_type] || doc.document_type}
                                </span>
                                {(['id_card', 'passport', 'drivers_license', 'proof_of_address'].includes(doc.document_type)) && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                                    Required
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                  {doc.status}
                                </span>
                              </div>
                              <p className="text-xs text-white/70 truncate mb-1">{doc.document_name}</p>
                              {doc.file_size && (
                                <p className="text-xs text-white/50">
                                  {(doc.file_size / 1024).toFixed(1)} KB
                                </p>
                              )}
                              {doc.rejection_reason && (
                                <p className="text-xs text-rose-300 mt-2 italic">
                                  Rejected: {doc.rejection_reason}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-2">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/10 text-text-base hover:bg-white/15 transition text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View
                              </a>
                              <a
                                href={fileUrl}
                                download
                                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/10 text-text-base hover:bg-white/15 transition text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                Download
                              </a>
                              <button
                                onClick={() => startEditKycDocument(doc)}
                                className="px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 transition text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteKycDocument(doc.id)}
                                disabled={deletingKycDoc === doc.id}
                                className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingKycDoc === doc.id ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin"></div>
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <p className="text-sm">No KYC documents uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Edit KYC Document Modal */}
              {editingKycDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                  <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-gradient-to-br from-[#0B0D12] via-[#0F1419] to-[#0B0D12] backdrop-blur-xl shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Edit Document</h3>
                      <button
                        onClick={cancelEditKycDocument}
                        className="text-white/50 hover:text-white transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Document Name
                        </label>
                        <input
                          type="text"
                          value={kycEditForm.documentName}
                          onChange={(e) => setKycEditForm({ ...kycEditForm, documentName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                          placeholder="Document name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Replace File (Optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setKycEditForm({ ...kycEditForm, file: e.target.files?.[0] || null })}
                          className="w-full px-4 py-2.5 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                        />
                        <p className="text-xs text-white/50 mt-1">
                          Leave empty to keep current file. Uploading a new file will reset status to pending.
                        </p>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={cancelEditKycDocument}
                          className="flex-1 px-4 py-2 border border-white/10 bg-white/5 text-white rounded-lg hover:bg-white/10 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={updateKycDocument}
                          disabled={uploadingKyc || (!kycEditForm.documentName && !kycEditForm.file)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                          {uploadingKyc ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Milestone Creation Modal */}
          {creatingMilestone && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0B0D12] border border-white/10 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Create Milestone</h3>
                  <button
                    onClick={() => {
                      setCreatingMilestone(false);
                      setMilestoneForm({ projectId: '', title: '', description: '', amount: '', dueDate: '' });
                    }}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Title *</label>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                      placeholder="e.g., Initial Setup & Planning"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                    <textarea
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40 resize-none"
                      rows={3}
                      placeholder="Describe what this milestone includes..."
                    />
                    <p className="text-xs text-white/50 mt-1">Note: Cannot include email, phone, or price information</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={milestoneForm.dueDate}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setCreatingMilestone(false);
                        setMilestoneForm({ projectId: '', title: '', description: '', amount: '', dueDate: '' });
                      }}
                      className="flex-1 px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createMilestone}
                      disabled={saving || !milestoneForm.title.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Creating...' : 'Create Milestone'}
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
