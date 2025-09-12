"use client";

import { useMemo } from "react";
import { Calendar, Clock, TrendingUp, CheckCircle } from "lucide-react";
import { StatsCard } from "@/shared/components/StatsCard";
import { useGetSchedulesByDateRangeQuery } from "@/store/api/schedulesApi";
import { LoadingIndicator } from "@/shared/components/Loading";
import { formatScheduleTime } from "@/lib/formatter";

interface EmployeeScheduleHeaderProps {
  className?: string;
}

export const EmployeeScheduleHeader = ({
  className = "",
}: EmployeeScheduleHeaderProps) => {
  // Calculate date ranges
  const dateRanges = useMemo(() => {
    const now = new Date();

    // Today
    const today = {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999
      ),
    };

    // This week (Sunday to Saturday)
    const thisWeek = {
      start: new Date(now),
      end: new Date(now),
    };
    thisWeek.start.setDate(now.getDate() - now.getDay());
    thisWeek.start.setHours(0, 0, 0, 0);
    thisWeek.end.setDate(thisWeek.start.getDate() + 6);
    thisWeek.end.setHours(23, 59, 59, 999);

    // This month
    const thisMonth = {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };

    // Next 30 days (for finding next shift)
    const next30Days = {
      start: now,
      end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    };

    return {
      today: {
        start: today.start.toISOString().split("T")[0],
        end: today.end.toISOString().split("T")[0],
      },
      thisWeek: {
        start: thisWeek.start.toISOString().split("T")[0],
        end: thisWeek.end.toISOString().split("T")[0],
      },
      thisMonth: {
        start: thisMonth.start.toISOString().split("T")[0],
        end: thisMonth.end.toISOString().split("T")[0],
      },
      next30Days: {
        start: next30Days.start.toISOString().split("T")[0],
        end: next30Days.end.toISOString().split("T")[0],
      },
    };
  }, []);

  // Fetch schedules for different time periods
  const { data: todayData, isLoading: todayLoading } =
    useGetSchedulesByDateRangeQuery({
      startDate: dateRanges.today.start,
      endDate: dateRanges.today.end,
    });

  const { data: weekData, isLoading: weekLoading } =
    useGetSchedulesByDateRangeQuery({
      startDate: dateRanges.thisWeek.start,
      endDate: dateRanges.thisWeek.end,
    });

  const { data: monthData, isLoading: monthLoading } =
    useGetSchedulesByDateRangeQuery({
      startDate: dateRanges.thisMonth.start,
      endDate: dateRanges.thisMonth.end,
    });

  const { data: nextShiftsData, isLoading: nextShiftsLoading } =
    useGetSchedulesByDateRangeQuery({
      startDate: dateRanges.next30Days.start,
      endDate: dateRanges.next30Days.end,
    });

  // Calculate stats
  const stats = useMemo(() => {
    const todaySchedules = todayData?.data || [];
    const weekSchedules = weekData?.data || [];
    const monthSchedules = monthData?.data || [];
    const upcomingSchedules = nextShiftsData?.data || [];

    // Today's Shift
    const todayShift = todaySchedules[0];
    const todayShiftText = todayShift
      ? `${formatScheduleTime(todayShift.startTime)} - ${formatScheduleTime(
          todayShift.endTime
        )}`
      : "No shift today";

    // This Week Hours
    const weekHours = weekSchedules.reduce((total, schedule) => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const breakHours = (schedule.breakDuration || 0) / 60;
      return total + hours - breakHours;
    }, 0);

    // Next Shift
    const now = new Date();
    const nextShift = upcomingSchedules
      .filter((schedule) => new Date(schedule.startTime) > now)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )[0];

    const nextShiftText = nextShift
      ? (() => {
          const nextDate = new Date(nextShift.startTime);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          if (nextDate.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow ${formatScheduleTime(nextShift.startTime)}`;
          } else {
            return `${nextDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} ${formatScheduleTime(nextShift.startTime)}`;
          }
        })()
      : "No upcoming shifts";

    // Monthly Hours
    const monthHours = monthSchedules.reduce((total, schedule) => {
      const start = new Date(schedule.startTime);
      const end = new Date(schedule.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const breakHours = (schedule.breakDuration || 0) / 60;
      return total + hours - breakHours;
    }, 0);

    return {
      todayShift: todayShiftText,
      weekHours: `${Math.round(weekHours * 10) / 10}h`,
      nextShift: nextShiftText,
      monthHours: `${Math.round(monthHours * 10) / 10}h`,
    };
  }, [todayData, weekData, monthData, nextShiftsData]);

  const isLoading =
    todayLoading || weekLoading || monthLoading || nextShiftsLoading;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-600 mt-1">
            View your work schedule and upcoming shifts
          </p>
        </div>
        <LoadingIndicator message="Loading your schedule..." />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Schedule</h1>
        <p className="text-sm text-gray-600 mt-1">
          View your work schedule and upcoming shifts
        </p>
      </div>

      {/* Core Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Shift"
          value={stats.todayShift}
          change=""
          changeType="neutral"
          icon={Clock}
        />
        <StatsCard
          title="This Week"
          value={stats.weekHours}
          change=""
          changeType="positive"
          icon={Calendar}
        />
        <StatsCard
          title="Next Shift"
          value={stats.nextShift}
          change=""
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatsCard
          title="Monthly Hours"
          value={stats.monthHours}
          change=""
          changeType="positive"
          icon={CheckCircle}
        />
      </div>
    </div>
  );
};
