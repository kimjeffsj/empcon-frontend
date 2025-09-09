import { Badge } from "@/shared/ui/badge";
import { StatsCard } from "@/shared/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TodayRoster } from "@/features/schedules/components/TodayRoster";
import {
  AlertTriangle,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Total Employees",
      value: "24",
      change: "+2",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Present Today",
      value: "18",
      change: "-1",
      changeType: "negative" as const,
      icon: Clock,
    },
    {
      title: "On Leave",
      value: "3",
      change: "+1",
      changeType: "neutral" as const,
      icon: FileText,
    },
    {
      title: "Monthly Payroll",
      value: "$452,000",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const recentActivities = [
    { type: "Clock In", user: "John Smith", time: "09:15", status: "late" },
    {
      type: "Leave Request",
      user: "Sarah Wilson",
      time: "08:45",
      status: "pending",
    },
    {
      type: "Clock Out",
      user: "Mike Johnson",
      time: "18:30",
      status: "normal",
    },
    {
      type: "Schedule Change",
      user: "Emily Davis",
      time: "14:20",
      status: "approved",
    },
  ];

  const pendingRequests = [
    {
      type: "Annual Leave",
      user: "David Brown",
      date: "2025-08-25",
      reason: "Personal matters",
    },
    {
      type: "Sick Leave",
      user: "Lisa Anderson",
      date: "2025-08-23",
      reason: "Medical appointment",
    },
    {
      type: "Schedule Change",
      user: "Tom Wilson ↔ Alex Lee",
      date: "2025-08-24",
      reason: "Family event",
    },
  ];

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "late":
        return "destructive";
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      default:
        return "outline";
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case "late":
        return "Late";
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      default:
        return "Normal";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Roster */}
        <TodayRoster />

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                    <Badge variant={getBadgeVariant(activity.status)}>
                      {getBadgeText(activity.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{request.user}</p>
                    <p className="text-xs text-muted-foreground">
                      {request.type} • {request.date}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.reason}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <Users className="h-6 w-6 mb-2 text-blue-500" />
              <p className="text-sm font-medium">Add Employee</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <Clock className="h-6 w-6 mb-2 text-green-500" />
              <p className="text-sm font-medium">Edit Schedule</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <FileText className="h-6 w-6 mb-2 text-purple-500" />
              <p className="text-sm font-medium">Approve Leaves</p>
            </div>
            <div className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <TrendingUp className="h-6 w-6 mb-2 text-orange-500" />
              <p className="text-sm font-medium">Generate Report</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
