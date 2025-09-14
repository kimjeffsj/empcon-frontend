"use client";

import { useMemo, useState } from "react";
import { EmployeeScheduleHeader } from "@/features/schedules/components/EmployeeScheduleHeader";
import { ScheduleCalendar } from "@/features/schedules/components/ScheduleCalendar";
import { ScheduleTable } from "@/shared/components/ScheduleTable";
import { useGetSchedulesByDateRangeQuery } from "@/store/api/schedulesApi";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Calendar } from "lucide-react";
import { Schedule } from "@empcon/types";

export default function EmployeeSchedulePage() {
  // Selected date state management
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<
    Schedule[]
  >([]);

  // Calculate current month range for calendar
  const monthRange = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Add buffer for partial weeks
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay()); // Go back to Sunday

    const endDate = new Date(endOfMonth);
    const remainingDays = 6 - endOfMonth.getDay();
    endDate.setDate(endDate.getDate() + remainingDays); // Go forward to Saturday

    return {
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Fetch schedules for the current month
  const {
    data: schedulesData,
    isLoading,
    error,
    refetch,
  } = useGetSchedulesByDateRangeQuery({
    startDate: monthRange.start,
    endDate: monthRange.end,
  });

  const schedules = schedulesData?.data || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <LoadingIndicator message="Loading your schedule..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <ErrorMessage
          title="Failed to Load Schedule"
          message="Unable to fetch your schedule data. Please check your connection and try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with 4 Core Stats */}
      <EmployeeScheduleHeader />

      {/* Monthly Calendar View */}
      <ScheduleCalendar
        schedules={schedules}
        readOnly={true}
        onDateSelect={(date, daySchedules) => {
          setSelectedDate(date);
          setSelectedDateSchedules(daySchedules);
        }}
      />

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Schedule for{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <Badge variant="secondary">
                {selectedDateSchedules.length} shift
                {selectedDateSchedules.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduleTable
              schedules={selectedDateSchedules}
              showDateColumn={false}
              hideActions={false} // Show actions for employee (Request Leave)
              readOnly={true} // Employee mode
              onRequestLeave={(schedule) => {
                // Handle leave request - could open leave request modal
                console.log("Request leave for schedule:", schedule);
                // TODO: Implement leave request functionality
              }}
              emptyMessage="No shifts scheduled for this date"
              emptyDescription="You have no scheduled shifts for this date"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
