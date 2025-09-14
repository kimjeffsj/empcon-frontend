import { TimeEntryStatus, ClockStatusResponse } from "@empcon/types";
import { LucideIcon } from "lucide-react";

// UI State Types
export type ClockButtonState = "clock-in" | "clock-out" | "disabled" | "loading";

export interface ClockButtonConfig {
  state: ClockButtonState;
  text: string;
  variant: "default" | "destructive" | "outline" | "secondary" | "ghost";
  icon: LucideIcon;
  disabled: boolean;
}

// Enhanced Clock Status for UI
export interface ClockStatusUIState {
  isLoading: boolean;
  error: string | null;
  data: ClockStatusResponse | null;
  canClockIn: boolean;
  canClockOut: boolean;
  activeTimeEntryId: string | null;
  nextSchedule: {
    id: string;
    startTime: string;
    position: string;
    timeUntilClockIn: number; // minutes until clock-in allowed
  } | null;
}

// Time Entry Display Types
export interface TimeEntryDisplay {
  id: string;
  date: string;
  schedulePosition?: string;
  clockInTime: string;
  clockOutTime?: string;
  adjustedStartTime?: string;
  adjustedEndTime?: string;
  totalHours?: number;
  status: TimeEntryStatus;
  statusColor: "green" | "red" | "yellow" | "blue" | "gray";
  statusText: string;
  gracePeriodApplied: boolean;
  isEarlyClockOut: boolean;
  isOvertime: boolean;
}

// Clock Status Card Types
export interface ClockStatusCardData {
  employeeName: string;
  employeeNumber?: string;
  currentStatus: "NOT_CLOCKED" | "CLOCKED_IN" | "ON_BREAK" | "CLOCKED_OUT";
  statusText: string;
  statusColor: "green" | "red" | "yellow" | "blue" | "gray";
  lastActionTime?: string;
  todayHours: number;
  scheduledHours: number;
  remainingHours: number;
  nextSchedule?: {
    time: string;
    position: string;
  };
}

// Time Entry List Configuration
export interface TimeEntryListConfig {
  showDateRange: boolean;
  showEmployeeInfo: boolean;
  showAdjustments: boolean;
  allowManualAdjustments: boolean;
  itemsPerPage: number;
  enableSearch: boolean;
}

// Dashboard Types (Admin)
export interface EmployeeClockSummary {
  employeeId: string;
  employeeName: string;
  employeeNumber?: string;
  currentStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LATE" | "OVERTIME";
  statusColor: "green" | "red" | "yellow" | "blue" | "gray";
  clockedIn: boolean;
  lastClockInTime?: string;
  todaySchedules: number;
  completedShifts: number;
  workedHours: number;
  scheduledHours: number;
  isLate: boolean;
  isOvertime: boolean;
}

// Modal/Dialog Types
export interface TimeAdjustmentModalData {
  timeEntryId: string;
  employeeName: string;
  originalClockInTime: string;
  originalClockOutTime?: string;
  currentClockInTime: string;
  currentClockOutTime?: string;
  reason?: string;
}

// Form Types
export interface ClockInFormData {
  scheduleId: string;
  location?: string;
}

export interface ClockOutFormData {
  location?: string;
}

export interface TimeAdjustmentFormData {
  clockInTime: string;
  clockOutTime?: string;
  reason: string;
}

// Notification Types
export interface ClockNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

// Date/Time Utilities
export interface TimeDisplay {
  time12: string;      // "9:05 AM"
  time24: string;      // "09:05"
  dateTime: string;    // "Jan 15, 9:05 AM"
  relative: string;    // "2 hours ago"
  duration?: string;   // "8h 30m" (for total hours)
}

// Constants for UI
export const CLOCK_STATUS_COLORS = {
  NOT_CLOCKED: "gray",
  CLOCKED_IN: "green", 
  ON_BREAK: "yellow",
  CLOCKED_OUT: "blue",
  LATE: "red",
  OVERTIME: "orange",
} as const;

export const TIME_ENTRY_STATUS_COLORS = {
  CLOCKED_IN: "green",
  CLOCKED_OUT: "blue", 
  ADJUSTED: "yellow",
} as const;

export const EMPLOYEE_STATUS_COLORS = {
  NOT_STARTED: "gray",
  IN_PROGRESS: "green",
  COMPLETED: "blue",
  LATE: "red", 
  OVERTIME: "orange",
} as const;