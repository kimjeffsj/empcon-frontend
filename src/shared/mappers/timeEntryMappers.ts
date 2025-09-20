import {
  TimeEntry,
  TIME_ENTRY_STATUS_COLORS,
} from "@empcon/types";
import {
  formatPacificTime,
  formatPacificDate,
} from "@/shared/utils/dateTime";
import { TimeEntryDisplay } from "@/features/timeclock/types/timeclock.types";

/**
 * Transform TimeEntry domain object to TimeEntryDisplay view model
 *
 * Handles:
 * - Status color and text mapping
 * - Pacific Time formatting
 * - Overtime and early clock-out detection
 * - Employee and schedule data transformation
 */
export function transformTimeEntryForDisplay(entry: TimeEntry): TimeEntryDisplay {
  const statusColor = TIME_ENTRY_STATUS_COLORS[entry.status];

  // Determine if early clock-out (more than 30 minutes before scheduled end)
  let isEarlyClockOut = false;
  if (entry.clockOutTime && entry.scheduledEndTime) {
    const clockOut = new Date(entry.clockOutTime);
    const scheduledEnd = new Date(entry.scheduledEndTime);
    const diffMinutes = (scheduledEnd.getTime() - clockOut.getTime()) / (1000 * 60);
    isEarlyClockOut = diffMinutes > 30;
  }

  // Determine if overtime (more than 8 hours worked)
  const isOvertime = (entry.totalHours || 0) > 8;

  // Status text based on status and conditions
  let statusText: string;
  switch (entry.status) {
    case "CLOCKED_IN":
      statusText = isOvertime ? "Clocked In (OT)" : "Clocked In";
      break;
    case "CLOCKED_OUT":
      if (isOvertime) {
        statusText = "Completed (OT)";
      } else if (isEarlyClockOut) {
        statusText = "Early Clock-out";
      } else {
        statusText = "Completed";
      }
      break;
    case "ADJUSTED":
      statusText = "Adjusted";
      break;
    default:
      statusText = String(entry.status).replace("_", " ");
  }

  return {
    id: entry.id,
    date: formatPacificDate(entry.clockInTime),
    schedulePosition: entry.schedule?.position,
    clockInTime: formatPacificTime(entry.clockInTime),
    clockOutTime: entry.clockOutTime
      ? formatPacificTime(entry.clockOutTime)
      : undefined,
    adjustedStartTime: entry.adjustedStartTime
      ? formatPacificTime(entry.adjustedStartTime)
      : undefined,
    adjustedEndTime: entry.adjustedEndTime
      ? formatPacificTime(entry.adjustedEndTime)
      : undefined,
    totalHours: entry.totalHours,
    status: entry.status,
    statusColor,
    statusText,
    gracePeriodApplied: entry.gracePeriodApplied,
    isEarlyClockOut,
    isOvertime,
    employee: entry.employee ? {
      firstName: entry.employee.firstName,
      lastName: entry.employee.lastName,
      employeeNumber: entry.employee.employeeNumber,
    } : undefined,
    schedule: entry.schedule ? {
      position: entry.schedule.position,
    } : undefined,
  };
}

/**
 * Transform multiple TimeEntry objects to TimeEntryDisplay array
 */
export function transformTimeEntriesForDisplay(entries: TimeEntry[]): TimeEntryDisplay[] {
  return entries.map(entry => transformTimeEntryForDisplay(entry));
}