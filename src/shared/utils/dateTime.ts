// Utility functions for date/time handling
import { toZonedTime, format } from "date-fns-tz";
import { formatDistanceToNow } from "date-fns";

// ===============================
// CONSTANTS
// ===============================
export const VANCOUVER_TIMEZONE = "America/Vancouver";

// ===============================
// FORM INPUT UTILITIES (HTML input[type="date"] and input[type="time"])
// ===============================

/**
 * Format date for HTML date input (YYYY-MM-DD format)
 * Handles both Date objects and ISO date strings
 */
export const formatDateForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

/**
 * Format time for HTML time input (HH:mm format)
 * Handles both Date objects and ISO datetime strings
 */
export const formatTimeForInput = (date: string | Date): string => {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

/**
 * Combine date and time strings into ISO datetime string
 * Used for form data processing
 */
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

// ===============================
// SCHEDULE FORMATTING UTILITIES (Pacific Time)
// ===============================

/**
 * Format schedule date in Pacific Time (MMM d, yyyy format)
 * Consistent with other Pacific Time utilities
 */
export const formatScheduleDate = (date: string): string => {
  if (!date) return "";
  return formatPacificDate(date);
};

/**
 * Format schedule time in Pacific Time (24-hour format: HH:mm)
 * Consistent with Pacific timezone handling
 */
export const formatScheduleTime = (date: string): string => {
  if (!date) return "";
  return formatPacificTime(date);
};

/**
 * Calculate and format work duration (startTime, endTime, breakDuration → "8h 30m")
 * Uses UTC time calculation for accuracy
 */
export const formatScheduleDuration = (
  startTime: string,
  endTime: string,
  breakDuration: number = 0
): string => {
  if (!startTime || !endTime) return "";

  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  const workMinutes = totalMinutes - breakDuration;
  const hours = Math.floor(workMinutes / 60);
  const minutes = workMinutes % 60;

  return `${hours}h ${minutes}m`;
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

// ===============================
// TIMEZONE-SAFE RANGE UTILITIES
// ===============================

/**
 * Expand date range by ±1 day for timezone-safe API requests
 * Prevents missing data due to timezone conversions between client and server
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Expanded date range with buffer days
 */
export const expandRangeForTimezoneSafety = (
  startDate: string,
  endDate: string
): { startDate: string; endDate: string } => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Subtract 1 day from start, add 1 day to end
  start.setDate(start.getDate() - 1);
  end.setDate(end.getDate() + 1);

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
};

/**
 * Check if a UTC datetime represents "today" in Pacific Time
 * More explicit version of existing filtering logic
 *
 * @param utcDateTime - UTC datetime string or Date object
 * @returns true if the datetime falls on today's Pacific Time date
 */
export const isTodayInPacific = (utcDateTime: string | Date): boolean => {
  const todayPacific = getPacificToday();
  const pacificDate = convertUTCToPacificDate(utcDateTime);
  return pacificDate === todayPacific;
};

/**
 * Get date range for "today" with timezone safety buffer
 * Returns a 3-day range (yesterday, today, tomorrow) for safe API requests
 * Client-side filtering can then apply exact "today" logic
 *
 * @returns Object with expanded start/end dates and Pacific "today" for filtering
 */
export const getTodayRangeWithBuffer = (): {
  apiRange: { startDate: string; endDate: string };
  pacificToday: string;
} => {
  const today = getPacificToday();
  const apiRange = expandRangeForTimezoneSafety(today, today);

  return {
    apiRange,
    pacificToday: today,
  };
};
