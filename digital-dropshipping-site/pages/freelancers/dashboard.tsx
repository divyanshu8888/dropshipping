import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Header from '../../src/components/Header';
import { useAuth } from '../../src/contexts/AuthContext';
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
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const { user, isFreelancer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [availability, setAvailability] = useState<Availability>({
    isAvailable: true,
    workingHours: '9 AM - 6 PM',
    timezone: 'UTC'
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (!user || !isFreelancer()) {
      router.push('/login');
      return;
    }
    
    fetchFreelancerData();
    setLoading(false);
  }, [user, router]);

  const fetchFreelancerData = async () => {
    try {
      // Fetch projects assigned to this freelancer
      const projectsResponse = await fetch(`/api/freelancers/projects/${user?.id}`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }

      // Fetch availability settings
      const availabilityResponse = await fetch(`/api/freelancers/availability/${user?.id}`);
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        setAvailability(availabilityData.availability || availability);
      }
    } catch (error) {
      console.error('Error fetching freelancer data:', error);
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

  const updateAvailability = async () => {
    try {
      const response = await fetch('/api/freelancers/update-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freelancerId: user?.id, 
          availability 
        })
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  availability.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {availability.isAvailable ? 'Available' : 'Busy'}
                </div>
                <button
                  onClick={() => setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview', icon: TrendingUp },
                  { id: 'projects', label: 'Projects', icon: FileText },
                  { id: 'messages', label: 'Messages', icon: MessageCircle },
                  { id: 'availability', label: 'Availability', icon: Calendar },
                  { id: 'deliverables', label: 'Deliverables', icon: Upload }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${projects.reduce((sum, p) => sum + (p.status === 'completed' ? p.budget : 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === 'pending_approval').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">4.8</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Projects</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {projects.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600">Projects assigned by admins will appear here</p>
                  </div>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Client: {project.client}</span>
                            <span>Budget: ${project.budget}</span>
                            <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                          {project.status === 'in_progress' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                          >
                            View Details
                          </button>
                          {project.status === 'in_progress' && (
                            <button
                              onClick={() => updateProjectProgress(project.id, Math.min(project.progress + 10, 100))}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
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
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Projects with Messages</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {projects.filter(p => p.messages && p.messages.length > 0).map(project => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className={`w-full p-4 text-left hover:bg-gray-50 ${
                        selectedProject?.id === project.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {project.messages.length} messages
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(project.messages[project.messages.length - 1]?.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
                {selectedProject ? (
                  <>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Chat with {selectedProject.client}
                      </h2>
                      <p className="text-sm text-gray-600">{selectedProject.title}</p>
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
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender === 'freelancer' ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedProject.id)}
                        />
                        <button
                          onClick={() => sendMessage(selectedProject.id)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a project</h3>
                      <p className="text-gray-600">Choose a project to view messages</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Status</h3>
                    <p className="text-sm text-gray-600">Whether you're available for new projects</p>
                  </div>
                  <button
                    onClick={() => setAvailability(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      availability.isAvailable ? 'bg-indigo-600' : 'bg-gray-200'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={availability.workingHours}
                    onChange={(e) => setAvailability(prev => ({ ...prev, workingHours: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={availability.timezone}
                    onChange={(e) => setAvailability(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="GMT">GMT</option>
                  </select>
                </div>

                <button
                  onClick={updateAvailability}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deliverables' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Project Deliverables</h2>
              </div>
              <div className="p-6">
                {projects.filter(p => p.deliverables && p.deliverables.length > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deliverables yet</h3>
                    <p className="text-gray-600">Upload files and code for your projects</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map(project => (
                      project.deliverables && project.deliverables.length > 0 && (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-3">{project.title}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.deliverables.map(deliverable => (
                              <div key={deliverable.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  {deliverable.type === 'code' ? (
                                    <Code className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span className="font-medium text-gray-900">{deliverable.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {new Date(deliverable.uploadedAt).toLocaleDateString()}
                                  </span>
                                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
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
        </div>
      </div>
    </>
  );
}