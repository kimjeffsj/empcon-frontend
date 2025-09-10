"use client";

import { useMemo, useState } from "react";
import { Schedule, ScheduleStatus } from "@empcon/types";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Edit, Plus, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { SearchFilter } from "@/shared/components/SearchFilter";
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

interface ScheduleListProps {
  onAddClick?: () => void;
  onEditClick?: (schedule: Schedule) => void;
}

export const ScheduleList = ({
  onAddClick,
  onEditClick,
}: ScheduleListProps) => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("week");

  // Calculate date range based on filter
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

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
      case "month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        end = new Date(now);
        end.setDate(now.getDate() + 7);
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [dateRangeFilter]);

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

  // Get unique positions for potential filtering
  const positions = useMemo(() => {
    const positionSet = new Set<string>();
    schedules.forEach((schedule) => {
      if (schedule.position) {
        positionSet.add(schedule.position);
      }
    });
    return Array.from(positionSet);
  }, [schedules]);

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

      {/* Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by name, employee ID, or position..."
        filters={[
          {
            value: dateRangeFilter,
            onChange: setDateRangeFilter,
            options: [
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
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

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Schedule List ({filteredSchedules.length} schedule
            {filteredSchedules.length !== 1 ? "s" : ""} found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">No schedules found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your filters or create a new schedule
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {schedule.employee
                            ? `${schedule.employee.firstName} ${schedule.employee.lastName}`
                            : "Unknown Employee"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {schedule.employee?.employeeNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatScheduleDate(schedule.startTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          {formatScheduleTime(schedule.startTime)} -{" "}
                          {formatScheduleTime(schedule.endTime)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatScheduleDuration(
                        schedule.startTime,
                        schedule.endTime,
                        schedule.breakDuration
                      )}
                      {schedule.breakDuration > 0 && (
                        <span className="text-xs text-gray-500 block">
                          (incl. {schedule.breakDuration}m break)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {schedule.position ? (
                        <Badge variant="secondary">{schedule.position}</Badge>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <ScheduleStatusBadge status={schedule.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditClick?.(schedule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
