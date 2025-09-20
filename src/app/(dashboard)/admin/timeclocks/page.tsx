"use client";

import React, { useState } from "react";
import { ClockStatusDashboard } from "@/features/timeclock/components/ClockStatusDashboard";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { DateRange } from "react-day-picker";
import { Users, Clock, RefreshCw, History } from "lucide-react";
import { TimeEntriesTabContent } from "@/features/timeclock/components/TimeEntriesTabContent";

export default function AdminTimeclocksPage() {
  // Initialize with last 7 days as default date range
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from: weekAgo, to: today };
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date range for time entries from DateRangePicker
  // Keep user-selected dates as-is, don't convert to UTC
  const getDateRange = () => {
    if (selectedDateRange?.from && selectedDateRange?.to) {
      const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      return {
        startDate: formatDateForAPI(selectedDateRange.from),
        endDate: formatDateForAPI(selectedDateRange.to),
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

          <ClockStatusDashboard showDetailedView={true} autoRefresh={true} />
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
