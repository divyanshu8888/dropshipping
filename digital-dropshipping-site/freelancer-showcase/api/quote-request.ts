import { NextApiRequest, NextApiResponse } from 'next'
import { QuoteRequest } from '../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const data: QuoteRequest = req.body

    // Validate required fields
    if (!data.name || !data.email || !data.project_type || !data.budget_range || !data.timeline || !data.description) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'email', 'project_type', 'budget_range', 'timeline', 'description']
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // TODO: Send email to admin with quote request details
    // TODO: Store quote request in database for tracking
    // TODO: Send confirmation email to client

    console.log('Quote request received:', {
      name: data.name,
      email: data.email,
      project_type: data.project_type,
      budget_range: data.budget_range,
      timeline: data.timeline,
      description: data.description,
      preferred_skills: data.preferred_skills
    })

    return res.status(201).json({ 
      success: true, 
      message: 'Quote request submitted successfully. We\'ll get back to you within 24 hours.'
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
