import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format a date with detailed timestamp information
 * Shows both the exact date/time and relative time
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string with detailed information
 */
export function formatDetailedTimestamp(
  date: Date | string,
  options?: {
    showRelative?: boolean;
    showTime?: boolean;
    dateFormat?: string;
  }
) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const showRelative = options?.showRelative !== false;
  const showTime = options?.showTime !== false;
  const dateFormat = options?.dateFormat || (showTime ? 'MMM d, yyyy h:mm a' : 'MMM d, yyyy');

  const formattedDate = format(dateObj, dateFormat);
  
  if (showRelative) {
    const relativeTime = formatDistanceToNow(dateObj, { addSuffix: true });
    return {
      full: formattedDate,
      relative: relativeTime,
      tooltip: `${formattedDate} (${relativeTime})`,
    };
  }

  return {
    full: formattedDate,
    relative: '',
    tooltip: formattedDate,
  };
}