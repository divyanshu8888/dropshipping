import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../src/components/Header';
import ChatSystem from '../../src/components/ChatSystem';
import { createClient } from '@supabase/supabase-js';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  client_id: string;
  freelancer_id: string;
  budget: number;
  start_date: string;
  end_date: string;
  milestones: any[];
  client_name: string;
  freelancer_name: string;
}

interface ProjectPageProps {}

const ProjectPage: React.FC<ProjectPageProps> = () => {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check authentication and load project
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check user authentication
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }
        
        const userObj = JSON.parse(userData);
        setUser(userObj);

        if (!id) return;

        // Load project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            client:users!projects_client_id_fkey(name),
            freelancer:freelancers!projects_freelancer_id_fkey(
              user:users!freelancers_user_id_fkey(name)
            )
          `)
          .eq('id', id)
          .single();

        if (projectError) throw projectError;

        setProject({
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          status: projectData.status,
          client_id: projectData.client_id,
          freelancer_id: projectData.freelancer_id,
          budget: projectData.budget,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          milestones: projectData.milestones || [],
          client_name: projectData.client?.name || 'Unknown Client',
          freelancer_name: projectData.freelancer?.user?.name || 'Unknown Freelancer'
        });

        // Check if user is part of this project
        if (userObj.role !== 'admin' && 
            projectData.client_id !== userObj.id && 
            projectData.freelancer_id !== userObj.id) {
          router.push('/');
          return;
        }

        // Load or create conversation
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('project_id', id)
          .single();

        if (conversationError && conversationError.code === 'PGRST116') {
          // Create new conversation
          const { data: newConversation, error: createError } = await supabase.rpc('create_conversation', {
            p_title: `Project: ${projectData.title}`,
            p_project_id: id,
            p_participants: [projectData.client_id, projectData.freelancer_id]
          });

          if (createError) throw createError;
          setConversationId(newConversation.conversation_id);
        } else if (conversationData) {
          setConversationId(conversationData.id);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, router, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="flex items-center justify-center h-96 pt-28">
          <div className="text-red-600">Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>{project.title} - Project Details</title>
        <meta name="description" content={`Project details for ${project.title}`} />
      </Head>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Client</h3>
              <p className="text-gray-600">{project.client_name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Freelancer</h3>
              <p className="text-gray-600">{project.freelancer_name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Budget</h3>
              <p className="text-gray-600">${project.budget?.toLocaleString() || 'TBD'}</p>
            </div>
          </div>

          {project.start_date && project.end_date && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                <p className="text-gray-600">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
                <p className="text-gray-600">{new Date(project.end_date).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Milestones */}
        {project.milestones && project.milestones.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Milestones</h2>
            <div className="space-y-4">
              {project.milestones.map((milestone: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                      milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {milestone.status || 'Pending'}
                    </span>
                  </div>
                  {milestone.due_date && (
                    <p className="text-sm text-gray-500 mt-2">
                      Due: {new Date(milestone.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat System */}
        {conversationId && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Communication</h2>
            <div className="h-96">
              <ChatSystem
                conversationId={conversationId}
                userId={user?.id}
                isAdmin={user?.role === 'admin'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
