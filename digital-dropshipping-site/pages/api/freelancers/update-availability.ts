import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { parseAvailability } from '../../../src/lib/availability';

// Format availability object to database string format
function formatAvailability(availability: {
  isAvailable: boolean;
  workingHours?: string | null;
  timezone?: string | null;
  nextAvailableDate?: string | null;
  workingHoursFrom?: string | null;
  workingHoursTo?: string | null;
}): string {
  const parts: string[] = [availability.isAvailable ? 'available' : 'busy'];
  
  if (availability.nextAvailableDate) {
    parts.push(`date=${availability.nextAvailableDate}`);
  }
  
  if (availability.workingHoursFrom && availability.workingHoursTo) {
    parts.push(`hours=${availability.workingHoursFrom}-${availability.workingHoursTo}`);
  } else if (availability.workingHours) {
    parts.push(`hours=${availability.workingHours}`);
  }
  
  if (availability.timezone) {
    parts.push(`timezone=${availability.timezone}`);
  }
  
  return parts.join('|');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }
  
  if (req.method === 'POST') {
    return handlePost(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { freelancerId } = req.query;
    
    if (!freelancerId) {
      return res.status(400).json({ error: 'Missing freelancerId' });
    }

    const userId = Number(freelancerId);
    
    // Fetch the availability record
    const freelancer = await queryOne<{ id: number; user_id: number; availability: string | null }>(
      `SELECT id, user_id, availability
       FROM freelancers
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer not found' });
    }

    // Parse the availability string back to structured format
    const parsed = parseAvailability(freelancer.availability);

    return res.status(200).json({
      success: true,
      availability: {
        isAvailable: parsed.isAvailable,
        workingHours: parsed.workingHours,
        timezone: parsed.timezone || 'UTC',
        nextAvailableDate: parsed.nextAvailableDate,
        workingHoursFrom: parsed.workingHoursFrom,
        workingHoursTo: parsed.workingHoursTo
      }
    });

  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({
      error: 'Failed to fetch availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { freelancerId, availability } = req.body;

    if (!freelancerId || !availability) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { freelancerId: !!freelancerId, availability: !!availability }
      });
    }

    const userId = Number(freelancerId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid freelancerId' });
    }
    
    // First verify freelancer exists
    const existingFreelancer = await queryOne<{ id: number; user_id: number }>(
      `SELECT id, user_id FROM freelancers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!existingFreelancer) {
      console.error(`Freelancer not found for user_id: ${userId}`);
      return res.status(404).json({ error: 'Freelancer not found' });
    }
    
    // Format the availability data into a string
    const availabilityStr = formatAvailability({
      isAvailable: Boolean(availability.isAvailable),
      workingHours: availability.workingHours ?? null,
      timezone: availability.timezone ?? null,
      nextAvailableDate: availability.nextAvailableDate ?? null,
      workingHoursFrom: availability.workingHoursFrom ?? null,
      workingHoursTo: availability.workingHoursTo ?? null,
    });

    console.log(`Updating availability for freelancer user_id=${userId}, availabilityStr=${availabilityStr}`);

    // Update the availability column
    const updateResult = await query(
      `UPDATE freelancers
         SET availability = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [availabilityStr, userId]
    );

    // Check if update was successful
    const affectedRows = (updateResult as any)?.affectedRows ?? 0;
    if (affectedRows === 0) {
      console.error(`Update query did not affect any rows for user_id=${userId}`);
      return res.status(500).json({
        error: 'Failed to update availability - no rows affected',
        details: 'The update query did not modify any records. Please check if the freelancer record exists.'
      });
    }

    console.log(`Successfully updated availability for freelancer user_id=${userId}, affectedRows=${affectedRows}`);

    // Fetch the updated record
    const freelancer = await queryOne<{ id: number; user_id: number; availability: string | null }>(
      `SELECT id, user_id, availability
       FROM freelancers
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelancer record not found after update' });
    }

    // Parse the availability string back to structured format
    const parsed = parseAvailability(freelancer.availability || null);

    return res.status(200).json({
      success: true,
      availability: {
        isAvailable: parsed.isAvailable,
        workingHours: parsed.workingHours,
        timezone: parsed.timezone || availability.timezone || 'UTC',
        nextAvailableDate: parsed.nextAvailableDate,
        workingHoursFrom: parsed.workingHoursFrom,
        workingHoursTo: parsed.workingHoursTo
      }
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json({
      error: 'Failed to update availability',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
