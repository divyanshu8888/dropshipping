import React from 'react';
import { ParsedAvailability } from './availability';

/**
 * Format availability for display
 */
export function formatAvailabilityDisplay(parsed: ParsedAvailability): {
  label: string;
  subtitle?: string;
  tone: string;
  bg: string;
  border: string;
  icon: React.ReactElement;
} {
  if (parsed.status === 'available') {
    let subtitle = '';
    if (parsed.workingHoursFrom && parsed.workingHoursTo) {
      subtitle = `${parsed.workingHoursFrom} - ${parsed.workingHoursTo}`;
    } else if (parsed.workingHours) {
      subtitle = parsed.workingHours;
    }
    if (parsed.timezone) {
      subtitle += subtitle ? ` (${parsed.timezone})` : parsed.timezone;
    }

    return {
      label: 'Available Now',
      subtitle: subtitle || undefined,
      tone: 'text-emerald-200',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-300/30',
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.704 5.296a1 1 0 010 1.414l-7.004 7.005a1 1 0 01-1.414 0L4.296 9.725a1 1 0 011.414-1.414l3.004 3.004 6.297-6.297a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    };
  }

  if (parsed.status === 'busy') {
    let subtitle = '';
    if (parsed.nextAvailableDate) {
      const date = new Date(parsed.nextAvailableDate);
      subtitle = `Available ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (parsed.workingHoursFrom && parsed.workingHoursTo) {
      subtitle = `Working hours: ${parsed.workingHoursFrom} - ${parsed.workingHoursTo}`;
    } else if (parsed.workingHours) {
      subtitle = parsed.workingHours;
    }
    if (parsed.timezone && !subtitle.includes(parsed.timezone)) {
      subtitle += subtitle ? ` (${parsed.timezone})` : parsed.timezone;
    }

    return {
      label: 'Busy',
      subtitle: subtitle || undefined,
      tone: 'text-amber-200',
      bg: 'bg-amber-500/15',
      border: 'border-amber-300/30',
      icon: (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
  }

  // Unknown/default
  return {
    label: 'Availability unknown',
    tone: 'text-white/70',
    bg: 'bg-white/8',
    border: 'border-white/15',
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
}

