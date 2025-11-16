import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  X
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  client: string;
  clientEmail: string;
  status: 'pending_approval' | 'approved' | 'in_progress' | 'review' | 'completed';
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
}

interface Deliverable {
  id: string;
  name: string;
  type: 'code' | 'document' | 'image' | 'video';
  url: string;
  uploadedAt: string;
  description: string;
}

interface Availability {
  isAvailable: boolean;
  workingHours: string;
  timezone: string;
  nextAvailableDate?: string;
  workingHoursFrom?: string;
  workingHoursTo?: string;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, isFreelancer } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
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
    skills: '' as string, // comma separated
    hourly_rate_cents: '' as string,
    availability: '',
  });
  const [availability, setAvailability] = useState<Availability>({
    isAvailable: true,
    workingHours: '9 AM - 6 PM',
    timezone: 'UTC',
    nextAvailableDate: '',
    workingHoursFrom: '',
    workingHoursTo: ''
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  // Refs to trigger native pickers
  const nextDateRef = useRef<HTMLInputElement | null>(null);
  const timeFromRef = useRef<HTMLInputElement | null>(null);
  const timeToRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    if (!user || !isFreelancer()) {
      router.push('/login');
      return;
    }

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
  }, [user, router, isFreelancer]);

  const fetchFreelancerData = async (signal?: AbortSignal) => {
    setError(null);
    try {
      const results = await Promise.allSettled([
        fetch(`/api/freelancers/projects/${user?.id}`, { signal }),
        fetch(`/api/freelancers/availability/${user?.id}`, { signal }),
        fetch(`/api/freelancers/me?userId=${user?.id}`, { signal })
      ]);

      // Projects
      const projectsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      if (projectsRes && projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } else if (projectsRes && !projectsRes.ok) {
        setProjects([]);
      }

      // Availability
      const availRes = results[1].status === 'fulfilled' ? results[1].value : null;
      if (availRes && availRes.ok) {
        const data = await availRes.json();
        if (data?.availability) {
          setAvailability(prev => ({ ...prev, ...data.availability }));
        }
      }

      // Profile summary (rating)
      const profileRes = results[2].status === 'fulfilled' ? results[2].value : null;
      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        if (data?.profile) {
          if (data.profile.name) setProfileName(data.profile.name);
          setRating(typeof data.profile.rating === 'number' ? data.profile.rating : null);
          setTotalReviews(typeof data.profile.totalReviews === 'number' ? data.profile.totalReviews : null);
          // Initialize profile form with known fields if present
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
    } catch (e: any) {
      if (e?.name === 'AbortError') return;
      console.error('Error fetching freelancer data:', e);
      setError('Unable to load your dashboard right now. Please try again shortly.');
    }
  };

  const sendMessage = async (projectId: string) => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/freelancers/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          content: newMessage,
          sender: 'freelancer'
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchFreelancerData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
        fetchFreelancerData(); // Refresh data
      }
    } catch (error) {
      console.error('Error uploading file:', error);
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
        fetchFreelancerData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Debounced availability save
  const updateAvailability = useCallback(async () => {
    try {
      const controller = new AbortController();
      const id = window.setTimeout(async () => {
        await fetch('/api/freelancers/update-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            freelancerId: user?.id,
            availability
          }),
          signal: controller.signal
        });
      }, 300);
      return () => window.clearTimeout(id);
    } catch (err) {
      console.error('Error updating availability:', err);
    }
  }, [availability, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/20 border-t-white/70 mx-auto"></div>
          <p className="mt-3 text-white/70">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Head>
        <title>Freelancer Dashboard - Uniti</title>
        <meta name="description" content="Manage your projects, communicate with clients, and track your progress" />
      </Head>

      <div className="min-h-screen bg-[#0B0D10] text-white">
        <Header />

        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
                <p className="text-white/70">Welcome back, {displayName}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  availability.isAvailable ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/20' : 'bg-rose-500/15 text-rose-300 border border-rose-400/20'
                }`}>
                  {availability.isAvailable ? 'Available' : 'Busy'}
                </div>
                <button
                  onClick={() => {
                    setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
                    updateAvailability();
                  }}
                  className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
              {error}
            </div>
          )}
          {/* Navigation Tabs */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur mb-8">
            <div className="border-b border-white/10">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'projects', label: 'Projects', icon: FileText },
                  { id: 'messages', label: 'Messages', icon: MessageCircle },
                  { id: 'availability', label: 'Availability', icon: Calendar },
                  { id: 'deliverables', label: 'Deliverables', icon: Upload },
                  { id: 'profile', label: 'Profile', icon: User }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
                    <FileText className="w-6 h-6 text-cyan-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Active Projects</p>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-teal-500/10">
                    <DollarSign className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Total Earnings</p>
                    <p className="text-2xl font-bold">
                      ${projects.reduce((sum, p) => sum + (p.status === 'completed' ? p.budget : 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/10">
                    <Clock className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Pending Approval</p>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'pending_approval').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10">
                    <Star className="w-6 h-6 text-fuchsia-300" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-white/70">Rating</p>
                    <p className="text-2xl font-bold">
                      {(totalReviews ?? 0) === 0
                        ? '0'
                        : rating !== null
                        ? rating.toFixed(1)
                        : '0'}
                    </p>
                    {totalReviews !== null && (
                      <p className="text-xs text-white/60">{totalReviews} reviews</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Your Projects</h2>
              </div>
              <div className="divide-y divide-white/10">
                {projects.length === 0 ? (
                  <div className="p-8 text-center text-white/70">
                    <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                    <p>Projects assigned by admins will appear here</p>
                  </div>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="p-6 hover:bg-white/5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <p className="text-white/70 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-white/60">
                            <span>Client: {project.client}</span>
                            <span>Budget: ${project.budget}</span>
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                          {project.status === 'in_progress' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="px-3 py-1 text-sm rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            View Details
                          </button>
                          {project.status === 'in_progress' && (
                            <button
                              onClick={() => updateProjectProgress(project.id, Math.min(project.progress + 10, 100))}
                              className="px-3 py-1 text-sm rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15 transition-colors"
                            >
                              Update Progress
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project List */}
              <div className="rounded-2xl border border-white/10 bg-white/5">
                <div className="px-6 py-4 border-b border-white/10">
                  <h2 className="text-lg font-semibold">Projects with Messages</h2>
                </div>
                <div className="divide-y divide-white/10">
                  {projects.filter(p => p.messages && p.messages.length > 0).map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full p-4 text-left hover:bg-white/5 ${
                        selectedProject?.id === project.id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{project.title}</h3>
                          <p className="text-sm text-white/70">{project.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white/60">
                            {project.messages.length} messages
                          </p>
                          <p className="text-xs text-white/40">
                            {new Date(project.messages[project.messages.length - 1]?.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5">
                {selectedProject ? (
                  <>
                    <div className="px-6 py-4 border-b border-white/10">
                      <h2 className="text-lg font-semibold">
                        Chat with {selectedProject.client}
                      </h2>
                      <p className="text-sm text-white/70">{selectedProject.title}</p>
                    </div>
                    <div className="h-96 overflow-y-auto p-6">
                      {selectedProject.messages.map(message => (
                        <div
                          key={message.id}
                          className={`mb-4 ${message.sender === 'freelancer' ? 'text-right' : 'text-left'}`}
                        >
                          <div
                            className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender === 'freelancer'
                                ? 'bg-cyan-500 text-black'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'freelancer' ? 'text-black/70' : 'text-white/60'
                            }`}>
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-white/10">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-white/40"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedProject.id)}
                        />
                        <button
                          onClick={() => sendMessage(selectedProject.id)}
                          className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a project</h3>
                      <p className="text-white/70">Choose a project to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold mb-6">Availability Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Status</h3>
                    <p className="text-sm text-white/70">Whether you're available for new projects</p>
                  </div>
                  <button
                    onClick={() => setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      availability.isAvailable ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        availability.isAvailable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Next available date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={availability.nextAvailableDate || ''}
                    onChange={(e) => setAvailability(prev => ({ ...prev, nextAvailableDate: e.target.value }))}
                    ref={nextDateRef}
                    onClick={() => (nextDateRef.current as any)?.showPicker?.()}
                    inputMode="none"
                    onKeyDown={(e) => e.preventDefault()}
                    className="w-full pl-11 pr-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-white/40 cursor-pointer caret-transparent"
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
                        onChange={(e) => setAvailability(prev => ({ ...prev, workingHoursFrom: e.target.value }))}
                        ref={timeFromRef}
                        onClick={() => (timeFromRef.current as any)?.showPicker?.()}
                        inputMode="none"
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-full pl-11 pr-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer caret-transparent"
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
                        onChange={(e) => setAvailability(prev => ({ ...prev, workingHoursTo: e.target.value }))}
                        ref={timeToRef}
                        onClick={() => (timeToRef.current as any)?.showPicker?.()}
                        inputMode="none"
                        onKeyDown={(e) => e.preventDefault()}
                        className="w-full pl-11 pr-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer caret-transparent"
                      />
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-white/50">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Timezone
                  </label>
                  <select
                    value={availability.timezone}
                    onChange={(e) => setAvailability(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>

                <button
                  onClick={updateAvailability}
                  className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="rounded-2xl border border-white/10 bg-white/5">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Project Deliverables</h2>
              </div>
              <div className="p-6">
                {projects.filter(p => p.deliverables && p.deliverables.length > 0).length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No deliverables yet</h3>
                    <p>Upload files and code for your projects</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      project.deliverables && project.deliverables.length > 0 && (
                        <div key={project.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                          <h3 className="font-medium mb-3">{project.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.deliverables.map(deliverable => (
                              <div key={deliverable.id} className="border border-white/10 rounded-lg p-3 bg-black/30">
                                <div className="flex items-center space-x-2 mb-2">
                                  {deliverable.type === 'code' ? (
                                    <Code className="w-4 h-4 text-emerald-300" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-cyan-300" />
                                  )}
                                  <span className="font-medium">{deliverable.name}</span>
                                </div>
                                <p className="text-sm text-white/70 mb-2">{deliverable.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-white/50">
                                    {new Date(deliverable.uploadedAt).toLocaleDateString()}
                                  </span>
                                  <button className="text-cyan-300 hover:text-white text-sm">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
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
                      addToast('Profile updated', 'success');
                    } else {
                      addToast('Failed to update profile', 'error');
                    }
                  } catch (err) {
                    console.error(err);
                    addToast('Failed to update profile', 'error');
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Display Name</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Headline</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Title</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Country</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.country}
                    onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={4}
                    value={profileForm.description}
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">Skills (comma separated)</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Hourly Rate (cents)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.hourly_rate_cents}
                    onChange={(e) => setProfileForm({ ...profileForm, hourly_rate_cents: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-1">Availability</label>
                  <input
                    className="w-full px-3 py-2 border border-white/10 bg-black/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}