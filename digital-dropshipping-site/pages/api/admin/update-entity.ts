import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entityType, entityId, data } = req.body;

    // Get user from session/token to verify admin access
    // For now, we'll skip auth check but in production you'd verify the user is admin

    let result;
    let tableName;

    // Determine table name based on entity type
    switch (entityType) {
      case 'user':
        tableName = 'users';
        break;
      case 'order':
        tableName = 'orders';
        break;
      case 'project':
        tableName = 'projects';
        break;
      case 'service':
        tableName = 'freelancer_services';
        break;
      case 'kyc':
        tableName = 'users'; // KYC is part of users table
        break;
      default:
        return res.status(400).json({ error: 'Invalid entity type' });
    }

    // Update the entity
    const { data: updatedEntity, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', entityId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log the update in audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        actor_id: 'admin', // In production, get from session
        action: 'update_entity',
        target_type: entityType,
        target_id: entityId,
        metadata: {
          changes: data,
          table: tableName
        }
      });

    return res.status(200).json({
      success: true,
      data: updatedEntity
    });

  } catch (error) {
    console.error('Error updating entity:', error);
    return res.status(500).json({
      error: 'Failed to update entity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
