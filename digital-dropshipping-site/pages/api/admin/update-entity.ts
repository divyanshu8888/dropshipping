import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute, safeQuery } from '../../../src/lib/dbHelpers';

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
      [...values, entityId],
      'update-entity'
    );

    const updatedEntity = await safeQuery(
      `SELECT * FROM ${tableName} WHERE id = ? LIMIT 1`,
      [entityId],
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
    console.error('Error updating entity:', error);
    return res.status(500).json({
      error: 'Failed to update entity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
