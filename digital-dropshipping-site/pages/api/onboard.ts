import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../src/lib/supabase'
import { FreelancerOnboardingData } from '../../../src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data: FreelancerOnboardingData = req.body

    // Validate required fields
    if (!data.display_name || !data.bio || !data.country || !data.skills || !data.base_fee || !data.contact_email) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['display_name', 'bio', 'country', 'skills', 'base_fee', 'contact_email']
      })
    }

    // Validate skills array
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      return res.status(400).json({ error: 'Skills must be a non-empty array' })
    }

    // Validate base_fee (should be positive)
    if (data.base_fee <= 0) {
      return res.status(400).json({ error: 'Base fee must be greater than 0' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.contact_email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Insert freelancer data
    const { data: freelancer, error } = await supabaseAdmin
      .from('freelancers')
      .insert([{
        display_name: data.display_name,
        bio: data.bio,
        country: data.country,
        skills: data.skills,
        base_fee: data.base_fee,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        status: 'pending'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error inserting freelancer:', error)
      return res.status(500).json({ error: 'Failed to submit application' })
    }

    // TODO: Send notification email to admin
    // TODO: Send confirmation email to freelancer

    return res.status(201).json({ 
      success: true, 
      message: 'Application submitted successfully',
      freelancer_id: freelancer.id
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
