import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { status, page = '1', limit = '10' } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Build the query
      let query = supabaseAdmin
        .from('quote_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status as string);
      }

      // Add pagination
      query = query.range(offset, offset + limitNum - 1);

      const { data: quoteRequests, error, count } = await query;

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          message: 'Failed to fetch quote requests',
          error: error.message 
        });
      }

      res.status(200).json({
        quoteRequests: quoteRequests || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          pages: Math.ceil((count || 0) / limitNum)
        }
      });

    } catch (error) {
      console.error('Error fetching quote requests:', error);
      res.status(500).json({ 
        message: 'Failed to fetch quote requests',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { id, status, admin_notes, assigned_to, priority } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'Quote request ID is required' });
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
      if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
      if (priority) updateData.priority = priority;

      const { data: updatedQuoteRequest, error } = await supabaseAdmin
        .from('quote_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ 
          message: 'Failed to update quote request',
          error: error.message 
        });
      }

      res.status(200).json({
        message: 'Quote request updated successfully',
        quoteRequest: updatedQuoteRequest
      });

    } catch (error) {
      console.error('Error updating quote request:', error);
      res.status(500).json({ 
        message: 'Failed to update quote request',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
