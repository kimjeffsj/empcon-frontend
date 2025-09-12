import { Schedule } from "@empcon/types";
import { Button } from "@/shared/ui/button";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { ScheduleStatusBadge } from "@/shared/components/ScheduleStatusBadge";
import { EmployeeInfo } from "@/shared/components/EmployeeInfo";
import {
  formatScheduleDate,
  formatScheduleTime,
  formatScheduleDuration,
} from "@/lib/formatter";

interface ScheduleTableProps {
  schedules: Schedule[];
  showDateColumn?: boolean;
  onEditClick?: (schedule: Schedule) => void;
  onDeleteClick?: (scheduleId: string) => void;
  hideActions?: boolean; // Hide action buttons for read-only views
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
}

export const ScheduleTable = ({
  schedules,
  showDateColumn = true,
  onEditClick,
  onDeleteClick,
  hideActions = false,
  emptyMessage = "No schedules found",
  emptyDescription = "Try adjusting your filters or create a new schedule",
  className = "",
}: ScheduleTableProps) => {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          {showDateColumn && <TableHead>Date</TableHead>}
          <TableHead>Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          {!hideActions && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={(showDateColumn ? 6 : 5) + (!hideActions ? 1 : 0)}
              className="text-center py-8"
            >
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-gray-400" />
                <p className="text-gray-500">{emptyMessage}</p>
                <p className="text-sm text-gray-400">{emptyDescription}</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                <EmployeeInfo employee={schedule.employee} />
              </TableCell>
              {showDateColumn && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatScheduleDate(schedule.startTime)}
                  </div>
                </TableCell>
              )}
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
              {!hideActions && (
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
                      onClick={() => onDeleteClick?.(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
