import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../src/lib/supabase-admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { display_name, title, bio, description, country, skills, hourly_rate, base_fee, contact_email, contact_phone } = req.body

    // Validate required fields
    if (!display_name || !title || !bio || !description || !country || !skills || !hourly_rate || !base_fee || !contact_email) {
      return res.status(400).json({ 
        error: 'Missing required fields'
      })
    }

    // Insert freelancer using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('freelancers')
      .insert([{
        display_name,
        title,
        bio,
        description,
        country,
        skills,
        hourly_rate: Math.round(hourly_rate * 100), // Convert to cents
        base_fee: Math.round(base_fee * 100), // Convert to cents
        contact_email,
        contact_phone: contact_phone || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting freelancer:', error)
      return res.status(500).json({ error: 'Failed to submit application' })
    }

    return res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully! We\'ll review it within 48 hours.',
      freelancer_id: data.id
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
