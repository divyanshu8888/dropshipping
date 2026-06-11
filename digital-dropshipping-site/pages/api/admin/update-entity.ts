import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute, safeQuery } from '../../../src/lib/dbHelpers';
import { requireAdmin, internalError, parsePositiveInt } from '../../../src/lib/apiAuth';

type EntityType = 'user' | 'order' | 'project' | 'service' | 'kyc';

const TABLE_MAP: Record<EntityType, string> = {
  user: 'users',
  order: 'orders',
  project: 'projects',
  service: 'freelancer_services',
  kyc: 'users'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: admin endpoints were callable without any authentication.
  const adminUser = await requireAdmin(req, res);
  if (!adminUser) return;

  try {
    const { entityType, entityId, data } = req.body as {
      entityType?: EntityType;
      entityId?: number | string;
      data?: Record<string, any>;
    };

    if (!entityType || !TABLE_MAP[entityType]) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    if (!entityId) {
      return res.status(400).json({ error: 'entityId is required' });
    }

    // Why: entityId was used without validation; require a positive integer.
    const entityIdNum = parsePositiveInt(entityId);
    if (entityIdNum === null) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ error: 'data payload must be an object' });
    }

    const tableName = TABLE_MAP[entityType];
    const fields = Object.keys(data);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const assignments = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => data[field]);

    await safeExecute(
      `UPDATE ${tableName}
          SET ${assignments}, updated_at = NOW()
        WHERE id = ?`,
      [...values, entityIdNum],
      'update-entity'
    );

    const updatedEntity = await safeQuery(
      `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
      [entityIdNum],
      'update-entity-fetch'
    );

    await safeExecute(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, 'update_entity', ?, ?, ?, NOW())`,
      [
        'admin',
        entityType,
        String(entityId),
        JSON.stringify({
          changes: data,
          table: tableName,
          timestamp: new Date().toISOString()
        })
      ],
      'update-entity-audit'
    );

    return res.status(200).json({
      success: true,
      data: updatedEntity[0] ?? null
    });
  } catch (error) {
    // Why: 500 response leaked error.message to clients.
    return internalError(res, 'update-entity', error);
  }
}
