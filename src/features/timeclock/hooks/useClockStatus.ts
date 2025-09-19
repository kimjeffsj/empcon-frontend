import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetTimeEntriesQuery,
  useClockInMutation,
  useClockOutMutation,
} from "@/store/api/timeclockApi";
import { useGetEmployeeSchedulesQuery } from "@/store/api/schedulesApi";
import {
  ClockStatusUIState,
  ClockButtonConfig,
  ClockButtonState,
  ClockNotification,
} from "../types/timeclock.types";
import { LogIn, LogOut, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UseClockStatusOptions {
  employeeId?: string;
  date?: string;
  autoRefresh?: boolean;
  refetchInterval?: number;
}

export function useClockStatus(options: UseClockStatusOptions = {}) {
  const { user } = useSelector((state: RootState) => state.auth);
  const employeeId = options.employeeId || user?.id || "";

  // ✅ Schedule-based API approach (same as Admin page)
  const today = options.date || new Date().toISOString().split('T')[0];

  // 1. Get employee's today schedules
  const {
    data: schedulesData,
    isLoading: schedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useGetEmployeeSchedulesQuery(
    {
      employeeId,
      startDate: today,
      endDate: today,
    },
    {
      skip: !employeeId,
      pollingInterval: options.autoRefresh ? options.refetchInterval || 30000 : undefined,
    }
  );

  // 2. Get employee's today time entries
  const {
    data: timeEntriesData,
    isLoading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useGetTimeEntriesQuery(
    {
      employeeId,
      startDate: today,
      endDate: today,
      limit: 50,
    },
    {
      skip: !employeeId,
      pollingInterval: options.autoRefresh ? options.refetchInterval || 30000 : undefined,
    }
  );

  const isLoading = schedulesLoading || entriesLoading;
  const error = schedulesError || entriesError;

  const refetch = () => {
    refetchSchedules();
    refetchEntries();
  };

  // ✅ Transform combined data to match original ClockStatusResponse structure
  const clockStatusData = useMemo(() => {
    if (!schedulesData?.data || !timeEntriesData?.data) return null;

    const schedules = schedulesData.data;
    const timeEntries = timeEntriesData.data;

    // Find current active time entry
    const currentTimeEntry = timeEntries.find(
      entry => entry.status === "CLOCKED_IN"
    );

    // Transform schedules to include TimeEntry information
    const todaySchedules = schedules.map(schedule => {
      const relatedEntry = timeEntries.find(entry => entry.scheduleId === schedule.id);

      return {
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        position: schedule.position,
        status: relatedEntry?.status || "SCHEDULED", // Add required status field
        canClockIn: !relatedEntry && !currentTimeEntry, // Can clock in if no entry exists and not currently clocked in
        timeEntryId: relatedEntry?.id,
      };
    });

    // Calculate summary
    const completedEntries = timeEntries.filter(entry => entry.status === "CLOCKED_OUT");
    const hoursWorkedToday = completedEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);

    const summary = {
      date: today, // Add required date field
      totalSchedules: schedules.length, // Add required totalSchedules field
      completedShifts: completedEntries.length,
      hoursWorkedToday: Number(hoursWorkedToday.toFixed(2)),
    };

    return {
      employeeId, // Add required employeeId field
      isClocked: !!currentTimeEntry, // Add required isClocked field
      currentTimeEntry,
      todaySchedules,
      summary,
    };
  }, [schedulesData, timeEntriesData]);

  // Mutations
  const [clockIn, { isLoading: isClockingIn, error: clockInError }] =
    useClockInMutation();

  const [clockOut, { isLoading: isClockingOut, error: clockOutError }] =
    useClockOutMutation();

  // Computed State
  const clockStatusUIState: ClockStatusUIState = useMemo(() => {
    const isAnyLoading = isLoading || isClockingIn || isClockingOut;
    const anyError = error || clockInError || clockOutError;

    if (!clockStatusData) {
      return {
        isLoading: isAnyLoading,
        error: anyError ? String(anyError) : null,
        data: null,
        canClockIn: false,
        canClockOut: false,
        activeTimeEntryId: null,
        nextSchedule: null,
      };
    }

    // Find active time entry
    const activeTimeEntry = clockStatusData.currentTimeEntry;

    // Find next available schedule for clock-in
    const availableSchedule = clockStatusData.todaySchedules.find(
      (schedule) => schedule.canClockIn && !schedule.timeEntryId
    );

    // Calculate time until next clock-in is allowed
    const nextSchedule = availableSchedule
      ? {
          id: availableSchedule.id,
          startTime: availableSchedule.startTime,
          position: availableSchedule.position || "Unknown Position",
          timeUntilClockIn: calculateMinutesUntilClockIn(
            availableSchedule.startTime
          ),
        }
      : null;

    return {
      isLoading: isAnyLoading,
      error: anyError ? String(anyError) : null,
      data: clockStatusData,
      canClockIn: !!availableSchedule && !activeTimeEntry,
      canClockOut: !!activeTimeEntry,
      activeTimeEntryId: activeTimeEntry?.id || null,
      nextSchedule,
    };
  }, [
    clockStatusData,
    isLoading,
    isClockingIn,
    isClockingOut,
    error,
    clockInError,
    clockOutError,
  ]);

  // Clock Button Configuration
  const clockButtonConfig: ClockButtonConfig = useMemo(() => {
    if (clockStatusUIState.isLoading) {
      return {
        state: "loading" as ClockButtonState,
        text: "Loading...",
        variant: "outline",
        icon: Loader2,
        disabled: true,
      };
    }

    if (clockStatusUIState.error) {
      return {
        state: "disabled" as ClockButtonState,
        text: "Error",
        variant: "destructive",
        icon: Clock,
        disabled: true,
      };
    }

    if (clockStatusUIState.canClockOut) {
      return {
        state: "clock-out" as ClockButtonState,
        text: "Clock Out",
        variant: "destructive",
        icon: LogOut,
        disabled: false,
      };
    }

    if (clockStatusUIState.canClockIn) {
      return {
        state: "clock-in" as ClockButtonState,
        text: "Clock In",
        variant: "default",
        icon: LogIn,
        disabled: false,
      };
    }

    // No available actions
    return {
      state: "disabled" as ClockButtonState,
      text: clockStatusUIState.nextSchedule
        ? `Available in ${clockStatusUIState.nextSchedule.timeUntilClockIn}m`
        : "No Schedule Available",
      variant: "outline",
      icon: Clock,
      disabled: true,
    };
  }, [clockStatusUIState]);

  // Clock Operations
  const handleClockIn = async (location?: string) => {
    if (!clockStatusUIState.canClockIn || !clockStatusUIState.nextSchedule) {
      toast.error("Cannot clock in at this time");
      return false;
    }

    try {
      const result = await clockIn({
        employeeId,
        scheduleId: clockStatusUIState.nextSchedule.id,
        clockInLocation: location,
      }).unwrap();

      // Show success notification
      const notification: ClockNotification = {
        id: `clock-in-${Date.now()}`,
        type: "success",
        title: "Clocked In Successfully",
        message: result.message,
        duration: 5000,
      };

      toast.success(notification.title, {
        description: notification.message,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to clock in";

      toast.error("Clock In Failed", {
        description: errorMessage,
      });

      return false;
    }
  };

  const handleClockOut = async (location?: string) => {
    if (
      !clockStatusUIState.canClockOut ||
      !clockStatusUIState.activeTimeEntryId
    ) {
      toast.error("Cannot clock out at this time");
      return false;
    }

    try {
      const result = await clockOut({
        timeEntryId: clockStatusUIState.activeTimeEntryId,
        clockOutLocation: location,
      }).unwrap();

      // Show success notification with payroll info
      const notification: ClockNotification = {
        id: `clock-out-${Date.now()}`,
        type: "success",
        title: "Clocked Out Successfully",
        message: `${result.message} - Total Hours: ${result.payrollInfo.finalHours}`,
        duration: 5000,
      };

      toast.success(notification.title, {
        description: notification.message,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to clock out";

      toast.error("Clock Out Failed", {
        description: errorMessage,
      });

      return false;
    }
  };

  // Calculate enhanced summary with scheduledHours (following ClockStatusDashboard pattern)
  const enhancedTodaySummary = useMemo(() => {
    const baseSummary = clockStatusUIState.data?.summary;
    const schedules = clockStatusUIState.data?.todaySchedules;

    if (!baseSummary || !schedules) return null;

    // Calculate total scheduled hours from schedule data
    const scheduledHours = schedules.reduce((total, schedule) => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    return {
      ...baseSummary,
      totalHoursWorked: baseSummary.hoursWorkedToday, // 필드명 통일
      scheduledHours: Number(scheduledHours.toFixed(2)), // 계산된 스케줄 시간
    };
  }, [clockStatusUIState.data]);

  return {
    // State
    clockStatus: clockStatusUIState,
    buttonConfig: clockButtonConfig,

    // Data
    todaySummary: enhancedTodaySummary,
    todaySchedules: clockStatusUIState.data?.todaySchedules || [],
    currentTimeEntry: clockStatusUIState.data?.currentTimeEntry || null,

    // Operations
    handleClockIn,
    handleClockOut,
    refetch,

    // Loading states
    isLoading: clockStatusUIState.isLoading,
    isClockingIn,
    isClockingOut,
  };
}

// Utility function to calculate minutes until clock-in is allowed
function calculateMinutesUntilClockIn(scheduledStartTime: string): number {
  const now = new Date();
  const scheduleStart = new Date(scheduledStartTime);

  // Clock-in allowed 5 minutes before scheduled time
  const clockInTime = new Date(scheduleStart.getTime() - 5 * 60 * 1000);

  const diffMs = clockInTime.getTime() - now.getTime();
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));

  return Math.max(0, diffMinutes);
}
