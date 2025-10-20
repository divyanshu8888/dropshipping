import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../src/lib/supabase'
import { FreelancerPublic, PortfolioItemPublic } from '../../src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid freelancer ID' })
    }

    // Get freelancer details
    const { data: freelancer, error: freelancerError } = await supabase
      .from('freelancers_public')
      .select('*')
      .eq('id', id)
      .single()

    if (freelancerError || !freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' })
    }

    // Get portfolio items
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio_public')
      .select('*')
      .eq('freelancer_id', id)
      .order('created_at', { ascending: false })

    if (portfolioError) {
      console.error('Error fetching portfolio:', portfolioError)
      return res.status(500).json({ error: 'Failed to fetch portfolio' })
    }

    return res.status(200).json({
      freelancer: freelancer as FreelancerPublic,
      portfolio: portfolio as PortfolioItemPublic[]
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
