import {
  Schedule,
  TimeEntry,
  EmployeeClockSummary,
  EMPLOYEE_STATUS_COLORS,
} from "@empcon/types";

/**
 * Calculate schedule hours from start and end time
 */
export function calculateScheduleHours(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate worked hours from completed time entries
 */
export function calculateWorkedHours(timeEntries: TimeEntry[]): number {
  const completedEntries = timeEntries.filter(entry => entry.status === "CLOCKED_OUT");
  return completedEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
}

/**
 * Determine employee clock status based on time entries and worked hours
 */
export function determineEmployeeClockStatus(
  timeEntries: TimeEntry[],
  workedHours: number
): EmployeeClockSummary["currentStatus"] {
  // Find current clocked-in entry
  const currentEntry = timeEntries.find(entry => entry.status === "CLOCKED_IN");
  const isCurrentlyClocked = !!currentEntry;

  // Find completed entries
  const completedEntries = timeEntries.filter(entry => entry.status === "CLOCKED_OUT");
  const completedShifts = completedEntries.length;

  // Check for overtime
  const isOvertime = workedHours > 8;

  // Determine status
  if (isCurrentlyClocked) {
    return isOvertime ? "OVERTIME" : "IN_PROGRESS";
  } else if (completedShifts > 0) {
    return isOvertime ? "OVERTIME" : "COMPLETED";
  } else {
    return "NOT_STARTED";
  }
}

/**
 * Transform a single Schedule and its related TimeEntries into EmployeeClockSummary
 */
export function transformToEmployeeClockSummary(
  schedule: Schedule,
  relatedTimeEntries: TimeEntry[]
): EmployeeClockSummary {
  // Calculate basic metrics
  const workedHours = calculateWorkedHours(relatedTimeEntries);
  const scheduledHours = calculateScheduleHours(schedule.startTime, schedule.endTime);

  // Find current and completed entries
  const currentEntry = relatedTimeEntries.find(entry => entry.status === "CLOCKED_IN");
  const completedEntries = relatedTimeEntries.filter(entry => entry.status === "CLOCKED_OUT");

  // Determine status and flags
  const currentStatus = determineEmployeeClockStatus(relatedTimeEntries, workedHours);
  const isCurrentlyClocked = !!currentEntry;
  const isOvertime = workedHours > 8;
  const completedShifts = completedEntries.length;

  return {
    employeeId: schedule.employee.id,
    employeeName: `${schedule.employee.firstName} ${schedule.employee.lastName}`.trim(),
    employeeNumber: schedule.employee.employeeNumber,
    currentStatus,
    statusColor: EMPLOYEE_STATUS_COLORS[currentStatus],
    clockedIn: isCurrentlyClocked,
    lastClockInTime: currentEntry?.clockInTime,
    todaySchedules: 1, // One schedule per employee in this view
    completedShifts,
    workedHours: Number(workedHours.toFixed(2)),
    scheduledHours: Number(scheduledHours.toFixed(2)),
    isLate: false, // TODO: Calculate based on schedule vs actual clock-in time
    isOvertime,

    // UX improvement fields
    scheduledStart: schedule.startTime,
    scheduledEnd: schedule.endTime,
    actualClockInTime: currentEntry?.clockInTime,
    actualClockOutTime: completedEntries[0]?.clockOutTime,
    gracePeriodApplied: currentEntry?.gracePeriodApplied,
  };
}

/**
 * Combine schedules with their related time entries to create employee clock summaries
 */
export function combineSchedulesWithTimeEntries(
  schedules: Schedule[],
  timeEntries: TimeEntry[]
): EmployeeClockSummary[] {
  return schedules.map(schedule => {
    // Find related time entries for this schedule
    const relatedEntries = timeEntries.filter(
      entry => entry.scheduleId === schedule.id
    );

    return transformToEmployeeClockSummary(schedule, relatedEntries);
  });
}

/**
 * Calculate dashboard summary statistics from employee summaries
 */
export function calculateDashboardSummary(employeeSummaries: EmployeeClockSummary[]) {
  if (employeeSummaries.length === 0) return null;

  const totalEmployees = employeeSummaries.length;
  const clockedInCount = employeeSummaries.filter(emp => emp.clockedIn).length;
  const completedCount = employeeSummaries.filter(emp => emp.currentStatus === "COMPLETED").length;
  const lateCount = employeeSummaries.filter(emp => emp.isLate).length;
  const overtimeCount = employeeSummaries.filter(emp => emp.isOvertime).length;

  return {
    totalEmployees,
    clockedInCount,
    completedCount,
    lateCount,
    overtimeCount,
    attendanceRate:
      totalEmployees > 0
        ? Math.round(((clockedInCount + completedCount) / totalEmployees) * 100)
        : 0,
  };
}