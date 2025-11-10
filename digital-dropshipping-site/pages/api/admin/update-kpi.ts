import { NextApiRequest, NextApiResponse } from 'next';
import { safeExecute } from '../../../src/lib/dbHelpers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { field, value } = req.body;

    if (!field) {
      return res.status(400).json({ error: 'field is required' });
    }

    console.log(`KPI Update: ${field} = ${value}`);

    await safeExecute(
      `INSERT INTO audit_logs (actor_id, action, target_type, target_id, metadata, created_at)
       VALUES (?, 'update_kpi', 'kpi', ?, ?, NOW())`,
      [
        'admin',
        field,
        JSON.stringify({
          field,
          value,
          timestamp: new Date().toISOString()
        })
      ],
      'kpi-update'
    );

    return res.status(200).json({
      success: true,
      message: `KPI ${field} updated successfully`
    });
  } catch (error) {
    console.error('Error updating KPI:', error);
    return res.status(500).json({
      error: 'Failed to update KPI',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
