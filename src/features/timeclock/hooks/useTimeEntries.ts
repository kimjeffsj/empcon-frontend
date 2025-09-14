import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetTimeEntriesQuery,
  useGetEmployeeTodayTimeEntriesQuery,
  useGetEmployeeTimeEntriesByRangeQuery,
  useAdjustTimeEntryMutation,
} from "@/store/api/timeclockApi";
import {
  GetTimeEntriesParams,
  TimeEntry,
  TimeEntryStatus,
  TimeAdjustmentRequest,
} from "@empcon/types";
import {
  TimeEntryDisplay,
  TimeEntryListConfig,
  TimeDisplay,
  TIME_ENTRY_STATUS_COLORS,
} from "../types/timeclock.types";
import { toast } from "sonner";
import { formatPacificTime, formatPacificDate } from "@/shared/utils/dateTime";

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

  // Build query parameters
  const queryParams: Partial<GetTimeEntriesParams> = {
    ...options.defaultFilters,
    limit: config.itemsPerPage,
  };

  // If not admin/manager, only show own entries
  if (!canAdjustTimes) {
    queryParams.employeeId = employeeId;
  }

  // API Queries
  const {
    data: timeEntriesData,
    isLoading,
    error,
    refetch,
  } = useGetTimeEntriesQuery(queryParams, {
    skip: !employeeId,
    pollingInterval: options.autoRefresh ? 60000 : undefined, // 1 minute
  });

  // Today's entries for quick access
  const {
    data: todayEntriesData,
    isLoading: isLoadingToday,
  } = useGetEmployeeTodayTimeEntriesQuery(
    { employeeId },
    { skip: !employeeId }
  );

  // Time adjustment mutation
  const [
    adjustTimeEntry,
    {
      isLoading: isAdjusting,
      error: adjustmentError,
    },
  ] = useAdjustTimeEntryMutation();

  // Transform time entries for display
  const displayEntries: TimeEntryDisplay[] = useMemo(() => {
    if (!timeEntriesData?.data) return [];

    return timeEntriesData.data.map((entry) => transformTimeEntryForDisplay(entry));
  }, [timeEntriesData]);

  // Today's entries for display
  const todayDisplayEntries: TimeEntryDisplay[] = useMemo(() => {
    if (!todayEntriesData?.data) return [];

    return todayEntriesData.data.map((entry) => transformTimeEntryForDisplay(entry));
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

    const completedEntries = displayEntries.filter(entry => entry.status === "CLOCKED_OUT");
    const totalHours = completedEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const overtimeEntries = displayEntries.filter(entry => entry.isOvertime);
    const overtimeHours = overtimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    return {
      totalEntries: displayEntries.length,
      completedShifts: completedEntries.length,
      totalHours: Number(totalHours.toFixed(2)),
      averageHours: completedEntries.length > 0 ? Number((totalHours / completedEntries.length).toFixed(2)) : 0,
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
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to adjust time entry";
      
      toast.error("Adjustment Failed", {
        description: errorMessage,
      });

      return false;
    }
  };

  // Filtering functions
  const filterByStatus = (status: TimeEntryStatus) => {
    return displayEntries.filter(entry => entry.status === status);
  };

  const filterByDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return displayEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
  };

  const searchEntries = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    return displayEntries.filter(entry => 
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
    const diffMinutes = (scheduledEnd.getTime() - clockOut.getTime()) / (1000 * 60);
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
    date: formatDateForDisplay(entry.clockInTime),
    schedulePosition: entry.schedule?.position,
    clockInTime: formatTimeForDisplay(entry.clockInTime),
    clockOutTime: entry.clockOutTime ? formatTimeForDisplay(entry.clockOutTime) : undefined,
    adjustedStartTime: entry.adjustedStartTime ? formatTimeForDisplay(entry.adjustedStartTime) : undefined,
    adjustedEndTime: entry.adjustedEndTime ? formatTimeForDisplay(entry.adjustedEndTime) : undefined,
    totalHours: entry.totalHours,
    status: entry.status,
    statusColor,
    statusText,
    gracePeriodApplied: entry.gracePeriodApplied,
    isEarlyClockOut,
    isOvertime,
  };
}

// Utility functions for time formatting - now using Pacific Time
export function formatTimeForDisplay(isoString: string): string {
  return formatPacificTime(isoString);
}

export function formatDateForDisplay(isoString: string): string {
  return formatPacificDate(isoString);
}

export function formatTimeDisplay(isoString: string): TimeDisplay {
  const date = new Date(isoString);
  const now = new Date();
  
  return {
    time12: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    time24: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    dateTime: date.toLocaleString([], { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    relative: getRelativeTime(date, now),
  };
}

function getRelativeTime(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}