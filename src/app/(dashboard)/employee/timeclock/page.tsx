"use client";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ClockInOutButton } from "@/features/timeclock/components/ClockInOutButton";
import { ClockStatusCard } from "@/features/timeclock/components/ClockStatusCard";
import { TimeEntryList } from "@/features/timeclock/components/TimeEntryList";
import { TimeSummaryStats } from "@/features/timeclock/components/TimeSummaryStats";
import { useTimeEntries } from "@/features/timeclock/hooks/useTimeEntries";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { DateRange } from "react-day-picker";
import { Clock, History, TrendingUp } from "lucide-react";
import { getPacificToday } from "@/shared/utils/dateTime";

export default function EmployeeTimeclockPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [historyDateRange, setHistoryDateRange] = useState<
    DateRange | undefined
  >();
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("ALL");

  // Calculate this week's date range (Pacific Time based)
  const getThisWeekDateRange = () => {
    const todayPacific = getPacificToday(); // "2025-09-19"
    const today = new Date(todayPacific + "T00:00:00"); // Avoid timezone conversion

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

    const formatDateForAPI = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDateForAPI(weekStart),
      endDate: formatDateForAPI(weekEnd),
    };
  };

  // Calculate history date range from DateRangePicker
  // Keep user-selected dates as-is, don't convert to UTC
  const getHistoryDateRange = () => {
    if (historyDateRange?.from && historyDateRange?.to) {
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      return {
        startDate: formatDateForAPI(historyDateRange.from),
        endDate: formatDateForAPI(historyDateRange.to),
      };
    }
    return undefined;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Time Clock</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || "Employee"}! Track your work hours
            and view your time entries.
          </p>
        </div>

        <Badge variant="outline" className="px-3 py-1">
          <Clock className="h-3 w-3 mr-1" />
          Today: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Main Clock Section - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock In/Out Controls */}
        <div className="space-y-6">
          <ClockInOutButton
            showLocation={true}
            showNextSchedule={true}
            className="w-full"
          />
        </div>

        {/* Current Status */}
        <div className="space-y-6">
          <ClockStatusCard showDetailedStats={true} className="w-full" />
        </div>
      </div>

      {/* Time Clock Tabs */}
      <Tabs defaultValue="this-week" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="this-week"
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>This Week&apos;s TimeClocks</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        {/* This Week Tab */}
        <TabsContent value="this-week" className="space-y-6">
          <ThisWeekTabContent
            employeeId={user?.id}
            dateRange={getThisWeekDateRange()}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Work History</h2>
              <p className="text-sm text-muted-foreground">
                Browse your past time entries and work records
              </p>
            </div>

            {/* Integrated Filter Bar */}
            <SearchFilter
              searchTerm={historySearchQuery}
              onSearchChange={setHistorySearchQuery}
              placeholder="Search your work history..."
              showDateRange={true}
              dateRange={historyDateRange}
              onDateRangeChange={setHistoryDateRange}
              dateRangePlaceholder="Select date range"
              filters={[
                {
                  value: historyStatusFilter,
                  onChange: setHistoryStatusFilter,
                  options: [
                    { value: "ALL", label: "All Status" },
                    { value: "CLOCKED_IN", label: "Clocked In" },
                    { value: "CLOCKED_OUT", label: "Completed" },
                    { value: "ADJUSTED", label: "Adjusted" },
                  ],
                  placeholder: "Filter by status",
                  width: "w-[130px]",
                },
              ]}
            />

            {/* Time Entries Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Time Entries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TimeEntryList
                  employeeId={user?.id}
                  dateRange={getHistoryDateRange()}
                  searchQuery={historySearchQuery}
                  statusFilter={historyStatusFilter}
                  showEmployeeInfo={false}
                  allowManualAdjustments={false}
                  className="border-none shadow-none"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for This Week tab content
interface ThisWeekTabContentProps {
  employeeId: string | undefined;
  dateRange: { startDate: string; endDate: string };
}

function ThisWeekTabContent({
  employeeId,
  dateRange,
}: ThisWeekTabContentProps) {
  // Get time entries data and summary using the hook
  const { summary, isLoading: isLoadingSummary } = useTimeEntries({
    employeeId,
    defaultFilters: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">This Week&apos;s Work Summary</h2>
        <p className="text-sm text-muted-foreground">
          Your current week time entries and progress
        </p>
      </div>

      {/* Summary Statistics */}
      <TimeSummaryStats summary={summary} isLoading={isLoadingSummary} />

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            This Week&apos;s Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryList
            employeeId={employeeId}
            dateRange={dateRange}
            showEmployeeInfo={false}
            allowManualAdjustments={false}
            className="border-none shadow-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
