import { NextApiRequest, NextApiResponse } from 'next';
import { safeQuery, tableExists } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError, parsePositiveInt } from '../../../src/lib/apiAuth';

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

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const { entityType, entityId } = req.query;

    if (!entityType || Array.isArray(entityType)) {
      return res.status(400).json({ error: 'entityType is required' });
    }

    if (!entityId || Array.isArray(entityId)) {
      return res.status(400).json({ error: 'entityId is required' });
    }

    // Why: entityId went into the query unvalidated; require a positive integer.
    const entityIdNum = parsePositiveInt(entityId);
    if (entityIdNum === null) {
      return res.status(400).json({ error: 'Invalid id' });
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
      [entityIdNum],
      `entity-details-${normalizedType}`
    );

    return res.status(200).json({
      success: true,
      entity: rows[0] ?? null
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'entity-details', error);
  }
}