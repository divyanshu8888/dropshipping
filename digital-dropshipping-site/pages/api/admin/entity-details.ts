import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, tableExists } from '../../../src/lib/dbHelpers';

type EntityType = 'user' | 'order' | 'project' | 'service' | 'dispute' | 'kyc';

const TABLE_MAP: Record<EntityType, string> = {
  user: 'users',
  order: 'orders',
  project: 'projects',
  service: 'freelancer_services',
  dispute: 'disputes',
  kyc: 'users'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entityType, entityId } = req.query;

    if (!entityType || Array.isArray(entityType)) {
      return res.status(400).json({ error: 'entityType is required' });
    }

    if (!entityId || Array.isArray(entityId)) {
      return res.status(400).json({ error: 'entityId is required' });
    }

    const normalizedType = entityType as EntityType;

    if (!TABLE_MAP[normalizedType]) {
      return res.status(400).json({ error: 'Unsupported entity type' });
    }

    const tableName = TABLE_MAP[normalizedType];

    if (!(await tableExists(tableName))) {
      return res.status(200).json({
        success: true,
        entity: null
      });
    }

    const rows = await safeQuery(
      `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
      [entityId],
      `entity-details-${normalizedType}`
    );

    return res.status(200).json({
      success: true,
      entity: rows[0] ?? null
    });
  } catch (error) {
    console.error('Error fetching entity details:', error);
    return res.status(500).json({
      error: 'Failed to fetch entity details',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}