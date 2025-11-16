import { NextApiRequest, NextApiResponse } from 'next';
import { query, queryOne } from 'lib/mysql';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { freelancerId, availability } = req.body;

    if (!freelancerId || !availability) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = Number(freelancerId);
    const isAvailable = Boolean(availability.isAvailable);
    const workingHours = availability.workingHours ?? null;
    const timezone = availability.timezone ?? null;
    const nextAvailableDate = availability.nextAvailableDate ?? null;
    const workingHoursFrom = availability.workingHoursFrom ?? null;
    const workingHoursTo = availability.workingHoursTo ?? null;

    // First try updating explicit columns (if they exist in your schema)
    let updated = false;
    try {
      await query(
        `UPDATE freelancers
           SET is_available = ?, working_hours = ?, timezone = ?,
               ${nextAvailableDate !== null ? 'next_available_date = ?,' : ''}
               ${workingHoursFrom !== null ? 'working_hours_start = ?,' : ''}
               ${workingHoursTo !== null ? 'working_hours_end = ?,' : ''}
               updated_at = NOW()
         WHERE user_id = ?`,
        [
          isAvailable ? 'TRUE' : 'FALSE',
          workingHours ?? (workingHoursFrom && workingHoursTo ? `${workingHoursFrom}-${workingHoursTo}` : null),
          timezone,
          ...(nextAvailableDate !== null ? [nextAvailableDate] : []),
          ...(workingHoursFrom !== null ? [workingHoursFrom] : []),
          ...(workingHoursTo !== null ? [workingHoursTo] : []),
          userId
        ]
      );
      updated = true;
    } catch (err: any) {
      // If some columns don't exist, fall back to generic availability
      if (err?.code !== 'ER_BAD_FIELD_ERROR' && err?.code !== 'ER_NO_SUCH_FIELD') {
        throw err;
      }
    }

    if (!updated) {
      const parts: string[] = [isAvailable ? 'available' : 'unavailable'];
      if (nextAvailableDate) parts.push(`date=${nextAvailableDate}`);
      if (workingHoursFrom && workingHoursTo) parts.push(`hours=${workingHoursFrom}-${workingHoursTo}`);
      else if (workingHours) parts.push(`hours=${workingHours}`);
      await query(
        `UPDATE freelancers
           SET availability = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [parts.join('|'), userId]
      );
    }

    const freelancer = await queryOne<any>(
      `SELECT id, user_id,
              COALESCE(availability, CASE WHEN is_available='TRUE' THEN 'available' ELSE 'unavailable' END) AS availability
       FROM freelancers
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      availability: {
        isAvailable: (freelancer?.availability || 'unavailable') === 'available',
        workingHours,
        timezone,
        nextAvailableDate,
        workingHoursFrom,
        workingHoursTo
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
