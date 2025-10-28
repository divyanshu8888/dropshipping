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
    const { projectId, content, sender } = req.body;

    if (!projectId || !content || !sender) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert new message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        project_id: projectId,
        sender: sender,
        content: content,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
