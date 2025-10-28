import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { projectId, progress } = req.body;

    if (!projectId || progress === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update project progress
    const { data: project, error } = await supabase
      .from('projects')
      .update({
        progress: Math.min(Math.max(progress, 0), 100),
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // If progress reaches 100%, update status to review
    if (progress >= 100) {
      await supabase
        .from('projects')
        .update({ status: 'review' })
        .eq('id', projectId);
    }

    return res.status(200).json({
      success: true,
      project: project
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return res.status(500).json({
      error: 'Failed to update progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
