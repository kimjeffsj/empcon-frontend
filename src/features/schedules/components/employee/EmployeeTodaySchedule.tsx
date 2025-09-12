"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { 
  Calendar, 
  Clock, 
  Coffee,
  MapPin,
  CheckCircle,
  XCircle
} from "lucide-react";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { useGetSchedulesByDateRangeQuery } from "@/store/api/schedulesApi";
import { formatScheduleTime, formatScheduleDuration } from "@/lib/formatter";

interface EmployeeTodayScheduleProps {
  className?: string;
}

export const EmployeeTodaySchedule = ({ className = "" }: EmployeeTodayScheduleProps) => {
  // Get today's date range
  const todayRange = useMemo(() => {
    const now = new Date();
    const today = {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    };
    
    return {
      start: today.start.toISOString().split("T")[0],
      end: today.end.toISOString().split("T")[0]
    };
  }, []);

  // Fetch today's schedule
  const { data: todayData, isLoading, error } = useGetSchedulesByDateRangeQuery({
    startDate: todayRange.start,
    endDate: todayRange.end
  });

  // Process today's schedule
  const todayInfo = useMemo(() => {
    const schedules = todayData?.data || [];
    
    if (schedules.length === 0) {
      return {
        hasSchedule: false,
        schedule: null,
        isCurrentlyWorking: false,
        workStatus: "off"
      };
    }

    const schedule = schedules[0]; // Employee should only have one schedule per day
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);
    
    let workStatus = "scheduled";
    let isCurrentlyWorking = false;
    
    if (now >= startTime && now <= endTime) {
      workStatus = "working";
      isCurrentlyWorking = true;
    } else if (now > endTime) {
      workStatus = "completed";
    }

    return {
      hasSchedule: true,
      schedule,
      isCurrentlyWorking,
      workStatus
    };
  }, [todayData]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <LoadingIndicator message="Loading today's schedule..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load today's schedule</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Today's Schedule
          {todayInfo.isCurrentlyWorking && (
            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
              Currently Working
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!todayInfo.hasSchedule ? (
          // No schedule today
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shift today</h3>
            <p className="text-gray-500">Enjoy your day off!</p>
          </div>
        ) : (
          // Schedule details
          <div className="space-y-4">
            {/* Work Status Banner */}
            <div className={`p-4 rounded-lg border ${
              todayInfo.workStatus === "working" 
                ? "bg-green-50 border-green-200" 
                : todayInfo.workStatus === "completed"
                ? "bg-blue-50 border-blue-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center gap-3">
                {todayInfo.workStatus === "working" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : todayInfo.workStatus === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    todayInfo.workStatus === "working" 
                      ? "text-green-900" 
                      : todayInfo.workStatus === "completed"
                      ? "text-blue-900"
                      : "text-yellow-900"
                  }`}>
                    {todayInfo.workStatus === "working" 
                      ? "You are currently working" 
                      : todayInfo.workStatus === "completed"
                      ? "Shift completed"
                      : "Shift scheduled"}
                  </p>
                  <p className={`text-sm ${
                    todayInfo.workStatus === "working" 
                      ? "text-green-700" 
                      : todayInfo.workStatus === "completed"
                      ? "text-blue-700"
                      : "text-yellow-700"
                  }`}>
                    {formatScheduleTime(todayInfo.schedule!.startTime)} - {formatScheduleTime(todayInfo.schedule!.endTime)}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time & Duration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Work Hours</p>
                    <p className="text-sm text-gray-600">
                      {formatScheduleTime(todayInfo.schedule!.startTime)} - {formatScheduleTime(todayInfo.schedule!.endTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">
                      {formatScheduleDuration(
                        todayInfo.schedule!.startTime,
                        todayInfo.schedule!.endTime,
                        todayInfo.schedule!.breakDuration
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Position & Status */}
              <div className="space-y-3">
                {todayInfo.schedule!.position && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">Position</p>
                      <Badge variant="secondary">{todayInfo.schedule!.position}</Badge>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Status</p>
                    <ScheduleStatusBadge status={todayInfo.schedule!.status} />
                  </div>
                </div>
              </div>
            </div>

            {/* Break Time */}
            {todayInfo.schedule!.breakDuration > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2">
                  <Coffee className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Break Time</p>
                    <p className="text-sm text-gray-600">
                      {todayInfo.schedule!.breakDuration} minutes scheduled
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {todayInfo.schedule!.notes && (
              <div className="border-t pt-4">
                <p className="font-medium text-gray-900 mb-1">Notes</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {todayInfo.schedule!.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};