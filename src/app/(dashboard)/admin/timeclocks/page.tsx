"use client";

import React, { useState } from "react";
import { ClockStatusDashboard } from "@/features/timeclock/components/ClockStatusDashboard";
import { TimeEntryList } from "@/features/timeclock/components/TimeEntryList";
import { TimeSummaryStats } from "@/features/timeclock/components/TimeSummaryStats";
import { useTimeEntries } from "@/features/timeclock/hooks/useTimeEntries";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { DateRange } from "react-day-picker";
import { Users, Clock, RefreshCw, History } from "lucide-react";

export default function AdminTimeclocksPage() {
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date range for time entries from DateRangePicker
  const getDateRange = () => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      return {
        startDate: selectedDateRange.from.toISOString().split("T")[0],
        endDate: selectedDateRange.to.toISOString().split("T")[0],
      };
    }
    return undefined;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // This will be handled by the individual components' refetch functions
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <Clock className="h-6 w-6" />
            <span>Time Clock Management</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor employee time tracking, review entries, and manage time
            adjustments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="live-status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="live-status"
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Live Status</span>
          </TabsTrigger>
          <TabsTrigger
            value="time-entries"
            className="flex items-center space-x-2"
          >
            <History className="h-4 w-4" />
            <span>Time Entries</span>
          </TabsTrigger>
        </TabsList>

        {/* Live Status Tab */}
        <TabsContent value="live-status" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Real-time Employee Status</h2>
          </div>

          <ClockStatusDashboard
            date={undefined} // Live Status shows Pacific Time "today"
            showDetailedView={true}
            autoRefresh={true}
          />
        </TabsContent>

        {/* Time Entries Tab */}
        <TabsContent value="time-entries" className="space-y-6">
          <TimeEntriesTabContent
            dateRange={getDateRange()}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Separate component for Time Entries tab content
interface TimeEntriesTabContentProps {
  dateRange: { startDate: string; endDate: string } | undefined;
  selectedDateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

function TimeEntriesTabContent({
  dateRange,
  selectedDateRange,
  onDateRangeChange,
}: TimeEntriesTabContentProps) {
  // Local filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Get time entries data and summary using the hook
  const { summary, isLoading: isLoadingSummary } = useTimeEntries({
    employeeId: undefined, // Admin view - all employees
    defaultFilters: dateRange
      ? {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }
      : undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">All Employee Time Entries</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review, search, and adjust employee time entries across all departments
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, employee ID, or department..."
        showDateRange={true}
        dateRange={selectedDateRange}
        onDateRangeChange={onDateRangeChange}
        dateRangePlaceholder="Select date range"
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "ALL", label: "All Status" },
              { value: "CLOCKED_IN", label: "Clocked In" },
              { value: "CLOCKED_OUT", label: "Clocked Out" },
              { value: "ADJUSTED", label: "Adjusted" },
            ],
            placeholder: "Filter by status",
            width: "w-[140px]"
          }
        ]}
      />

      {/* Statistics Cards */}
      <TimeSummaryStats summary={summary} isLoading={isLoadingSummary} />

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Time Entries
            {!isLoadingSummary && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({summary.totalEntries} entries found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryList
            dateRange={dateRange}
            showEmployeeInfo={true} // Show employee info for admin view
            allowManualAdjustments={true} // Allow time adjustments
            className="border-none shadow-none"
          />
        </CardContent>
      </Card>
    </div>
  );
}
