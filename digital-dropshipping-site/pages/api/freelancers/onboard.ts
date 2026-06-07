import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { query, queryOne } from '../../../src/lib/mysql';

export const config = {
  api: {
    bodyParser: false,
  },
};

type FreelancerServiceInput = {
  title: string;
  description: string;
  price: number;
  category: string;
  delivery_time: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);

const firstValue = <T,>(value: T | T[] | undefined): T | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseJsonArray = <T,>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || !value.trim()) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const readJsonBody = (req: NextApiRequest) =>
  new Promise<Record<string, unknown>>((resolve, reject) => {
    const chunks: Buffer[] = [];

    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const parseRequestBody = async (req: NextApiRequest) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    const { fields } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      const form = formidable({ multiples: true, maxFileSize: 25 * 1024 * 1024 });
      form.parse(req, (error, fields, files) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ fields, files });
      });
    });

    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, firstValue(value)])
    ) as Record<string, unknown>;
  }

  return readJsonBody(req);
};

const getServiceId = async (title: string, category: string) => {
  const serviceSlug = slugify(title);
  const categorySlug = slugify(category);
  const existing = await queryOne<{ id: number }>(
    `SELECT s.id
     FROM services s
     LEFT JOIN categories c ON c.id = s.category_id
     WHERE s.slug = ? OR s.name = ? OR c.slug = ? OR c.name = ?
     ORDER BY s.display_order ASC
     LIMIT 1`,
    [serviceSlug, title, categorySlug, category]
  );

  if (existing) return existing.id;

  // INSERT IGNORE handles the race condition where slug already exists
  await query(
    `INSERT IGNORE INTO services (name, slug, short_description, currency, is_active, created_at, updated_at)
     VALUES (?, ?, ?, 'AUD', 'TRUE', NOW(), NOW())`,
    [category, categorySlug, `Custom ${category} service`]
  );

  const inserted = await queryOne<{ id: number }>(
    `SELECT id FROM services WHERE slug = ? LIMIT 1`,
    [categorySlug]
  );

  return inserted!.id;
};

const upsertServiceListings = async (freelancerId: number, services: FreelancerServiceInput[]) => {
  for (const service of services) {
    if (!service.title || !service.description || !service.category) continue;

    const serviceId = await getServiceId(service.title, service.category);
    const baseSlug = `${slugify(service.title)}-${freelancerId}`;
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM service_listings WHERE freelancer_id = ? AND slug = ? LIMIT 1',
      [freelancerId, baseSlug]
    );

    if (existing) {
      await query(
        `UPDATE service_listings
         SET service_id = ?, title = ?, summary = ?, description = ?, base_price_cents = ?, delivery_days = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          serviceId,
          service.title,
          service.description.slice(0, 500),
          service.description,
          Math.round(Number(service.price || 0) * 100),
          Number(service.delivery_time || 1),
          existing.id,
        ]
      );
    } else {
      await query(
        `INSERT INTO service_listings
          (freelancer_id, service_id, slug, title, summary, description, base_price_cents, currency, delivery_days, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'AUD', ?, 'draft', NOW(), NOW())`,
        [
          freelancerId,
          serviceId,
          baseSlug,
          service.title,
          service.description.slice(0, 500),
          service.description,
          Math.round(Number(service.price || 0) * 100),
          Number(service.delivery_time || 1),
        ]
      );
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await parseRequestBody(req);
    const displayName = String(body.display_name || '').trim();
    const title = String(body.title || '').trim();
    const bio = String(body.bio || '').trim();
    const description = String(body.description || '').trim();
    const country = String(body.country || '').trim();
    const contactEmail = String(body.contact_email || '').trim().toLowerCase();
    const contactPhone = body.contact_phone ? String(body.contact_phone).trim() : null;
    const hourlyRate = Number(body.hourly_rate || 0);
    const skills = parseJsonArray<string>(body.skills);
    const services = parseJsonArray<FreelancerServiceInput>(body.services);

    if (!displayName || !title || !bio || !description || !country || skills.length === 0 || !hourlyRate || !contactEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await query(
      `INSERT INTO users (email, password_hash, role, display_name, is_active, email_verified, created_at, updated_at)
       VALUES (?, ?, 'freelancer', ?, 'TRUE', 'FALSE', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        role = 'freelancer',
        display_name = VALUES(display_name),
        updated_at = NOW()`,
      [contactEmail, 'pending-sql-onboarding', displayName]
    );

    const user = await queryOne<{ id: number }>('SELECT id FROM users WHERE email = ? LIMIT 1', [contactEmail]);

    if (!user) {
      return res.status(500).json({ error: 'Unable to create freelancer user' });
    }

    await query(
      `INSERT INTO freelancers
        (user_id, display_name, headline, title, bio, description, country, skills, hourly_rate_cents, response_time, availability, verification_state, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'pending', 'pending', NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        display_name = VALUES(display_name),
        headline = VALUES(headline),
        title = VALUES(title),
        bio = VALUES(bio),
        description = VALUES(description),
        country = VALUES(country),
        skills = VALUES(skills),
        hourly_rate_cents = VALUES(hourly_rate_cents),
        response_time = VALUES(response_time),
        verification_state = 'pending',
        status = 'pending',
        updated_at = NOW()`,
      [
        user.id,
        displayName,
        bio.slice(0, 150),
        title,
        bio,
        description,
        country,
        JSON.stringify(skills),
        Math.round(hourlyRate * 100),
        contactPhone ? `Phone provided: ${contactPhone}` : 'Pending review',
      ]
    );

    const freelancer = await queryOne<{ id: number }>('SELECT id FROM freelancers WHERE user_id = ? LIMIT 1', [user.id]);

    if (!freelancer) {
      return res.status(500).json({ error: 'Unable to create freelancer profile' });
    }

    if (services.length > 0) {
      await upsertServiceListings(freelancer.id, services);
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! We'll review it within 48 hours.",
      freelancer_id: freelancer.id,
      user_id: user.id,
    });
  } catch (error) {
    console.error('Freelancer onboarding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
