"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatsCard } from "@/shared/components/StatsCard";
import {
  Clock,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useGetTimeEntriesQuery } from "@/store/api/timeclockApi";
import { useGetTodayRosterQuery } from "@/store/api/schedulesApi";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { EmployeeStatusCard } from "./EmployeeStatusCard";
import { EMPLOYEE_STATUS_COLORS, EmployeeClockSummary } from "@empcon/types";

interface ClockStatusDashboardProps {
  showDetailedView?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export function ClockStatusDashboard({
  showDetailedView = true,
  autoRefresh = true,
  className = "",
}: ClockStatusDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // ✅ Option A: Combine Schedule + TimeEntry APIs
  // 1. Get all today's scheduled employees
  const {
    data: rosterData,
    isLoading: rosterLoading,
    error: rosterError,
    refetch: refetchRoster,
  } = useGetTodayRosterQuery(undefined, {
    pollingInterval: autoRefresh ? 30000 : undefined,
  });

  // 2. Get all today's time entries
  const today = new Date().toISOString().split('T')[0];
  const {
    data: timeEntriesData,
    isLoading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useGetTimeEntriesQuery({
    startDate: today,
    endDate: today,
    limit: 100,
  }, {
    pollingInterval: autoRefresh ? 30000 : undefined,
  });

  const isLoading = rosterLoading || entriesLoading;
  const error = rosterError || entriesError;

  const refetch = () => {
    refetchRoster();
    refetchEntries();
  };

  // ✅ Transform Schedule data for Live Status display
  const employeeSummaries: EmployeeClockSummary[] = useMemo(() => {
    if (!rosterData?.schedules || !timeEntriesData?.data) return [];

    // Helper function to calculate schedule hours
    const calculateScheduleHours = (startTime: string, endTime: string): number => {
      const start = new Date(startTime);
      const end = new Date(endTime);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    };

    // Process each scheduled employee
    return rosterData.schedules.map(schedule => {
      // Find related time entries for this schedule
      const relatedEntries = timeEntriesData.data.filter(
        entry => entry.scheduleId === schedule.id
      );

      // Find current clocked-in entry
      const currentEntry = relatedEntries.find(
        entry => entry.status === "CLOCKED_IN"
      );

      // Find completed entries
      const completedEntries = relatedEntries.filter(
        entry => entry.status === "CLOCKED_OUT"
      );

      // Calculate worked hours
      const workedHours = completedEntries.reduce(
        (sum, entry) => sum + (entry.totalHours || 0),
        0
      );

      // Calculate basic statistics
      const isCurrentlyClocked = !!currentEntry;
      const completedShifts = completedEntries.length;
      const isOvertime = workedHours > 8;
      const scheduledHours = calculateScheduleHours(schedule.startTime, schedule.endTime);

      // Determine status
      let status: EmployeeClockSummary["currentStatus"];
      if (isCurrentlyClocked) {
        status = isOvertime ? "OVERTIME" : "IN_PROGRESS";
      } else if (completedShifts > 0) {
        status = isOvertime ? "OVERTIME" : "COMPLETED";
      } else {
        status = "NOT_STARTED"; // ⭐ Key: Shows employees who haven't clocked in yet
      }

      return {
        employeeId: schedule.employee.id,
        employeeName: `${schedule.employee.firstName} ${schedule.employee.lastName}`.trim(),
        employeeNumber: schedule.employee.employeeNumber,
        currentStatus: status,
        statusColor: EMPLOYEE_STATUS_COLORS[status],
        clockedIn: isCurrentlyClocked,
        lastClockInTime: currentEntry?.clockInTime,
        todaySchedules: 1, // One schedule per employee in this view
        completedShifts,
        workedHours: Number(workedHours.toFixed(2)),
        scheduledHours: Number(scheduledHours.toFixed(2)),
        isLate: false, // TODO: Calculate based on schedule vs actual clock-in time
        isOvertime,

        // ✅ UX improvement fields
        scheduledStart: schedule.startTime,
        scheduledEnd: schedule.endTime,
        actualClockInTime: currentEntry?.clockInTime,
        actualClockOutTime: completedEntries[0]?.clockOutTime,
        gracePeriodApplied: currentEntry?.gracePeriodApplied,
      };
    });
  }, [rosterData, timeEntriesData]);

  // Apply filters
  const filteredEmployees = useMemo(() => {
    let filtered = employeeSummaries;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (emp) =>
          emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.employeeNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((emp) => {
        switch (statusFilter) {
          case "CLOCKED_IN":
            return emp.clockedIn;
          case "COMPLETED":
            return emp.currentStatus === "COMPLETED";
          case "LATE":
            return emp.isLate;
          case "OVERTIME":
            return emp.isOvertime;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [employeeSummaries, searchQuery, statusFilter]);

  // Calculate dashboard summary
  const dashboardSummary = useMemo(() => {
    if (employeeSummaries.length === 0) return null;

    const totalEmployees = employeeSummaries.length;
    const clockedInCount = employeeSummaries.filter(
      (emp) => emp.clockedIn
    ).length;
    const completedCount = employeeSummaries.filter(
      (emp) => emp.currentStatus === "COMPLETED"
    ).length;
    const lateCount = employeeSummaries.filter((emp) => emp.isLate).length;
    const overtimeCount = employeeSummaries.filter(
      (emp) => emp.isOvertime
    ).length;

    return {
      totalEmployees,
      clockedInCount,
      completedCount,
      lateCount,
      overtimeCount,
      attendanceRate:
        totalEmployees > 0
          ? Math.round(
              ((clockedInCount + completedCount) / totalEmployees) * 100
            )
          : 0,
    };
  }, [employeeSummaries]);

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Employee List Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-200">
                Failed to load dashboard data
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {String(error)}
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Summary Cards */}
      {dashboardSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={dashboardSummary.totalEmployees.toString()}
            change={`${dashboardSummary.attendanceRate}% attendance`}
            changeType="neutral"
            icon={Users}
          />

          <StatsCard
            title="Currently Clocked In"
            value={dashboardSummary.clockedInCount.toString()}
            change={`${Math.round(
              (dashboardSummary.clockedInCount /
                dashboardSummary.totalEmployees) *
                100
            )}% active`}
            changeType="positive"
            icon={Clock}
          />

          <StatsCard
            title="Completed Shifts"
            value={dashboardSummary.completedCount.toString()}
            change={`${Math.round(
              (dashboardSummary.completedCount /
                dashboardSummary.totalEmployees) *
                100
            )}% done`}
            changeType="positive"
            icon={CheckCircle2}
          />

          <StatsCard
            title="Late/Overtime"
            value={(
              dashboardSummary.lateCount + dashboardSummary.overtimeCount
            ).toString()}
            change={`${dashboardSummary.lateCount} late, ${dashboardSummary.overtimeCount} OT`}
            changeType={dashboardSummary.lateCount > 0 ? "negative" : "neutral"}
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Employee Status List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg font-semibold">
                Employee Status ({filteredEmployees.length} employees)
              </CardTitle>
              {/* <Badge variant="outline" className="px-2 py-1"> */}
              {/* ({filteredEmployees.length} employees) */}
              {/* </Badge> */}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <SearchFilter
            searchTerm={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search employees..."
            filters={[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: "ALL", label: "All Status" },
                  { value: "CLOCKED_IN", label: "Clocked In" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "LATE", label: "Late" },
                  { value: "OVERTIME", label: "Overtime" },
                ],
                placeholder: "Filter by status",
                width: "w-[150px]",
              },
            ]}
          />
        </CardHeader>

        <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No employees found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map((employee) => (
                <EmployeeStatusCard
                  key={employee.employeeId}
                  employee={employee}
                  showDetailed={showDetailedView}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
