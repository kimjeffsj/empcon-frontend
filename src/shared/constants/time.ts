// ===============================
// TIME-RELATED CONSTANTS
// ===============================

/**
 * Overtime threshold in hours
 * Work exceeding this duration is considered overtime
 */
export const OVERTIME_HOURS = 8;

/**
 * Regular shift time boundaries (24-hour format)
 * Regular shifts are between REGULAR_SHIFT_START (inclusive) and REGULAR_SHIFT_END (exclusive)
 */
export const REGULAR_SHIFT_START = 6;  // 6:00 AM
export const REGULAR_SHIFT_END = 18;   // 6:00 PM

/**
 * Night shift time boundaries (24-hour format)
 * Night shifts are defined as starting at or after NIGHT_SHIFT_START OR before NIGHT_SHIFT_END
 * This creates a night period from 10:00 PM to 6:00 AM
 */
export const NIGHT_SHIFT_START = 22;   // 10:00 PM
export const NIGHT_SHIFT_END = 6;      // 6:00 AM

/**
 * Early clock-out threshold in minutes
 * If employee clocks out more than this many minutes before scheduled end time,
 * it's considered an early clock-out
 */
export const EARLY_CLOCKOUT_THRESHOLD_MINUTES = 30;

/**
 * Late clock-in threshold in minutes
 * If employee clocks in more than this many minutes after scheduled start time,
 * it's considered late
 */
export const LATE_CLOCKIN_THRESHOLD_MINUTES = 15;