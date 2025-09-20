import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetTimeEntriesQuery,
  useGetEmployeeTodayTimeEntriesQuery,
  useAdjustTimeEntryMutation,
} from "@/store/api/timeclockApi";
import {
  GetTimeEntriesParams,
  TimeEntry,
  TimeEntryStatus,
  TimeAdjustmentRequest,
  TIME_ENTRY_STATUS_COLORS,
} from "@empcon/types";

import { toast } from "sonner";
import { formatPacificTime, formatPacificDate } from "@/shared/utils/dateTime";
import { TimeEntryDisplay, TimeEntryListConfig } from "../components";

interface UseTimeEntriesOptions {
  employeeId?: string;
  config?: Partial<TimeEntryListConfig>;
  autoRefresh?: boolean;
  defaultFilters?: Partial<GetTimeEntriesParams>;
}

const DEFAULT_CONFIG: TimeEntryListConfig = {
  showDateRange: true,
  showEmployeeInfo: false,
  showAdjustments: true,
  allowManualAdjustments: false,
  itemsPerPage: 20,
  enableSearch: true,
};

export function useTimeEntries(options: UseTimeEntriesOptions = {}) {
  const { user } = useSelector((state: RootState) => state.auth);
  const employeeId = options.employeeId || user?.id || "";
  const config = { ...DEFAULT_CONFIG, ...options.config };

  // Determine if user can make adjustments
  const canAdjustTimes = user?.role === "ADMIN" || user?.role === "MANAGER";
  const finalConfig = {
    ...config,
    allowManualAdjustments: config.allowManualAdjustments && canAdjustTimes,
  };

  // Build query parameters with timezone-safe date range handling
  const queryParams: Partial<GetTimeEntriesParams> = {
    ...options.defaultFilters,
    limit: config.itemsPerPage,
  };

  // Expand date range for timezone safety (following ClockStatusDashboard pattern)
  if (queryParams.startDate && queryParams.endDate) {
    const startBase = new Date(queryParams.startDate);
    const endBase = new Date(queryParams.endDate);

    // Expand range by ±1 day for timezone boundary safety
    const expandedStart = new Date(startBase);
    expandedStart.setDate(startBase.getDate() - 1);
    const expandedEnd = new Date(endBase);
    expandedEnd.setDate(endBase.getDate() + 1);

    queryParams.startDate = expandedStart.toISOString().split("T")[0];
    queryParams.endDate = expandedEnd.toISOString().split("T")[0];
  }

  // If not admin/manager, only show own entries
  if (!canAdjustTimes) {
    queryParams.employeeId = employeeId;
  }

  // API Queries
  // ✅ Fix: Admin/Manager can fetch data without specific employeeId
  const shouldSkipQuery = !employeeId && !canAdjustTimes;

  const {
    data: timeEntriesData,
    isLoading,
    error,
    refetch,
  } = useGetTimeEntriesQuery(queryParams, {
    skip: shouldSkipQuery, // Only skip if no employeeId AND not admin/manager
    pollingInterval: options.autoRefresh ? 60000 : undefined, // 1 minute
  });

  // Today's entries for quick access
  const { data: todayEntriesData, isLoading: isLoadingToday } =
    useGetEmployeeTodayTimeEntriesQuery({ employeeId }, { skip: !employeeId });

  // Time adjustment mutation
  const [adjustTimeEntry, { isLoading: isAdjusting, error: adjustmentError }] =
    useAdjustTimeEntryMutation();

  // Transform time entries for display with schedule-based date filtering
  const displayEntries: TimeEntryDisplay[] = useMemo(() => {
    if (!timeEntriesData?.data) return [];

    let filteredEntries = timeEntriesData.data;

    // ✅ Schedule time-based filtering (consistent with Live Status approach)
    if (options.defaultFilters?.startDate && options.defaultFilters?.endDate) {
      const startDate = new Date(options.defaultFilters.startDate);
      const endDate = new Date(options.defaultFilters.endDate);

      filteredEntries = filteredEntries.filter(entry => {
        if (!entry.schedule?.startTime) return false;

        // Compare schedule start time by date only (remove time component)
        const scheduleDate = new Date(entry.schedule.startTime);
        const scheduleDateOnly = new Date(scheduleDate.toDateString());
        const startDateOnly = new Date(startDate.toDateString());
        const endDateOnly = new Date(endDate.toDateString());

        return scheduleDateOnly >= startDateOnly && scheduleDateOnly <= endDateOnly;
      });
    }

    return filteredEntries.map(entry => transformTimeEntryForDisplay(entry));
  }, [timeEntriesData, options.defaultFilters]);

  // Today's entries for display
  const todayDisplayEntries: TimeEntryDisplay[] = useMemo(() => {
    if (!todayEntriesData?.data) return [];

    return todayEntriesData.data.map((entry) =>
      transformTimeEntryForDisplay(entry)
    );
  }, [todayEntriesData]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (!displayEntries.length) {
      return {
        totalEntries: 0,
        completedShifts: 0,
        totalHours: 0,
        averageHours: 0,
        overtimeHours: 0,
      };
    }

    const completedEntries = displayEntries.filter(
      (entry) => entry.status === "CLOCKED_OUT"
    );
    const totalHours = completedEntries.reduce(
      (sum, entry) => sum + (entry.totalHours || 0),
      0
    );
    const overtimeEntries = displayEntries.filter((entry) => entry.isOvertime);
    const overtimeHours = overtimeEntries.reduce(
      (sum, entry) => sum + (entry.totalHours || 0),
      0
    );

    return {
      totalEntries: displayEntries.length,
      completedShifts: completedEntries.length,
      totalHours: Number(totalHours.toFixed(2)),
      averageHours:
        completedEntries.length > 0
          ? Number((totalHours / completedEntries.length).toFixed(2))
          : 0,
      overtimeHours: Number(overtimeHours.toFixed(2)),
    };
  }, [displayEntries]);

  // Time adjustment function
  const handleTimeAdjustment = async (
    timeEntryId: string,
    adjustmentData: Omit<TimeAdjustmentRequest, "timeEntryId" | "adjustedBy">
  ) => {
    if (!finalConfig.allowManualAdjustments) {
      toast.error("You don't have permission to adjust time entries");
      return false;
    }

    try {
      const result = await adjustTimeEntry({
        id: timeEntryId,
        data: {
          ...adjustmentData,
          timeEntryId,
          adjustedBy: user?.id || "",
        },
      }).unwrap();

      toast.success("Time Entry Adjusted", {
        description: result.message,
      });

      return true;
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { error?: string } })?.data?.error ||
        "Failed to adjust time entry";

      toast.error("Adjustment Failed", {
        description: errorMessage,
      });

      return false;
    }
  };

  // Filtering functions
  const filterByStatus = (status: TimeEntryStatus) => {
    return displayEntries.filter((entry) => entry.status === status);
  };

  const filterByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return displayEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  };

  const searchEntries = (query: string) => {
    const lowerQuery = query.toLowerCase();

    return displayEntries.filter(
      (entry) =>
        entry.schedulePosition?.toLowerCase().includes(lowerQuery) ||
        entry.date.includes(query) ||
        entry.statusText.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    // Data
    entries: displayEntries,
    rawEntries: timeEntriesData?.data || [],
    todayEntries: todayDisplayEntries,
    pagination: timeEntriesData?.pagination || null,
    summary,
    config: finalConfig,

    // Loading states
    isLoading: isLoading || isLoadingToday,
    isAdjusting,
    error: error || adjustmentError,

    // Operations
    handleTimeAdjustment,
    refetch,

    // Filtering
    filterByStatus,
    filterByDateRange,
    searchEntries,

    // Permissions
    canAdjustTimes: finalConfig.allowManualAdjustments,
  };
}

// Transform TimeEntry to TimeEntryDisplay
function transformTimeEntryForDisplay(entry: TimeEntry): TimeEntryDisplay {
  const statusColor = TIME_ENTRY_STATUS_COLORS[entry.status];

  // Determine if early clock-out (more than 30 minutes before scheduled end)
  let isEarlyClockOut = false;
  if (entry.clockOutTime && entry.scheduledEndTime) {
    const clockOut = new Date(entry.clockOutTime);
    const scheduledEnd = new Date(entry.scheduledEndTime);
    const diffMinutes =
      (scheduledEnd.getTime() - clockOut.getTime()) / (1000 * 60);
    isEarlyClockOut = diffMinutes > 30;
  }

  // Determine if overtime (more than 8 hours worked)
  const isOvertime = (entry.totalHours || 0) > 8;

  // Status text based on status and conditions
  let statusText = entry.status.replace("_", " ");
  if (entry.status === "CLOCKED_OUT") {
    if (isOvertime) statusText = "Completed (OT)";
    else if (isEarlyClockOut) statusText = "Early Clock-out";
    else statusText = "Completed";
  } else if (entry.status === "ADJUSTED") {
    statusText = "Manually Adjusted";
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
