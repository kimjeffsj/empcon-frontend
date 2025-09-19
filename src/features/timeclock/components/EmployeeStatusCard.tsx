import { Card, CardContent } from "@/shared/ui/card";

import { Badge } from "@/shared/ui/badge";
import { formatPacificTime12 } from "@/shared/utils/dateTime";
import { EmployeeClockSummary } from "@empcon/types";

// Individual employee status card component
interface EmployeeStatusCardProps {
  employee: EmployeeClockSummary;
  showDetailed: boolean;
}

export function EmployeeStatusCard({ employee }: EmployeeStatusCardProps) {
  return (
    <Card
      className="border-l-4"
      style={{ borderLeftColor: employee.statusColor }}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Employee Info */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm">{employee.employeeName}</h4>
              {employee.employeeNumber && (
                <p className="text-xs text-gray-500">
                  #{employee.employeeNumber}
                </p>
              )}
            </div>

            <Badge
              variant="outline"
              className="text-xs"
              style={{
                color: employee.statusColor,
                borderColor: employee.statusColor,
              }}
            >
              {employee.currentStatus.replace("_", " ")}
            </Badge>
          </div>

          {/* Schedule information */}
          <div className="space-y-2 text-xs">
            {/* Scheduled time */}
            {employee.scheduledStart && employee.scheduledEnd && (
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled:</span>
                <span className="font-medium">
                  {formatPacificTime12(employee.scheduledStart)} -{" "}
                  {formatPacificTime12(employee.scheduledEnd)}
                </span>
              </div>
            )}

            {/* Clock in time */}
            {employee.actualClockInTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">Clocked In:</span>
                <span className="font-medium">
                  {formatPacificTime12(employee.actualClockInTime)}
                  {employee.isLate && (
                    <span className="text-red-500 ml-1">(Late)</span>
                  )}
                </span>
              </div>
            )}

            {/* Clock out time */}
            {employee.actualClockOutTime && (
              <div className="flex justify-between">
                <span className="text-gray-500">Clocked Out:</span>
                <span className="font-medium">
                  {formatPacificTime12(employee.actualClockOutTime)}
                  {employee.isOvertime && (
                    <span className="text-amber-600 ml-1">(OT)</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Hours Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Worked Today</p>
              <p className="font-medium">{employee.workedHours}h</p>
            </div>
            <div>
              <p className="text-gray-500">Scheduled</p>
              <p className="font-medium">{employee.scheduledHours}h</p>
            </div>
          </div>

          {/* Warnings */}
          <div className="flex space-x-1">
            {employee.isLate && (
              <Badge variant="destructive" className="text-xs">
                Late
              </Badge>
            )}
            {employee.isOvertime && (
              <Badge
                variant="outline"
                className="text-xs text-amber-600 border-amber-600"
              >
                OT
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
