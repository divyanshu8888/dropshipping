import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import { FreelancerPublic } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { country, skills, limit = '20', offset = '0' } = req.query

    let query = supabase
      .from('freelancers_public')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by country if provided
    if (country && typeof country === 'string') {
      query = query.eq('country', country)
    }

    // Filter by skills if provided
    if (skills && typeof skills === 'string') {
      const skillsArray = skills.split(',').map(s => s.trim())
      query = query.overlaps('skills', skillsArray)
    }

    // Apply pagination
    const limitNum = parseInt(limit as string, 10)
    const offsetNum = parseInt(offset as string, 10)
    query = query.range(offsetNum, offsetNum + limitNum - 1)

    const { data: freelancers, error } = await query

    if (error) {
      console.error('Error fetching freelancers:', error)
      return res.status(500).json({ error: 'Failed to fetch freelancers' })
    }

    return res.status(200).json({
      freelancers: freelancers as FreelancerPublic[],
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: freelancers?.length === limitNum
      }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
