import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../../lib/supabase'
import { Freelancer } from '../../../types'

// This is a simplified admin API - in production, you'd want proper authentication
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Add proper admin authentication check
  // const isAdmin = await checkAdminAuth(req)
  // if (!isAdmin) {
  //   return res.status(401).json({ error: 'Unauthorized' })
  // }

  if (req.method === 'GET') {
    try {
      const { status, limit = '50', offset = '0' } = req.query

      let query = supabaseAdmin
        .from('freelancers')
        .select('*')
        .order('created_at', { ascending: false })

      if (status && typeof status === 'string') {
        query = query.eq('status', status)
      }

      const limitNum = parseInt(limit as string, 10)
      const offsetNum = parseInt(offset as string, 10)
      query = query.range(offsetNum, offsetNum + limitNum - 1)

      const { data: freelancers, error } = await query

      if (error) {
        console.error('Error fetching freelancers:', error)
        return res.status(500).json({ error: 'Failed to fetch freelancers' })
      }

      return res.status(200).json({
        freelancers: freelancers as Freelancer[],
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

  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body

      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields: id, status' })
      }

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected' })
      }

      const { data: freelancer, error } = await supabaseAdmin
        .from('freelancers')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating freelancer:', error)
        return res.status(500).json({ error: 'Failed to update freelancer' })
      }

      // TODO: Send notification email to freelancer about status change

      return res.status(200).json({
        success: true,
        freelancer: freelancer as Freelancer
      })

    } catch (error) {
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
