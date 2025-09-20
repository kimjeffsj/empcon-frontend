import { useMemo } from "react";
import { useGetSchedulesByDateRangeQuery } from "@/store/api/schedulesApi";
import { useGetTimeEntriesQuery } from "@/store/api/timeclockApi";
import { getTodayRangeWithBuffer, isTodayInPacific } from "@/shared/utils/dateTime";
import { classifyShift, isOvertime } from "@/shared/utils/shift";
import { Schedule, TimeEntry } from "@empcon/types";

// ===============================
// TODAY CLOCK STATUS HOOK
// ===============================

/**
 * Combined schedule and time entry data for today
 */
export interface TodayClockStatus {
  // Individual employee focus (when employeeId provided)
  individualStatus?: {
    todaySchedule: Schedule | null;
    todayTimeEntry: TimeEntry | null;
    isScheduled: boolean;
    isWorking: boolean;
    hasCompletedToday: boolean;
    currentStatus: string;
    buttonState: "clock-in" | "clock-out" | "not-scheduled" | "completed";
  };

  // Dashboard focus (when no employeeId or allEmployees = true)
  dashboardStatus?: {
    allSchedules: Schedule[];
    allTimeEntries: TimeEntry[];
    employeeSummaries: EmployeeClockSummary[];
    stats: {
      scheduled: number;
      working: number;
      completed: number;
      late: number;
      overtime: number;
    };
  };
}

/**
 * Employee summary for dashboard view
 */
export interface EmployeeClockSummary {
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
    position?: string;
  };
  schedule: Schedule | null;
  timeEntry: TimeEntry | null;
  status: "scheduled" | "working" | "completed" | "late" | "overtime" | "not-scheduled";
  isWorking: boolean;
  shiftType: "regular" | "night" | "overtime";
  workingHours?: number;
}

/**
 * Hook options
 */
export interface UseTodayClockStatusOptions {
  employeeId?: string;          // For individual employee view
  allEmployees?: boolean;       // For dashboard view with all employees
  autoRefresh?: boolean;        // Enable polling for real-time updates
  refreshInterval?: number;     // Polling interval in milliseconds (default: 30000)
}

/**
 * Consolidated hook for today's clock status
 * Combines schedule and time entry data with consistent timezone handling
 * Supports both individual employee view and dashboard view
 */
export function useTodayClockStatus(
  options: UseTodayClockStatusOptions = {}
): {
  data: TodayClockStatus;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const {
    employeeId,
    allEmployees = false,
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  // Get today's date range with timezone safety buffer
  const { apiRange, pacificToday } = useMemo(() => getTodayRangeWithBuffer(), []);

  // Query schedules for today
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useGetSchedulesByDateRangeQuery(
    {
      startDate: apiRange.startDate,
      endDate: apiRange.endDate,
      employeeId: !allEmployees ? employeeId : undefined,
    },
    {
      pollingInterval: autoRefresh ? refreshInterval : 0,
    }
  );

  // Query time entries for today
  const {
    data: timeEntriesData,
    isLoading: timeEntriesLoading,
    error: timeEntriesError,
    refetch: refetchTimeEntries,
  } = useGetTimeEntriesQuery(
    {
      startDate: apiRange.startDate,
      endDate: apiRange.endDate,
      employeeId: !allEmployees ? employeeId : undefined,
    },
    {
      pollingInterval: autoRefresh ? refreshInterval : 0,
    }
  );

  // Filter data to actual "today" in Pacific Time
  const todaySchedules = useMemo(() => {
    if (!schedulesData?.data) return [];
    return schedulesData.data.filter(schedule =>
      isTodayInPacific(schedule.startTime)
    );
  }, [schedulesData]);

  const todayTimeEntries = useMemo(() => {
    if (!timeEntriesData?.data) return [];
    return timeEntriesData.data.filter(entry =>
      isTodayInPacific(entry.startTime)
    );
  }, [timeEntriesData]);

  // Process data based on view type
  const processedData = useMemo((): TodayClockStatus => {
    if (!allEmployees && employeeId) {
      // Individual employee view
      const todaySchedule = todaySchedules.find(s => s.employeeId === employeeId) || null;
      const todayTimeEntry = todayTimeEntries.find(e => e.employeeId === employeeId) || null;

      const isScheduled = !!todaySchedule;
      const isWorking = todayTimeEntry?.status === "CLOCKED_IN";
      const hasCompletedToday = todayTimeEntry?.status === "CLOCKED_OUT";

      let currentStatus = "Not Scheduled";
      let buttonState: "clock-in" | "clock-out" | "not-scheduled" | "completed" = "not-scheduled";

      if (hasCompletedToday) {
        currentStatus = "Completed";
        buttonState = "completed";
      } else if (isWorking) {
        currentStatus = "Working";
        buttonState = "clock-out";
      } else if (isScheduled) {
        currentStatus = "Scheduled";
        buttonState = "clock-in";
      }

      return {
        individualStatus: {
          todaySchedule,
          todayTimeEntry,
          isScheduled,
          isWorking,
          hasCompletedToday,
          currentStatus,
          buttonState,
        },
      };
    } else {
      // Dashboard view - all employees
      const employeeMap = new Map<string, EmployeeClockSummary>();

      // Process schedules
      todaySchedules.forEach(schedule => {
        if (!schedule.employee) return;

        employeeMap.set(schedule.employeeId, {
          employeeId: schedule.employeeId,
          employee: {
            firstName: schedule.employee.firstName,
            lastName: schedule.employee.lastName,
            employeeNumber: schedule.employee.employeeNumber,
            position: schedule.employee.position,
          },
          schedule,
          timeEntry: null,
          status: "scheduled",
          isWorking: false,
          shiftType: classifyShift(schedule.startTime),
        });
      });

      // Process time entries
      todayTimeEntries.forEach(entry => {
        if (!entry.employee) return;

        const existing = employeeMap.get(entry.employeeId);
        const workingHours = entry.totalHours || 0;
        const shiftType = classifyShift(entry.startTime, workingHours);

        let status: EmployeeClockSummary["status"] = "not-scheduled";
        if (entry.status === "CLOCKED_IN") {
          status = isOvertime(workingHours) ? "overtime" : "working";
        } else if (entry.status === "CLOCKED_OUT") {
          status = isOvertime(workingHours) ? "overtime" : "completed";
        }

        if (existing) {
          existing.timeEntry = entry;
          existing.status = status;
          existing.isWorking = entry.status === "CLOCKED_IN";
          existing.shiftType = shiftType;
          existing.workingHours = workingHours;
        } else {
          employeeMap.set(entry.employeeId, {
            employeeId: entry.employeeId,
            employee: {
              firstName: entry.employee.firstName,
              lastName: entry.employee.lastName,
              employeeNumber: entry.employee.employeeNumber,
              position: entry.employee.position,
            },
            schedule: null,
            timeEntry: entry,
            status,
            isWorking: entry.status === "CLOCKED_IN",
            shiftType,
            workingHours,
          });
        }
      });

      const employeeSummaries = Array.from(employeeMap.values());

      // Calculate stats
      const stats = {
        scheduled: employeeSummaries.filter(e => e.status === "scheduled").length,
        working: employeeSummaries.filter(e => e.status === "working").length,
        completed: employeeSummaries.filter(e => e.status === "completed").length,
        late: employeeSummaries.filter(e => e.status === "late").length,
        overtime: employeeSummaries.filter(e => e.status === "overtime").length,
      };

      return {
        dashboardStatus: {
          allSchedules: todaySchedules,
          allTimeEntries: todayTimeEntries,
          employeeSummaries,
          stats,
        },
      };
    }
  }, [todaySchedules, todayTimeEntries, employeeId, allEmployees]);

  const isLoading = schedulesLoading || timeEntriesLoading;
  const error = schedulesError || timeEntriesError;

  const refetch = () => {
    refetchSchedules();
    refetchTimeEntries();
  };

  return {
    data: processedData,
    isLoading,
    error: error ? String(error) : null,
    refetch,
  };
}