// Utility functions for date/time handling
import { toZonedTime, format } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";

// ===============================
// CONSTANTS
// ===============================
export const VANCOUVER_TIMEZONE = "America/Vancouver";

// ===============================
// LEGACY UTILITIES (Keep for backward compatibility)
// ===============================
export const formatDateForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

export const formatTimeForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

export const combineDateAndTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toISOString();
};

// ===============================
// SIMPLE PACIFIC TIME UTILITIES
// ===============================

/**
 * Get current date in Pacific Time (YYYY-MM-DD format)
 * This represents "today" in Vancouver timezone
 */
export const getPacificToday = (): string => {
  const pacificNow = toZonedTime(new Date(), VANCOUVER_TIMEZONE);
  return format(pacificNow, "yyyy-MM-dd", { timeZone: VANCOUVER_TIMEZONE });
};

/**
 * Format UTC datetime as Pacific Time (HH:mm format)
 */
export const formatPacificTime = (utcDateTime: string | Date): string => {
  const utcDate =
    typeof utcDateTime === "string" ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), "HH:mm", {
    timeZone: VANCOUVER_TIMEZONE,
  });
};

/**
 * Format UTC datetime as Pacific Time (12-hour format: h:mm a)
 */
export const formatPacificTime12 = (utcDateTime: string | Date): string => {
  const utcDate =
    typeof utcDateTime === "string" ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), "h:mm a", {
    timeZone: VANCOUVER_TIMEZONE,
  });
};

/**
 * Format UTC date as Pacific Time date (MMM d, yyyy format)
 */
export const formatPacificDate = (utcDateTime: string | Date): string => {
  const utcDate =
    typeof utcDateTime === "string" ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), "MMM d, yyyy", {
    timeZone: VANCOUVER_TIMEZONE,
  });
};

/**
 * Convert Date object to Pacific Time Date string (YYYY-MM-DD format)
 * Used for API requests
 */
export const formatPacificDateForAPI = (date: Date): string => {
  return format(date, "yyyy-MM-dd", { timeZone: VANCOUVER_TIMEZONE });
};

/**
 * Format time range in Pacific Time (HH:mm - HH:mm format)
 */
export const formatPacificTimeRange = (
  startUTC: string | Date | null,
  endUTC: string | Date | null
): string => {
  if (!startUTC) return "-";

  const startTime = formatPacificTime(startUTC);

  if (!endUTC) return `${startTime} - Still Working`;

  const endTime = formatPacificTime(endUTC);
  return `${startTime} - ${endTime}`;
};

/**
 * Calculate duration between two UTC times
 */
export const calculateDuration = (
  startUTC: string | Date | null,
  endUTC: string | Date | null
): string => {
  if (!startUTC || !endUTC) return "-";

  const start = typeof startUTC === "string" ? new Date(startUTC) : startUTC;
  const end = typeof endUTC === "string" ? new Date(endUTC) : endUTC;

  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

/**
 * Format relative time (e.g., "2 hours ago", "3 minutes ago")
 */
export const formatRelativeTime = (utcDateTime: string | Date): string => {
  const utcDate =
    typeof utcDateTime === "string" ? new Date(utcDateTime) : utcDateTime;
  return formatDistanceToNow(utcDate, { addSuffix: true });
};

/**
 * Filter array of items by client timezone "today"
 * Same logic as used in Schedule components for consistent filtering
 */
export const filterByClientTimezoneToday = <T extends { startTime: string }>(
  items: T[]
): T[] => {
  const todayDateString = new Date().toDateString(); // Client timezone "today"
  return items.filter((item) => {
    const itemDate = new Date(item.startTime).toDateString(); // UTC → Client timezone
    return itemDate === todayDateString;
  });
};

/**
 * Convert UTC datetime to Pacific Time date string (YYYY-MM-DD format)
 * Used for accurate date comparisons in Pacific timezone
 */
export const convertUTCToPacificDate = (utcDateTime: string | Date): string => {
  const utcDate = typeof utcDateTime === "string" ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), "yyyy-MM-dd", {
    timeZone: VANCOUVER_TIMEZONE,
  });
};

/**
 * Check if UTC datetime falls within Pacific Time date range
 * Converts UTC time to Pacific Time for accurate date-only comparison
 */
export const isUTCDateInPacificRange = (
  utcDateTime: string | Date,
  startDate: string,
  endDate: string
): boolean => {
  const pacificDate = convertUTCToPacificDate(utcDateTime);
  return pacificDate >= startDate && pacificDate <= endDate;
};
