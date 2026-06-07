import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from '../../../src/lib/mysql';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);

const getServiceId = async (title: string, category?: string) => {
  const categorySlug = category ? slugify(category) : null;

  const existing = await queryOne<{ id: number }>(
    `SELECT s.id
     FROM services s
     LEFT JOIN categories c ON c.id = s.category_id
     WHERE s.slug = ? OR s.name = ? OR c.slug = ? OR c.name = ?
     ORDER BY s.display_order ASC
     LIMIT 1`,
    [slugify(title), title, categorySlug, category || null]
  );

  if (existing) return existing.id;

  const result = await query(
    `INSERT INTO services (name, slug, short_description, currency, is_active, created_at, updated_at)
     VALUES (?, ?, ?, 'AUD', 'TRUE', NOW(), NOW())`,
    [category || title, slugify(category || title), `Custom ${category || title} service`]
  );

  return (result as any).insertId as number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { freelancer_id, category } = req.query;
    const params: Array<string | number> = [];
    const conditions = ["sl.status != 'archived'"];

    if (freelancer_id) {
      conditions.push('sl.freelancer_id = ?');
      params.push(Number(Array.isArray(freelancer_id) ? freelancer_id[0] : freelancer_id));
    }

    if (category) {
      conditions.push('(c.name = ? OR c.slug = ? OR s.name = ? OR s.slug = ?)');
      const value = Array.isArray(category) ? category[0] : category;
      params.push(value, value, value, value);
    }

    const services = await query(
      `SELECT
        sl.*,
        s.name AS service_name,
        s.slug AS service_slug,
        c.name AS category_name,
        f.display_name AS freelancer_name,
        f.status AS freelancer_status
       FROM service_listings sl
       JOIN services s ON s.id = sl.service_id
       LEFT JOIN categories c ON c.id = s.category_id
       JOIN freelancers f ON f.id = sl.freelancer_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY sl.created_at DESC`,
      params
    );

    return res.status(200).json({ services });
  } catch (error) {
    console.error('Error fetching freelancer services:', error);
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { freelancer_id, title, description, price, category, delivery_time } = req.body;

    if (!freelancer_id || !title || !description || !price || !category || !delivery_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const freelancer = await queryOne<{ id: number }>('SELECT id FROM freelancers WHERE id = ? LIMIT 1', [
      Number(freelancer_id),
    ]);

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    const serviceId = await getServiceId(title, category);
    const listingSlug = `${slugify(title)}-${freelancer.id}-${Date.now()}`;
    const result = await query(
      `INSERT INTO service_listings
        (freelancer_id, service_id, slug, title, summary, description, base_price_cents, currency, delivery_days, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'AUD', ?, 'draft', NOW(), NOW())`,
      [
        freelancer.id,
        serviceId,
        listingSlug,
        title,
        String(description).slice(0, 500),
        description,
        Math.round(Number(price) * 100),
        Number(delivery_time),
      ]
    );

    const service = await queryOne('SELECT * FROM service_listings WHERE id = ? LIMIT 1', [(result as any).insertId]);

    return res.status(201).json({
      success: true,
      message: 'Service created successfully!',
      service,
    });
  } catch (error) {
    console.error('Error creating freelancer service:', error);
    return res.status(500).json({ error: 'Failed to create service' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, title, description, price, delivery_time, is_active } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    await query(
      `UPDATE service_listings
       SET
        title = COALESCE(?, title),
        summary = COALESCE(?, summary),
        description = COALESCE(?, description),
        base_price_cents = COALESCE(?, base_price_cents),
        delivery_days = COALESCE(?, delivery_days),
        status = COALESCE(?, status),
        updated_at = NOW()
       WHERE id = ?`,
      [
        title ?? null,
        description ? String(description).slice(0, 500) : null,
        description ?? null,
        price !== undefined ? Math.round(Number(price) * 100) : null,
        delivery_time !== undefined ? Number(delivery_time) : null,
        is_active === undefined ? null : is_active ? 'active' : 'paused',
        Number(id),
      ]
    );

    const service = await queryOne('SELECT * FROM service_listings WHERE id = ? LIMIT 1', [Number(id)]);

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully!',
      service,
    });
  } catch (error) {
    console.error('Error updating freelancer service:', error);
    return res.status(500).json({ error: 'Failed to update service' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const listingId = Array.isArray(id) ? id[0] : id;

    if (!listingId) {
      return res.status(400).json({ error: 'Service ID is required' });
    }

    await query(`UPDATE service_listings SET status = 'archived', updated_at = NOW() WHERE id = ?`, [
      Number(listingId),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Service deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting freelancer service:', error);
    return res.status(500).json({ error: 'Failed to delete service' });
  }
}
