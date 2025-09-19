import { TimeEntryStatus, ClockStatusResponse } from "@empcon/types";
import { LucideIcon } from "lucide-react";

// UI State Types
export type ClockButtonState =
  | "clock-in"
  | "clock-out"
  | "disabled"
  | "loading";

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
