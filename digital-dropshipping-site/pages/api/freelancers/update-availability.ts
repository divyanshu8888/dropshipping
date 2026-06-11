import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';
import { parseAvailability } from '../../../src/lib/availability';
import { requireRole, internalError } from '../../../src/lib/apiAuth';

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
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Why: identity must come from the session cookie; query/body freelancerId is ignored.
  const user = await requireRole(req, res, ['FREELANCER']);
  if (!user) return;

  if (req.method === 'GET') {
    return handleGet(req, res, user.id);
  }

  return handlePost(req, res, user.id);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
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
    return internalError(res, 'freelancers/update-availability/get', error);
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: number) {
  try {
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        error: 'Missing required fields',
        received: { freelancerId: true, availability: !!availability }
      });
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
      // Why: generic 500, no internal details leaked.
      return internalError(res, 'freelancers/update-availability/post no-rows', new Error(`no rows affected for user_id=${userId}`));
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
    return internalError(res, 'freelancers/update-availability/post', error);
  }
}
