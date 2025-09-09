import { ScheduleStatus } from "@empcon/types";
import { Badge } from "../ui/badge";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleStatusBadgeProps {
  status: ScheduleStatus;
  isCurrentlyWorking?: boolean;
  showIcon?: boolean;
  className?: string;
}

export function ScheduleStatusBadge({ 
  status, 
  isCurrentlyWorking = false,
  showIcon = false,
  className
}: ScheduleStatusBadgeProps) {
  // Handle currently working status (overrides other statuses)
  if (isCurrentlyWorking) {
    const Icon = CheckCircle;
    return (
      <Badge 
        className={cn(
          "bg-green-100 text-green-800 border-green-200",
          className
        )}
      >
        {showIcon && <Icon className="h-3 w-3 mr-1" />}
        Working Now
      </Badge>
    );
  }

  // Handle regular statuses
  switch (status) {
    case "SCHEDULED": {
      const Icon = Clock;
      return (
        <Badge 
          className={cn(
            "bg-blue-100 text-blue-800 border-blue-200",
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3 mr-1" />}
          Scheduled
        </Badge>
      );
    }
    case "COMPLETED": {
      const Icon = CheckCircle;
      return (
        <Badge 
          className={cn(
            "bg-green-100 text-green-800 border-green-200",
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3 mr-1" />}
          Completed
        </Badge>
      );
    }
    case "CANCELLED": {
      const Icon = AlertCircle;
      return (
        <Badge 
          className={cn(
            "bg-red-100 text-red-800 border-red-200",
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3 mr-1" />}
          Cancelled
        </Badge>
      );
    }
    case "NO_SHOW": {
      const Icon = AlertCircle;
      return (
        <Badge 
          className={cn(
            "bg-orange-100 text-orange-800 border-orange-200",
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3 mr-1" />}
          No Show
        </Badge>
      );
    }
    default: {
      const Icon = Clock;
      return (
        <Badge 
          className={cn(
            "bg-gray-100 text-gray-800 border-gray-200",
            className
          )}
        >
          {showIcon && <Icon className="h-3 w-3 mr-1" />}
          {status}
        </Badge>
      );
    }
  }
}