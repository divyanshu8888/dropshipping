import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../src/lib/supabase-admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { freelancer_id, client_name, client_email, client_company, project_type, budget_range, timeline, description, preferred_skills } = req.body

    // Validate required fields
    if (!client_name || !client_email || !project_type || !budget_range || !timeline || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(client_email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Insert quote request using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('quote_requests')
      .insert([{
        freelancer_id: freelancer_id || null,
        client_name,
        client_email,
        client_company: client_company || null,
        project_title: project_type,
        project_description: description,
        budget_range,
        timeline,
        preferred_skills: preferred_skills || [],
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting quote request:', error)
      return res.status(500).json({ error: 'Failed to submit quote request' })
    }

    // Log the quote request for admin tracking
    console.log('✅ NEW QUOTE REQUEST SUBMITTED:', {
      id: data.id,
      client_name,
      client_email,
      project_type,
      budget_range,
      timeline,
      freelancer_id: freelancer_id || 'General Request'
    })

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to client

    return res.status(201).json({ 
      success: true, 
      message: 'Quote request submitted successfully! We\'ll get back to you within 24 hours.',
      quote_id: data.id
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}