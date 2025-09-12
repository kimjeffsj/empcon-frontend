"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
} from "lucide-react";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { useGetSchedulesByDateRangeQuery } from "@/store/api/schedulesApi";
import { formatScheduleTime } from "@/lib/formatter";
import { Schedule } from "@empcon/types";

interface EmployeeScheduleCalendarProps {
  className?: string;
}

export const EmployeeScheduleCalendar = ({
  className = "",
}: EmployeeScheduleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Calculate month range
  const monthRange = useMemo(() => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

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
  }, [currentDate]);

  // Fetch month schedules
  const { data: monthData, isLoading } = useGetSchedulesByDateRangeQuery({
    startDate: monthRange.start,
    endDate: monthRange.end,
  });

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const schedules = monthData?.data || [];
    const grouped: { [key: string]: Schedule[] } = {};

    schedules.forEach((schedule) => {
      const dateKey = new Date(schedule.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });

    return grouped;
  }, [monthData]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const startDate = new Date(monthRange.start);
    const endDate = new Date(monthRange.end);
    const days = [];

    const currentDay = new Date(startDate);
    while (currentDay <= endDate) {
      const daySchedules = schedulesByDate[currentDay.toDateString()] || [];
      days.push({
        date: new Date(currentDay),
        schedules: daySchedules,
        isCurrentMonth: currentDay.getMonth() === currentDate.getMonth(),
        isToday: currentDay.toDateString() === new Date().toDateString(),
      });
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  }, [monthRange, schedulesByDate, currentDate]);

  // Selected date schedules
  const selectedDateSchedules = useMemo(() => {
    if (!selectedDate) return [];
    return schedulesByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, schedulesByDate]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <LoadingIndicator message="Loading calendar..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="font-medium text-lg min-w-[140px] text-center">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <Button variant="ghost" size="sm" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.date)}
                  className={`
                    p-2 h-16 text-left border rounded-md transition-colors
                    ${day.isCurrentMonth ? "text-gray-900" : "text-gray-400"}
                    ${
                      day.isToday
                        ? "bg-blue-50 border-blue-200"
                        : "border-gray-200"
                    }
                    ${
                      selectedDate?.toDateString() === day.date.toDateString()
                        ? "bg-blue-100 border-blue-300"
                        : ""
                    }
                    ${day.schedules.length > 0 ? "bg-green-50" : ""}
                    hover:bg-gray-50
                  `}
                >
                  <div className="font-medium text-sm">
                    {day.date.getDate()}
                  </div>
                  {day.schedules.length > 0 && (
                    <div className="mt-1">
                      <div className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded">
                        {day.schedules.length} shift
                        {day.schedules.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
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
            {selectedDateSchedules.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">
                  No shifts scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {formatScheduleTime(schedule.startTime)} -{" "}
                          {formatScheduleTime(schedule.endTime)}
                        </span>
                      </div>
                      <ScheduleStatusBadge status={schedule.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {schedule.position && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>Location: </span>
                          <Badge variant="secondary">{schedule.position}</Badge>
                        </div>
                      )}

                      {schedule.breakDuration > 0 && (
                        <div className="flex items-center gap-2">
                          <span>Break: {schedule.breakDuration} minutes</span>
                        </div>
                      )}
                    </div>

                    {schedule.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {schedule.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
