import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../src/lib/supabase-admin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { freelancer_id, category } = req.query

      let query = supabaseAdmin
        .from('freelancer_services')
        .select(`
          *,
          freelancers!inner(
            id,
            display_name,
            status
          )
        `)
        .eq('is_active', true)

      if (freelancer_id) {
        query = query.eq('freelancer_id', freelancer_id)
      }

      if (category) {
        query = query.eq('category', category)
      }

      // Only show services for approved freelancers
      query = query.eq('freelancers.status', 'approved')

      const { data: services, error } = await query

      if (error) {
        console.error('Error fetching freelancer services:', error)
        return res.status(500).json({ error: 'Failed to fetch services' })
      }

      return res.status(200).json({ services })

    } catch (error) {
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { freelancer_id, title, description, price, category, delivery_time } = req.body

      // Validate required fields
      if (!freelancer_id || !title || !description || !price || !category || !delivery_time) {
        return res.status(400).json({ 
          error: 'Missing required fields'
        })
      }

      // Insert freelancer service using admin client to bypass RLS
      const { data, error } = await supabaseAdmin
        .from('freelancer_services')
        .insert([{
          freelancer_id,
          title,
          description,
          price: Math.round(price * 100), // Convert to cents
          category,
          delivery_time,
          is_active: true
        }])
        .select()
        .single()

      if (error) {
        console.error('Error inserting freelancer service:', error)
        return res.status(500).json({ error: 'Failed to create service' })
      }

      return res.status(201).json({ 
        success: true, 
        message: 'Service created successfully!',
        service: data
      })

    } catch (error) {
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, title, description, price, category, delivery_time, is_active } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Service ID is required' })
      }

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (price !== undefined) updateData.price = Math.round(price * 100)
      if (category !== undefined) updateData.category = category
      if (delivery_time !== undefined) updateData.delivery_time = delivery_time
      if (is_active !== undefined) updateData.is_active = is_active

      const { data, error } = await supabaseAdmin
        .from('freelancer_services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating freelancer service:', error)
        return res.status(500).json({ error: 'Failed to update service' })
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Service updated successfully!',
        service: data
      })

    } catch (error) {
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Service ID is required' })
      }

      const { error } = await supabaseAdmin
        .from('freelancer_services')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting freelancer service:', error)
        return res.status(500).json({ error: 'Failed to delete service' })
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Service deleted successfully!'
      })

    } catch (error) {
      console.error('Unexpected error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
