// Utility functions for parsing freelancer availability

export interface ParsedAvailability {
  isAvailable: boolean;
  status: 'available' | 'busy' | 'unknown';
  workingHours?: string;
  workingHoursFrom?: string;
  workingHoursTo?: string;
  timezone?: string;
  nextAvailableDate?: string;
}

/**
 * Parse availability string from database format: "busy|date=2024-01-01|hours=09:00-17:00|timezone=UTC"
 * Also supports legacy "available"/"unavailable" format for backward compatibility
 */
export function parseAvailability(availabilityStr: string | null | undefined): ParsedAvailability {
  if (!availabilityStr || !availabilityStr.trim()) {
    return { isAvailable: false, status: 'unknown' };
  }

  const parts = availabilityStr.split('|');
  const statusPart = parts[0].toLowerCase().trim();
  
  // Determine status
  let isAvailable = false;
  let status: 'available' | 'busy' | 'unknown' = 'unknown';
  
  if (statusPart === 'available') {
    isAvailable = true;
    status = 'available';
  } else if (statusPart === 'busy' || statusPart === 'unavailable') {
    isAvailable = false;
    status = 'busy';
  } else {
    // Legacy format or unknown - try to infer
    if (['available', 'available now', 'open', 'ready'].includes(statusPart)) {
      isAvailable = true;
      status = 'available';
    } else if (['booked', 'busy', 'unavailable', 'not available', 'engaged'].includes(statusPart)) {
      isAvailable = false;
      status = 'busy';
    }
  }

  const result: ParsedAvailability = {
    isAvailable,
    status: status === 'unknown' ? (isAvailable ? 'available' : 'busy') : status
  };

  // Parse additional parts
  for (const part of parts.slice(1)) {
    if (part.startsWith('date=')) {
      result.nextAvailableDate = part.substring(5);
    } else if (part.startsWith('hours=')) {
      const hours = part.substring(6);
      if (hours.includes('-')) {
        const [from, to] = hours.split('-');
        result.workingHoursFrom = from.trim();
        result.workingHoursTo = to.trim();
        result.workingHours = hours;
      } else {
        result.workingHours = hours;
      }
    } else if (part.startsWith('timezone=')) {
      result.timezone = part.substring(9);
    }
  }

  return result;
}

