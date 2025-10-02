import { Badge } from '@/shared/ui/badge';

interface PayslipStatusBadgeProps {
  hasFile: boolean;
  className?: string;
}

/**
 * Status badge for payslip availability
 * Shows whether a payslip PDF is available for download
 */
export const PayslipStatusBadge = ({ hasFile, className }: PayslipStatusBadgeProps) => {
  if (hasFile) {
    return (
      <Badge variant="default" className={className}>
        Available
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={className}>
      Pending
    </Badge>
  );
};
