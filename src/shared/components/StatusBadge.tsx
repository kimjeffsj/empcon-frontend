import { EmployeeStatus } from "@empcon/types";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: EmployeeStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
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
