import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, message, replyTo } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Call the moderation Edge Function first
    const moderationResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/moderate-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
        userId: user.id
      })
    });

    const moderationResult = await moderationResponse.json();

    if (!moderationResult.success) {
      return res.status(400).json({
        error: 'Message blocked',
        reason: moderationResult.reason,
        violations: moderationResult.violations,
        tips: moderationResult.tips
      });
    }

    // If moderation passed, send the message using RPC
    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: conversationId,
      p_body: moderationResult.message,
      p_reply_to: replyTo || null
    });

    if (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    if (!data.success) {
      return res.status(400).json({
        error: 'Message blocked by policy',
        reason: data.reason,
        violations: data.violations
      });
    }

    // Return success
    return res.status(200).json({
      success: true,
      messageId: data.message_id,
      message: data.body,
      violations: data.violations,
      redacted: data.redacted
    });

  } catch (error) {
    console.error('Messages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
