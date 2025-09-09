"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useGetTodayRosterQuery } from "@/store/api/schedulesApi";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { formatScheduleTime } from "@/lib/formatter";
import { ScheduleStatus } from "@empcon/types";

interface TodayRosterProps {
  className?: string;
}

export const TodayRoster = ({ className }: TodayRosterProps) => {
  const router = useRouter();
  const { data: roster, isLoading, error, refetch } = useGetTodayRosterQuery();

  const handleViewAll = () => {
    router.push('/admin/schedules');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingIndicator />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500">Failed to load today's schedule</p>
            <button onClick={refetch} className="mt-2 text-blue-500 hover:underline">
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const schedules = roster?.schedules || [];
  const totalScheduled = roster?.totalScheduled || 0;
  const currentlyWorking = schedules.filter((s) => s.isCurrentlyWorking).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Today's Schedule
          </CardTitle>
          {handleViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="flex items-center gap-1"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{totalScheduled} scheduled</span>
          </div>
          {currentlyWorking > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{currentlyWorking} working now</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No schedules for today</p>
            <p className="text-sm text-gray-400">
              All employees have the day off
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {schedules.map((schedule) => {

              return (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Employee Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {schedule.employee.firstName}{" "}
                          {schedule.employee.lastName}
                        </p>
                        {schedule.position && (
                          <Badge variant="secondary" className="text-xs">
                            {schedule.position}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatScheduleTime(schedule.startTime)} -{" "}
                          {formatScheduleTime(schedule.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <ScheduleStatusBadge 
                      status={schedule.status}
                      isCurrentlyWorking={schedule.isCurrentlyWorking || false}
                      showIcon={true}
                      className="text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more indicator if there are many schedules */}
        {schedules.length > 5 && handleViewAll && (
          <div className="pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAll}
              className="w-full"
            >
              View All {totalScheduled} Schedules
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
