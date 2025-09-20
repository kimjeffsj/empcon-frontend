import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import {
  getScheduleStatusStyle,
  getTimeEntryStatusStyle,
  getEmployeeStatusStyle,
  getClockStatusStyle,
  getStatusIcon,
  getStatusLabel,
  WORKING_NOW_STYLE,
} from "@/shared/constants/status";
import {
  EmployeeStatus,
  ScheduleStatus,
  TimeEntryStatus,
  EMPLOYEE_STATUS_COLORS,
  CLOCK_STATUS_COLORS,
} from "@empcon/types";

// ===============================
// UNIFIED STATUS BADGE COMPONENT
// ===============================

/**
 * Status badge kinds - determines which status system to use
 */
export type StatusBadgeKind = "schedule" | "timeentry" | "employee" | "clock";

/**
 * Props for the unified status badge
 */
export interface StatusBadgeProps {
  /** The kind of status determines which styling system to use */
  kind: StatusBadgeKind;

  /** The status value - type depends on kind */
  status: string;

  /** Show icon alongside text */
  showIcon?: boolean;

  /** Override for "currently working" state (for schedule badges) */
  isCurrentlyWorking?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Custom label override */
  customLabel?: string;
}

/**
 * Legacy props for backward compatibility
 */
export interface LegacyStatusBadgeProps {
  status: EmployeeStatus;
}

/**
 * Unified status badge component
 * Replaces separate status badge components with a single, flexible component
 * Supports different status systems via the 'kind' prop
 */
export function StatusBadge(props: StatusBadgeProps | LegacyStatusBadgeProps) {
  // Handle legacy usage (backward compatibility)
  if ('kind' in props) {
    const {
      kind,
      status,
      showIcon = false,
      isCurrentlyWorking = false,
      className,
      customLabel,
    } = props;

    // Handle "currently working" override for schedule badges
    if (kind === "schedule" && isCurrentlyWorking) {
      const Icon = getStatusIcon("WORKING_NOW");
      return (
        <Badge className={cn(WORKING_NOW_STYLE, className)}>
          {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
          {customLabel || getStatusLabel("WORKING_NOW")}
        </Badge>
      );
    }

    // Get appropriate styles based on kind
    let badgeStyle: string;
    switch (kind) {
      case "schedule":
        badgeStyle = getScheduleStatusStyle(status as ScheduleStatus);
        break;
      case "timeentry":
        badgeStyle = getTimeEntryStatusStyle(status as TimeEntryStatus);
        break;
      case "employee":
        badgeStyle = getEmployeeStatusStyle(status as keyof typeof EMPLOYEE_STATUS_COLORS);
        break;
      case "clock":
        badgeStyle = getClockStatusStyle(status as keyof typeof CLOCK_STATUS_COLORS);
        break;
      default:
        badgeStyle = "bg-gray-100 text-gray-800 border-gray-200";
    }

    // Get icon and label
    const Icon = showIcon ? getStatusIcon(status) : undefined;
    const label = customLabel || getStatusLabel(status);

    return (
      <Badge className={cn(badgeStyle, className)}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {label}
      </Badge>
    );
  } else {
    // Legacy usage - maintain backward compatibility
    const { status } = props;
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "ON_LEAVE":
        return <Badge variant="outline">On Leave</Badge>;
      case "TERMINATED":
        return <Badge variant="destructive">Terminated</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }
}

// ===============================
// CONVENIENCE COMPONENTS
// ===============================

/**
 * Convenience component for schedule status badges
 * Maintains backward compatibility with existing ScheduleStatusBadge usage
 */
export function ScheduleStatusBadge({
  status,
  isCurrentlyWorking = false,
  showIcon = false,
  className,
}: {
  status: ScheduleStatus;
  isCurrentlyWorking?: boolean;
  showIcon?: boolean;
  className?: string;
}) {
  return (
    <StatusBadge
      kind="schedule"
      status={status}
      isCurrentlyWorking={isCurrentlyWorking}
      showIcon={showIcon}
      className={className}
    />
  );
}

/**
 * Convenience component for time entry status badges
 */
export function TimeEntryStatusBadge({
  status,
  showIcon = false,
  className,
  customLabel,
}: {
  status: TimeEntryStatus;
  showIcon?: boolean;
  className?: string;
  customLabel?: string;
}) {
  return (
    <StatusBadge
      kind="timeentry"
      status={status}
      showIcon={showIcon}
      className={className}
      customLabel={customLabel}
    />
  );
}

/**
 * Convenience component for employee status badges
 */
export function EmployeeStatusBadge({
  status,
  showIcon = false,
  className,
}: {
  status: keyof typeof EMPLOYEE_STATUS_COLORS;
  showIcon?: boolean;
  className?: string;
}) {
  return (
    <StatusBadge
      kind="employee"
      status={status}
      showIcon={showIcon}
      className={className}
    />
  );
}

/**
 * Convenience component for clock status badges
 */
export function ClockStatusBadge({
  status,
  showIcon = false,
  className,
}: {
  status: keyof typeof CLOCK_STATUS_COLORS;
  showIcon?: boolean;
  className?: string;
}) {
  return (
    <StatusBadge
      kind="clock"
      status={status}
      showIcon={showIcon}
      className={className}
    />
  );
}
