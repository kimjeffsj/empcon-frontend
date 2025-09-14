// Utility functions for date/time handling
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';

// ===============================
// CONSTANTS
// ===============================
export const VANCOUVER_TIMEZONE = 'America/Vancouver';

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

export const getCurrentDateInTimezone = (): Date => {
  return new Date();
};

export const formatDateTimeForDisplay = (
  dateTime: string | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('en-US', options);
};

// ===============================
// PACIFIC TIME UTILITIES
// ===============================

/**
 * Convert UTC datetime to Pacific Time
 */
export const convertUTCToPacific = (utcDateTime: string | Date): Date => {
  const utcDate = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
  return toZonedTime(utcDate, VANCOUVER_TIMEZONE);
};

/**
 * Get current date in Pacific Time (YYYY-MM-DD format)
 * This represents "today" in Vancouver timezone
 */
export const getPacificToday = (): string => {
  const pacificNow = toZonedTime(new Date(), VANCOUVER_TIMEZONE);
  return format(pacificNow, 'yyyy-MM-dd', { timeZone: VANCOUVER_TIMEZONE });
};

/**
 * Get Pacific Time date boundaries in UTC format for API requests
 * This is crucial for requesting "today's" data from server
 */
export const getPacificDateBoundaries = (pacificDate?: string): {
  startOfDayUTC: string;
  endOfDayUTC: string;
} => {
  // Use provided date or today in Pacific Time
  const dateStr = pacificDate || getPacificToday();
  
  // Create Pacific Time date at midnight
  const pacificMidnight = new Date(`${dateStr}T00:00:00`);
  const pacificEndOfDay = new Date(`${dateStr}T23:59:59.999`);
  
  // Convert Pacific Time to UTC for API requests
  const startOfDayUTC = fromZonedTime(pacificMidnight, VANCOUVER_TIMEZONE);
  const endOfDayUTC = fromZonedTime(pacificEndOfDay, VANCOUVER_TIMEZONE);
  
  return {
    startOfDayUTC: startOfDayUTC.toISOString(),
    endOfDayUTC: endOfDayUTC.toISOString(),
  };
};

/**
 * Format UTC datetime as Pacific Time (HH:mm format)
 */
export const formatPacificTime = (utcDateTime: string | Date): string => {
  const utcDate = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), 'HH:mm', { 
    timeZone: VANCOUVER_TIMEZONE 
  });
};

/**
 * Format UTC datetime as Pacific Time with date (MMM d, yyyy HH:mm format)
 */
export const formatPacificDateTime = (utcDateTime: string | Date): string => {
  const utcDate = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), 'MMM d, yyyy HH:mm', { 
    timeZone: VANCOUVER_TIMEZONE 
  });
};

/**
 * Format UTC date as Pacific Time date (MMM d, yyyy format)
 */
export const formatPacificDate = (utcDateTime: string | Date): string => {
  const utcDate = typeof utcDateTime === 'string' ? new Date(utcDateTime) : utcDateTime;
  return format(toZonedTime(utcDate, VANCOUVER_TIMEZONE), 'MMM d, yyyy', { 
    timeZone: VANCOUVER_TIMEZONE 
  });
};

/**
 * Check if UTC datetime falls within Pacific Time "today"
 */
export const isPacificToday = (utcDateTime: string | Date): boolean => {
  const pacificToday = getPacificToday();
  const pacificDate = format(convertUTCToPacific(utcDateTime), 'yyyy-MM-dd');
  return pacificDate === pacificToday;
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
  
  const start = typeof startUTC === 'string' ? new Date(startUTC) : startUTC;
  const end = typeof endUTC === 'string' ? new Date(endUTC) : endUTC;
  
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

// ===============================
// API HELPER UTILITIES  
// ===============================

/**
 * Get today's date range in UTC format for API requests
 * Returns Pacific Time "today" boundaries as UTC timestamps
 */
export const getTodayRangeForAPI = (): {
  startDate: string;
  endDate: string;
} => {
  const { startOfDayUTC, endOfDayUTC } = getPacificDateBoundaries();
  return {
    startDate: startOfDayUTC.split('T')[0], // YYYY-MM-DD format
    endDate: endOfDayUTC.split('T')[0],     // YYYY-MM-DD format
  };
};

/**
 * Get specific date range in UTC format for API requests
 */
export const getDateRangeForAPI = (pacificDate: string): {
  startDate: string;
  endDate: string;
} => {
  const { startOfDayUTC, endOfDayUTC } = getPacificDateBoundaries(pacificDate);
  return {
    startDate: startOfDayUTC.split('T')[0], // YYYY-MM-DD format
    endDate: endOfDayUTC.split('T')[0],     // YYYY-MM-DD format
  };
};