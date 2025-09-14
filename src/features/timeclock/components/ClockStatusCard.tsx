"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { useClockStatus } from "../hooks/useClockStatus";
import { formatTimeDisplay } from "../hooks/useTimeEntries";
import { ClockStatusCardData, CLOCK_STATUS_COLORS } from "../types/timeclock.types";

interface ClockStatusCardProps {
  employeeId?: string;
  showEmployeeInfo?: boolean;
  showDetailedStats?: boolean;
  variant?: "default" | "compact" | "dashboard";
  className?: string;
}

export function ClockStatusCard({
  employeeId,
  showEmployeeInfo = false,
  showDetailedStats = true,
  variant = "default",
  className = "",
}: ClockStatusCardProps) {
  const {
    clockStatus,
    todaySummary,
    currentTimeEntry,
    todaySchedules,
    isLoading,
  } = useClockStatus({
    employeeId,
    autoRefresh: true,
    refetchInterval: 60000, // 1 minute
  });

  if (isLoading || !clockStatus.data) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  // Calculate status information
  const statusData = calculateStatusData(clockStatus, todaySummary, currentTimeEntry, todaySchedules);

  if (variant === "compact") {
    return (
      <Card className={`${className} border-l-4`} style={{ borderLeftColor: getStatusColor(statusData.currentStatus) }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(statusData.currentStatus)}
              <div>
                <p className="font-medium text-sm">{statusData.statusText}</p>
                {statusData.lastActionTime && (
                  <p className="text-xs text-gray-500">
                    {formatTimeDisplay(statusData.lastActionTime).relative}
                  </p>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ color: getStatusColor(statusData.currentStatus) }}
            >
              {statusData.todayHours}h
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "dashboard") {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(statusData.currentStatus) }}
              />
            </div>
            <div className="flex-1 min-w-0">
              {showEmployeeInfo && (
                <p className="text-sm font-medium truncate">
                  {statusData.employeeName}
                </p>
              )}
              <p className="text-xs text-gray-500 truncate">
                {statusData.statusText}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{statusData.todayHours}h</p>
              <p className="text-xs text-gray-500">
                of {statusData.scheduledHours}h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Clock Status</span>
          </CardTitle>
          <Badge 
            variant="outline"
            className="px-3 py-1"
            style={{ 
              color: getStatusColor(statusData.currentStatus),
              borderColor: getStatusColor(statusData.currentStatus),
            }}
          >
            {statusData.statusText}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status Details */}
        <div className="space-y-3">
          {currentTimeEntry ? (
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <LogIn className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Clocked in at {formatTimeDisplay(currentTimeEntry.clockInTime).time12}
                </p>
                {currentTimeEntry.schedule?.position && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Position: {currentTimeEntry.schedule.position}
                  </p>
                )}
                {currentTimeEntry.gracePeriodApplied && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Grace period applied
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
              <LogOut className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currently clocked out
                </p>
                {statusData.nextSchedule && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Next: {statusData.nextSchedule.position} at {statusData.nextSchedule.time}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Today's Statistics */}
        {showDetailedStats && todaySummary && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Hours Worked</span>
              </div>
              <p className="text-2xl font-bold">
                {statusData.todayHours}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {statusData.scheduledHours}h
                </span>
              </p>
              {statusData.remainingHours > 0 && (
                <p className="text-xs text-gray-500">
                  {statusData.remainingHours}h remaining
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Schedules</span>
              </div>
              <p className="text-2xl font-bold">
                {todaySummary.completedShifts}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {todaySummary.totalSchedules}
                </span>
              </p>
              <div className="flex items-center space-x-1">
                {todaySummary.completedShifts === todaySummary.totalSchedules ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600">All completed</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600">In progress</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overtime Warning */}
        {statusData.todayHours > 8 && (
          <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Overtime: {(statusData.todayHours - 8).toFixed(1)} hours
            </span>
          </div>
        )}

        {/* Error Display */}
        {clockStatus.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              {clockStatus.error}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function calculateStatusData(
  clockStatus: any,
  todaySummary: any,
  currentTimeEntry: any,
  todaySchedules: any[]
): ClockStatusCardData {
  const isClocked = !!currentTimeEntry;
  const todayHours = todaySummary?.totalHoursWorked || 0;
  const scheduledHours = todaySummary?.scheduledHours || 0;
  const completedShifts = todaySummary?.completedShifts || 0;
  const totalSchedules = todaySummary?.totalSchedules || 0;

  let currentStatus: ClockStatusCardData["currentStatus"];
  let statusText: string;

  if (isClocked) {
    currentStatus = "CLOCKED_IN";
    statusText = "Clocked In";
  } else if (completedShifts === totalSchedules && totalSchedules > 0) {
    currentStatus = "CLOCKED_OUT";
    statusText = "All Shifts Complete";
  } else if (totalSchedules === 0) {
    currentStatus = "NOT_CLOCKED";
    statusText = "No Schedules Today";
  } else {
    currentStatus = "NOT_CLOCKED";
    statusText = "Ready to Clock In";
  }

  // Find next schedule
  const nextSchedule = todaySchedules.find(schedule => schedule.canClockIn);

  return {
    employeeName: clockStatus.data?.employee?.firstName || "Employee",
    employeeNumber: clockStatus.data?.employee?.employeeNumber,
    currentStatus,
    statusText,
    statusColor: CLOCK_STATUS_COLORS[currentStatus],
    lastActionTime: currentTimeEntry?.clockInTime,
    todayHours,
    scheduledHours,
    remainingHours: Math.max(0, scheduledHours - todayHours),
    nextSchedule: nextSchedule ? {
      time: formatTimeDisplay(nextSchedule.startTime).time12,
      position: nextSchedule.position || "Unknown Position",
    } : undefined,
  };
}

function getStatusColor(status: ClockStatusCardData["currentStatus"]): string {
  const colors = {
    NOT_CLOCKED: "#6b7280", // gray-500
    CLOCKED_IN: "#10b981",  // emerald-500
    ON_BREAK: "#f59e0b",    // amber-500
    CLOCKED_OUT: "#3b82f6", // blue-500
  };
  return colors[status];
}

function getStatusIcon(status: ClockStatusCardData["currentStatus"]) {
  const iconProps = { className: "h-4 w-4" };
  
  switch (status) {
    case "CLOCKED_IN":
      return <LogIn {...iconProps} style={{ color: getStatusColor(status) }} />;
    case "CLOCKED_OUT":
      return <LogOut {...iconProps} style={{ color: getStatusColor(status) }} />;
    case "ON_BREAK":
      return <Timer {...iconProps} style={{ color: getStatusColor(status) }} />;
    default:
      return <Clock {...iconProps} style={{ color: getStatusColor(status) }} />;
  }
}