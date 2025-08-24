"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { RootState } from "@/store";
import { Calendar, Clock, DollarSign, FileText } from "lucide-react";
import { useSelector } from "react-redux";

export default function EmployeeDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return <div>Loading...</div>;

  // Mock data
  const todaySchedule = {
    shift: "09:00 - 18:00",
    department: user.department || "Development",
    position: user.position || "Employee",
    status: "scheduled",
  };

  const timeStatus = {
    clockedIn: "09:05",
    clockedOut: null,
    workingHours: "7 hours 25 minutes",
    status: "working",
  };

  const recentRequests = [
    { type: "Annual Leave", date: "2025-08-30", status: "pending" },
    { type: "Sick Leave", date: "2025-08-25", status: "approved" },
    { type: "Schedule Change", date: "2025-08-28", status: "completed" },
  ];

  const upcomingSchedule = [
    { date: "2025-08-21", shift: "09:00 - 18:00", type: "Regular" },
    { date: "2025-08-22", shift: "10:00 - 19:00", type: "Late Start" },
    { date: "2025-08-23", shift: "Off", type: "Leave" },
    { date: "2025-08-24", shift: "09:00 - 18:00", type: "Regular" },
  ];

  const getRequestBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "completed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Hello, {user.firstName}!</h2>
              <p className="text-muted-foreground">
                {todaySchedule.department} • {todaySchedule.position}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="font-medium">{getCurrentDate()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Work Hours
                </span>
                <span className="font-medium">{todaySchedule.shift}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Department
                </span>
                <span>{todaySchedule.department}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="default">Scheduled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Clock Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Clock Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clock In</span>
                <span className="font-medium">{timeStatus.clockedIn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Clock Out</span>
                <span>{timeStatus.clockedOut || "Not clocked out"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Working Hours
                </span>
                <span>{timeStatus.workingHours}</span>
              </div>
              <Badge variant="default" className="w-full justify-center">
                Working
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Clock className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                View Payroll
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{request.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.date}
                    </p>
                  </div>
                  <Badge variant={getRequestBadge(request.status)}>
                    {request.status.charAt(0).toUpperCase() +
                      request.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedule.map((schedule, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{schedule.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {schedule.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{schedule.shift}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
