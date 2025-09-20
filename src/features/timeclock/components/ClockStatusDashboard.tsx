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
import { EmployeeClockSummary } from "@empcon/types";
import { filterByClientTimezoneToday, getPacificToday } from "@/shared/utils/dateTime";
import {
  combineSchedulesWithTimeEntries,
  calculateDashboardSummary,
} from "@/shared/mappers";

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

  // 2. Get all today's time entries (use Pacific Time "today")
  const today = getPacificToday();
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

  // Transform Schedule and TimeEntry data using shared mapper
  const employeeSummaries: EmployeeClockSummary[] = useMemo(() => {
    if (!rosterData?.schedules || !timeEntriesData?.data) return [];

    // Apply client timezone filtering (same as TodayRoster)
    const todaySchedules = filterByClientTimezoneToday(rosterData.schedules);

    // Use shared mapper to combine schedules with time entries
    return combineSchedulesWithTimeEntries(todaySchedules, timeEntriesData.data);
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

  // Calculate dashboard summary using shared mapper
  const dashboardSummary = useMemo(() => {
    return calculateDashboardSummary(employeeSummaries);
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
