"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatsCard } from "@/shared/components/StatsCard";
import {
  Clock,
  Users,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useGetTodayClockStatusQuery } from "@/store/api/timeclockApi";
import {
  EmployeeClockSummary,
  EMPLOYEE_STATUS_COLORS,
} from "../types/timeclock.types";
import { formatTimeDisplay } from "../hooks/useTimeEntries";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { getPacificToday } from "@/shared/utils/dateTime";

interface ClockStatusDashboardProps {
  date?: string;
  showDetailedView?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

export function ClockStatusDashboard({
  date,
  showDetailedView = true,
  autoRefresh = true,
  className = "",
}: ClockStatusDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Always use Pacific Time "today" for consistent results
  const pacificToday = getPacificToday();
  const targetDate = date || pacificToday;
  
  // API Query with polling for real-time updates
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetTodayClockStatusQuery({ date: targetDate }, {
    pollingInterval: autoRefresh ? 60000 : undefined, // 1 minute
  });

  // Transform data for display
  const employeeSummaries: EmployeeClockSummary[] = useMemo(() => {
    if (!dashboardData?.employees) return [];

    return dashboardData.employees.map((emp) => {
      // Determine overall status
      let status: EmployeeClockSummary["currentStatus"];
      let isLate = false;
      let isOvertime = false;

      if (emp.clockStatus.isCurrentlyClocked) {
        status = "IN_PROGRESS";
        isOvertime = emp.summary.workedHours > 8;
      } else if (emp.summary.status === "COMPLETED") {
        status = "COMPLETED";
        isOvertime = emp.summary.workedHours > emp.summary.scheduledHours + 0.5;
      } else if (emp.summary.status === "LATE") {
        status = "LATE";
        isLate = true;
      } else if (emp.summary.status === "OVERTIME") {
        status = "OVERTIME";
        isOvertime = true;
      } else {
        status = "NOT_STARTED";
      }

      return {
        employeeId: emp.employeeId,
        employeeName: `${emp.employee.firstName || ""} ${
          emp.employee.lastName || ""
        }`.trim(),
        employeeNumber: emp.employee.employeeNumber,
        currentStatus: status,
        statusColor: EMPLOYEE_STATUS_COLORS[status],
        clockedIn: emp.clockStatus.isCurrentlyClocked,
        lastClockInTime: emp.clockStatus.currentTimeEntry?.clockInTime,
        todaySchedules: emp.schedules.length,
        completedShifts: emp.schedules.filter((s) => s.status === "COMPLETED")
          .length,
        workedHours: emp.summary.workedHours,
        scheduledHours: emp.summary.scheduledHours,
        isLate,
        isOvertime,
      };
    });
  }, [dashboardData]);

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
    if (!dashboardData) return null;

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
  }, [employeeSummaries, dashboardData]);

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
                width: "w-[150px]"
              }
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

// Individual employee status card component
interface EmployeeStatusCardProps {
  employee: EmployeeClockSummary;
  showDetailed: boolean;
}

function EmployeeStatusCard({
  employee,
}: EmployeeStatusCardProps) {
  return (
    <Card
      className="border-l-4"
      style={{ borderLeftColor: employee.statusColor }}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Employee Info */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{employee.employeeName}</h4>
              {employee.employeeNumber && (
                <p className="text-xs text-gray-500">
                  #{employee.employeeNumber}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className="text-xs"
              style={{
                color: employee.statusColor,
                borderColor: employee.statusColor,
              }}
            >
              {employee.currentStatus.replace("_", " ")}
            </Badge>
          </div>

          {/* Status Details */}
          {employee.clockedIn && employee.lastClockInTime && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>
                Clocked in at{" "}
                {formatTimeDisplay(employee.lastClockInTime).time12}
              </p>
            </div>
          )}

          {/* Hours Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Hours Today</p>
              <p className="font-medium">{employee.workedHours}h</p>
            </div>
            <div>
              <p className="text-gray-500">Scheduled</p>
              <p className="font-medium">{employee.scheduledHours}h</p>
            </div>
          </div>

          {/* Warnings */}
          <div className="flex space-x-1">
            {employee.isLate && (
              <Badge variant="destructive" className="text-xs">
                Late
              </Badge>
            )}
            {employee.isOvertime && (
              <Badge
                variant="outline"
                className="text-xs text-amber-600 border-amber-600"
              >
                OT
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
