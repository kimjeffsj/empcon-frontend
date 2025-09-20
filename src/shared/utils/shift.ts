import {
  OVERTIME_HOURS,
  REGULAR_SHIFT_START,
  REGULAR_SHIFT_END,
  NIGHT_SHIFT_START,
  NIGHT_SHIFT_END,
} from "@/shared/constants/time";

// ===============================
// SHIFT CLASSIFICATION UTILITIES
// ===============================

/**
 * Shift type classification
 */
export type ShiftType = "regular" | "night" | "overtime";

/**
 * Classify shift type based on start time
 * @param startTime - ISO datetime string or Date object
 * @returns "regular" | "night" based on time of day
 */
export function classifyShiftType(startTime: string | Date): "regular" | "night" {
  const date = typeof startTime === "string" ? new Date(startTime) : startTime;
  const hour = date.getHours();

  // Night shift: >= 22:00 OR < 06:00
  if (hour >= NIGHT_SHIFT_START || hour < NIGHT_SHIFT_END) {
    return "night";
  }

  // Regular shift: 06:00 <= hour < 18:00
  return "regular";
}

/**
 * Check if work duration qualifies as overtime
 * @param hours - Total work hours
 * @returns true if hours exceed overtime threshold
 */
export function isOvertime(hours: number): boolean {
  return hours > OVERTIME_HOURS;
}

/**
 * Classify full shift including overtime consideration
 * @param startTime - ISO datetime string or Date object
 * @param totalHours - Total work hours (optional, for overtime detection)
 * @returns "regular" | "night" | "overtime"
 */
export function classifyShift(
  startTime: string | Date,
  totalHours?: number
): ShiftType {
  // Check overtime first (takes precedence over time-based classification)
  if (totalHours !== undefined && isOvertime(totalHours)) {
    return "overtime";
  }

  // Return time-based classification
  return classifyShiftType(startTime);
}

/**
 * Check if a given hour falls within regular shift hours
 * @param hour - Hour in 24-hour format (0-23)
 * @returns true if within regular shift hours
 */
export function isRegularShiftHour(hour: number): boolean {
  return hour >= REGULAR_SHIFT_START && hour < REGULAR_SHIFT_END;
}

/**
 * Check if a given hour falls within night shift hours
 * @param hour - Hour in 24-hour format (0-23)
 * @returns true if within night shift hours
 */
export function isNightShiftHour(hour: number): boolean {
  return hour >= NIGHT_SHIFT_START || hour < NIGHT_SHIFT_END;
}