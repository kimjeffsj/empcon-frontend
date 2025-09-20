import { Schedule } from "@empcon/types";

// Schedule Event interface for calendar display
export interface ScheduleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    schedule: Schedule;
    employeeName: string;
    position?: string;
    status: Schedule["status"];
    type: "regular" | "night" | "overtime";
    daySchedules?: Schedule[]; // For summary events - all schedules for this date
  };
}

/**
 * Group schedules by date (YYYY-MM-DD format)
 */
export function groupSchedulesByDate(schedules: Schedule[]): { [key: string]: Schedule[] } {
  const groupedByDate: { [key: string]: Schedule[] } = {};

  schedules.forEach((schedule) => {
    const dateKey = new Date(schedule.startTime).toDateString();
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(schedule);
  });

  return groupedByDate;
}

/**
 * Detect night shift based on start time
 * Night shift: starts >= 22:00 or < 06:00
 */
export function isNightShift(startTime: string): boolean {
  const hour = new Date(startTime).getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Detect overtime based on duration
 * Overtime: more than 8 hours
 */
export function isOvertimeSchedule(startTime: string, endTime: string): boolean {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return end.getTime() - start.getTime() > 8 * 60 * 60 * 1000;
}

/**
 * Determine schedule type based on shift characteristics
 */
export function getScheduleType(schedule: Schedule): "regular" | "night" | "overtime" {
  const hasNightShift = isNightShift(schedule.startTime);
  const hasOvertime = isOvertimeSchedule(schedule.startTime, schedule.endTime);

  if (hasNightShift) return "night";
  if (hasOvertime) return "overtime";
  return "regular";
}

/**
 * Transform individual schedule to calendar event
 */
export function transformScheduleToCalendarEvent(
  schedule: Schedule,
  employeeName: string,
  allDaySchedules?: Schedule[]
): ScheduleEvent {
  return {
    id: schedule.id,
    title: `${employeeName} - ${schedule.position}`,
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    resource: {
      schedule,
      employeeName,
      position: schedule.position,
      status: schedule.status,
      type: getScheduleType(schedule),
      daySchedules: allDaySchedules,
    },
  };
}

/**
 * Transform schedules to calendar summary events grouped by date
 * Used for calendar view where we show one event per date with employee count
 */
export function transformSchedulesToCalendarSummaryEvents(
  schedules: Schedule[],
  readOnly: boolean = false
): ScheduleEvent[] {
  const groupedByDate = groupSchedulesByDate(schedules);

  return Object.entries(groupedByDate).map(([dateKey, daySchedules]) => {
    const date = new Date(dateKey);
    const employeeCount = daySchedules.length;

    // Calculate summary info
    const hasNightShifts = daySchedules.some((s) => isNightShift(s.startTime));
    const hasOvertime = daySchedules.some((s) => isOvertimeSchedule(s.startTime, s.endTime));

    // Determine summary type
    let summaryType: "regular" | "night" | "overtime" = "regular";
    if (hasNightShifts) summaryType = "night";
    else if (hasOvertime) summaryType = "overtime";

    return {
      id: `summary-${dateKey}`,
      title: readOnly
        ? `📅 ${employeeCount} schedule${employeeCount !== 1 ? "s" : ""}`
        : `📅 ${employeeCount} employee${employeeCount !== 1 ? "s" : ""}`,
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      end: new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59
      ),
      resource: {
        schedule: daySchedules[0], // Keep first schedule for reference
        employeeName: readOnly
          ? `${employeeCount} schedules`
          : `${employeeCount} employees`,
        position: undefined,
        status: "SCHEDULED" as const,
        type: summaryType,
        daySchedules, // Include all schedules for this date
      },
    };
  });
}

/**
 * Transform schedules to individual calendar events
 * Used when showing detailed view with individual schedule entries
 */
export function transformSchedulesToIndividualCalendarEvents(
  schedules: Schedule[]
): ScheduleEvent[] {
  return schedules.map((schedule) => {
    const employeeName = `${schedule.employee.firstName} ${schedule.employee.lastName}`.trim();
    return transformScheduleToCalendarEvent(schedule, employeeName);
  });
}