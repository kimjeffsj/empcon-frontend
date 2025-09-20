import {
  ScheduleStatus,
  TimeEntryStatus,
  EMPLOYEE_STATUS_COLORS,
  TIME_ENTRY_STATUS_COLORS,
  CLOCK_STATUS_COLORS,
} from "@empcon/types";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Edit,
} from "lucide-react";

// ===============================
// STATUS COLOR MAPPINGS
// ===============================

/**
 * Color name to Tailwind CSS class mapping
 * Converts simple color names to consistent Tailwind badge styles
 */
export const COLOR_VARIANTS = {
  green: "bg-green-100 text-green-800 border-green-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  red: "bg-red-100 text-red-800 border-red-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  gray: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

/**
 * Icon mapping for different status types
 */
export const STATUS_ICONS = {
  // Schedule Status Icons
  SCHEDULED: Clock,
  COMPLETED: CheckCircle,
  CANCELLED: AlertCircle,
  NO_SHOW: AlertCircle,

  // TimeEntry Status Icons
  CLOCKED_IN: PlayCircle,
  CLOCKED_OUT: StopCircle,
  ADJUSTED: Edit,

  // Employee Status Icons
  NOT_STARTED: Clock,
  IN_PROGRESS: PlayCircle,
  LATE: AlertCircle,
  OVERTIME: Clock,

  // Clock Status Icons
  NOT_CLOCKED: Clock,
  ON_BREAK: PauseCircle,
} as const;

/**
 * Human-readable labels for statuses
 */
export const STATUS_LABELS = {
  // Schedule Status Labels
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",

  // TimeEntry Status Labels
  CLOCKED_IN: "Clocked In",
  CLOCKED_OUT: "Clocked Out",
  ADJUSTED: "Adjusted",

  // Employee Status Labels
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "Working",
  LATE: "Late",
  OVERTIME: "Overtime",

  // Clock Status Labels
  NOT_CLOCKED: "Not Clocked",
  ON_BREAK: "On Break",

  // Working Now (Special case)
  WORKING_NOW: "Working Now",
} as const;

// ===============================
// STATUS UTILITY FUNCTIONS
// ===============================

/**
 * Get Tailwind CSS classes for schedule status
 */
export function getScheduleStatusStyle(status: ScheduleStatus): string {
  const colorMapping = {
    SCHEDULED: COLOR_VARIANTS.blue,
    COMPLETED: COLOR_VARIANTS.green,
    CANCELLED: COLOR_VARIANTS.red,
    NO_SHOW: COLOR_VARIANTS.orange,
  };
  return colorMapping[status] || COLOR_VARIANTS.gray;
}

/**
 * Get Tailwind CSS classes for time entry status
 */
export function getTimeEntryStatusStyle(status: TimeEntryStatus): string {
  const colorName = TIME_ENTRY_STATUS_COLORS[status];
  return COLOR_VARIANTS[colorName] || COLOR_VARIANTS.gray;
}

/**
 * Get Tailwind CSS classes for employee status
 */
export function getEmployeeStatusStyle(status: keyof typeof EMPLOYEE_STATUS_COLORS): string {
  const colorName = EMPLOYEE_STATUS_COLORS[status];
  return COLOR_VARIANTS[colorName] || COLOR_VARIANTS.gray;
}

/**
 * Get Tailwind CSS classes for clock status
 */
export function getClockStatusStyle(status: keyof typeof CLOCK_STATUS_COLORS): string {
  const colorName = CLOCK_STATUS_COLORS[status];
  return COLOR_VARIANTS[colorName] || COLOR_VARIANTS.gray;
}

/**
 * Get icon component for status
 */
export function getStatusIcon(status: string): React.ComponentType<any> | undefined {
  return STATUS_ICONS[status as keyof typeof STATUS_ICONS];
}

/**
 * Get human-readable label for status
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
}

/**
 * Special styles for "Working Now" state (overrides other statuses)
 */
export const WORKING_NOW_STYLE = COLOR_VARIANTS.green;