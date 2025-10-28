import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { freelancerId } = req.query;

    if (!freelancerId) {
      return res.status(400).json({ error: 'Freelancer ID is required' });
    }

    // Fetch projects assigned to this freelancer
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        budget,
        deadline,
        status,
        progress,
        created_at,
        clients:client_id (
          contact_name,
          email
        ),
        messages (
          id,
          sender,
          content,
          timestamp,
          attachments
        ),
        deliverables (
          id,
          name,
          type,
          url,
          uploaded_at,
          description
        )
      `)
      .eq('freelancer_id', freelancerId)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Database error:', projectsError);
      throw projectsError;
    }

    // Transform the data to match the expected format
    const transformedProjects = projects?.map(project => ({
      id: project.id,
      title: project.title,
      client: project.clients?.contact_name || 'Unknown Client',
      clientEmail: project.clients?.email || '',
      status: project.status,
      budget: project.budget,
      deadline: project.deadline,
      description: project.description,
      createdAt: project.created_at,
      progress: project.progress || 0,
      messages: project.messages || [],
      deliverables: project.deliverables || []
    })) || [];

    return res.status(200).json({
      success: true,
      projects: transformedProjects
    });

  } catch (error) {
    console.error('Error fetching freelancer projects:', error);
    return res.status(500).json({
      error: 'Failed to fetch freelancer projects',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
