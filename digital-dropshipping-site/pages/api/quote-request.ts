import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      projectTitle,
      projectDescription,
      budget,
      timeline,
      category,
      notes
    } = req.body;

    // Validate required fields
    if (!clientName || !clientEmail || !projectTitle || !projectDescription || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: clientName, clientEmail, projectTitle, projectDescription, category' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Create quote request in Supabase
    const { data: quoteRequest, error } = await supabaseAdmin
      .from('quote_requests')
      .insert({
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
        project_title: projectTitle,
        project_description: projectDescription,
        budget: budget || null,
        timeline: timeline || null,
        category,
        notes: notes || null,
        status: 'pending',
        priority: 'medium'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        message: 'Failed to save quote request to database',
        error: error.message 
      });
    }

    // Log the submission for admin notification
    console.log('New quote request submitted:', {
      id: quoteRequest.id,
      clientName,
      clientEmail,
      projectTitle,
      category,
      budget,
      timeline
    });

    res.status(201).json({
      message: 'Quote request submitted successfully',
      quoteRequest: {
        id: quoteRequest.id,
        status: quoteRequest.status,
        createdAt: quoteRequest.created_at
      }
    });

  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({ 
      message: 'Failed to submit quote request',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}