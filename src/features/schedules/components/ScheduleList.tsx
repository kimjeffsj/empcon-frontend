"use client";

import { useMemo, useState, useEffect } from "react";
import { Schedule, ScheduleStatus } from "@empcon/types";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Edit, Plus, Trash2, Users, List } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { ScheduleTable } from "@/shared/components/ScheduleTable";
import { EmployeeInfo } from "@/shared/components/EmployeeInfo";
import { StatsCard } from "@/shared/components/StatsCard";
import { ScheduleCalendar } from "./ScheduleCalendar";
import {
  formatScheduleDate,
  formatScheduleTime,
  formatScheduleDuration,
} from "@/lib/formatter";
import {
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/store/api/schedulesApi";

type ViewMode = 'list' | 'calendar';

interface ScheduleListProps {
  onAddClick?: () => void;
  onEditClick?: (schedule: Schedule) => void;
}

export const ScheduleList = ({
  onAddClick,
  onEditClick,
}: ScheduleListProps) => {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  
  // Calendar View selected date state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<Schedule[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("today");

  // Calculate date range based on view mode and filter
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    // Calendar view: Always show current month + buffer weeks for optimal calendar display
    if (viewMode === 'calendar') {
      // Start of current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      
      // End of current month
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      
      // Add buffer weeks to show partial weeks from previous/next months
      start.setDate(start.getDate() - 7); // 1 week before month start
      end.setDate(end.getDate() + 7);     // 1 week after month end
      
    } else {
      // List view: Use existing filter logic
      switch (dateRangeFilter) {
        case "today":
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
          break;
        case "week":
          start = new Date(now);
          start.setDate(now.getDate() - now.getDay()); // Start of week
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(start.getDate() + 6); // End of week
          end.setHours(23, 59, 59, 999);
          break;
        case "all":
          // Show last 3 months to next 1 month for performance
          start = new Date(now);
          start.setMonth(now.getMonth() - 3);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setMonth(now.getMonth() + 1);
          end.setHours(23, 59, 59, 999);
          break;
        default:
          // Default to today
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          end = new Date(now);
          end.setHours(23, 59, 59, 999);
      }
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [viewMode, dateRangeFilter]);

  // Fetch schedules
  const {
    data: schedulesData,
    isLoading,
    error,
    refetch,
  } = useGetSchedulesQuery({
    startDate,
    endDate,
    status:
      statusFilter === "all" ? undefined : (statusFilter as ScheduleStatus),
    page: 1,
    limit: 100,
  });

  // Mutation hooks
  const [createSchedule] = useCreateScheduleMutation();
  const [updateSchedule] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const schedules = schedulesData?.data || [];

  // Refetch data when switching to calendar view for fresh data
  useEffect(() => {
    if (viewMode === 'calendar') {
      refetch();
    }
  }, [viewMode, refetch]);

  // Filter schedules by search term (employee name)
  const filteredSchedules = useMemo(() => {
    if (!searchTerm) return schedules;

    return schedules.filter((schedule) => {
      const employeeName = schedule.employee
        ? `${schedule.employee.firstName} ${schedule.employee.lastName}`.toLowerCase()
        : "";
      const employeeNumber =
        schedule.employee?.employeeNumber?.toLowerCase() || "";
      const position = schedule.position?.toLowerCase() || "";

      const searchLower = searchTerm.toLowerCase();
      return (
        employeeName.includes(searchLower) ||
        employeeNumber.includes(searchLower) ||
        position.includes(searchLower)
      );
    });
  }, [schedules, searchTerm]);

  // Calculate statistics for card view
  const scheduleStats = useMemo(() => {
    const total = filteredSchedules.length;
    const scheduled = filteredSchedules.filter(s => s.status === 'SCHEDULED').length;
    const completed = filteredSchedules.filter(s => s.status === 'COMPLETED').length;
    
    // Classify by time (regular vs night shift)
    const regularShifts = filteredSchedules.filter(schedule => {
      const startHour = new Date(schedule.startTime).getHours();
      return startHour >= 6 && startHour < 18; // 6 AM to 6 PM = regular
    }).length;
    
    const nightShifts = filteredSchedules.filter(schedule => {
      const startHour = new Date(schedule.startTime).getHours();
      return startHour < 6 || startHour >= 18; // Before 6 AM or after 6 PM = night
    }).length;

    const onLeave = filteredSchedules.filter(s => 
      s.status === 'CANCELLED' || s.notes?.toLowerCase().includes('leave')
    ).length;

    return {
      total,
      regularShifts,
      nightShifts,
      onLeave
    };
  }, [filteredSchedules]);

  // Transform schedules for calendar view
  const calendarEvents = useMemo(() => {
    return filteredSchedules.map(schedule => ({
      id: schedule.id,
      title: schedule.employee 
        ? `${schedule.employee.firstName} ${schedule.employee.lastName}`
        : 'Unknown Employee',
      start: new Date(schedule.startTime),
      end: new Date(schedule.endTime),
      resource: {
        schedule,
        employee: schedule.employee,
        status: schedule.status,
        position: schedule.position
      }
    }));
  }, [filteredSchedules]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date, daySchedules: Schedule[]) => {
    setSelectedDate(date);
    setSelectedDateSchedules(daySchedules);
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteSchedule(id).unwrap();
      toast.success("Schedule Deleted", {
        description: "The schedule has been removed successfully.",
      });
    } catch (error) {
      toast.error("Failed to delete schedule", {
        description: "Please try again later.",
      });
    }
  };

  if (isLoading) return <LoadingIndicator message="Loading schedules..." />;
  if (error)
    return (
      <ErrorMessage
        title="Failed to Load Schedules"
        message="Unable to fetch schedule data. Please check your connection and try again"
        onRetry={refetch}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Schedule Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage employee work schedules and shifts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Create
          </Button>
          <Button className="flex items-center gap-2" onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Today's Schedule
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* Filters - Common for both views */}
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by name, employee ID, or position..."
          filters={[
            {
              value: dateRangeFilter,
              onChange: setDateRangeFilter,
              options: [
                { value: "today", label: "Today's Schedule" },
                { value: "week", label: "This Week's Schedule" },
                { value: "all", label: "All Schedules" },
              ],
              placeholder: "Select date range",
              width: "w-40",
            },
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: "all", label: "All Statuses" },
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "NO_SHOW", label: "No Show" },
              ],
              placeholder: "Filter by status",
              width: "w-40",
            },
          ]}
        />

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Schedules"
              value={scheduleStats.total.toString()}
              change="+2"
              changeType="positive"
              icon={Calendar}
            />
            <StatsCard
              title="Regular Shifts"
              value={scheduleStats.regularShifts.toString()}
              change="+1"
              changeType="positive"
              icon={Clock}
            />
            <StatsCard
              title="Night Shifts"
              value={scheduleStats.nightShifts.toString()}
              change="0"
              changeType="neutral"
              icon={Clock}
            />
            <StatsCard
              title="On Leave"
              value={scheduleStats.onLeave.toString()}
              change="-1"
              changeType="negative"
              icon={Users}
            />
          </div>

          {/* Schedule Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {dateRangeFilter === "today" ? "Today's Schedule" : 
                 dateRangeFilter === "week" ? "This Week's Schedule" : 
                 "All Schedules"} ({filteredSchedules.length} schedule
                {filteredSchedules.length !== 1 ? "s" : ""} found)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleTable
                schedules={filteredSchedules}
                showDateColumn={true}
                onEditClick={onEditClick}
                onDeleteClick={handleDeleteSchedule}
                emptyMessage="No schedules found"
                emptyDescription="Try adjusting your filters or create a new schedule"
              />
            </CardContent>
          </Card>
        </TabsContent>


        {/* Calendar View */}
        <TabsContent value="calendar" className="space-y-6">
          <ScheduleCalendar
            schedules={filteredSchedules}
            onDateSelect={handleDateSelect}
            onSelectEvent={(event) => {
              // Handle event selection (e.g., open edit modal)
            }}
            onSelectSlot={(slotInfo) => {
              // Note: onDateSelect will be called automatically by ScheduleCalendar
              // No need to open Add Schedule modal here
            }}
          />
          
          {/* Selected Date Detail Table */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedules for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  <Badge variant="secondary" className="ml-auto">
                    {selectedDateSchedules.length} schedule{selectedDateSchedules.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleTable
                  schedules={selectedDateSchedules}
                  showDateColumn={false}
                  onEditClick={onEditClick}
                  onDeleteClick={handleDeleteSchedule}
                  emptyMessage="No schedules for this date"
                  emptyDescription="Click 'Add Schedule' to create a new schedule for this date"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
};
