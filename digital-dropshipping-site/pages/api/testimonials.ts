import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../src/lib/mysql';

/**
 * API endpoint to check testimonials in database
 * GET /api/testimonials
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all testimonials
    const testimonials = await query(`
      SELECT 
        id,
        client_name,
        client_title,
        client_company,
        content,
        rating,
        is_featured,
        is_active,
        client_image_url,
        created_at,
        updated_at
      FROM testimonials
      ORDER BY created_at DESC
    `);

    // Get count
    const countResult = await query<{ count: number | string }>(`
      SELECT COUNT(*) as count FROM testimonials
    `);
    const totalCount = Number(countResult[0]?.count) || 0;

    // Get active count
    const activeCountResult = await query<{ count: number | string }>(`
      SELECT COUNT(*) as count FROM testimonials WHERE is_active = 'TRUE'
    `);
    const activeCount = Number(activeCountResult[0]?.count) || 0;

    // Serialize dates
    const serialized = testimonials.map((t: any) => ({
      ...t,
      created_at: t.created_at instanceof Date 
        ? t.created_at.toISOString() 
        : String(t.created_at || ''),
      updated_at: t.updated_at instanceof Date 
        ? t.updated_at.toISOString() 
        : String(t.updated_at || ''),
      rating: Number(t.rating) || null,
      id: Number(t.id) || t.id
    }));

    return res.status(200).json({
      success: true,
      total: totalCount,
      active: activeCount,
      testimonials: serialized
    });
  } catch (error: any) {
    console.error('Error fetching testimonials:', error);
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(200).json({
        success: false,
        error: 'Testimonials table does not exist',
        message: 'Please run the SQL file: database/mysql/39-testimonials.sql',
        total: 0,
        active: 0,
        testimonials: []
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      total: 0,
      active: 0,
      testimonials: []
    });
  }
}

