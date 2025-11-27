'use client';

/**
 * PayrollHistoryTable Component
 *
 * Displays payroll history in a table format with:
 * - Month and Period (A/B)
 * - Hours breakdown (regular, overtime, total)
 * - Gross pay
 * - Download action
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Download, FileText } from 'lucide-react';
import { PayslipSummary } from '@empcon/types';
import {
  formatCurrency,
  formatHours,
  getMonthNameFromPeriod,
  getYearFromPeriod,
  getPeriodFromString,
  calculateTotalHoursFromSummary,
} from '../../utils/formatters';

interface PayrollHistoryTableProps {
  /** Array of payslips to display */
  payslips: PayslipSummary[];

  /** Download handler function */
  onDownload: (payslipId: string) => Promise<void>;

  /** Loading state for download actions */
  isDownloading?: boolean;
}

/**
 * Empty state component
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium text-center">No Payroll History</h3>
    <p className="text-muted-foreground text-center mt-2">
      Your payroll history will appear here once available.
    </p>
  </div>
);

export const PayrollHistoryTable = ({
  payslips,
  onDownload,
  isDownloading = false,
}: PayrollHistoryTableProps) => {
  // Empty state
  if (!payslips || payslips.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Regular Hours</TableHead>
            <TableHead className="text-right">Overtime Hours</TableHead>
            <TableHead className="text-right">Total Hours</TableHead>
            <TableHead className="text-right">Gross Pay</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslips.map((payslip) => {
            const hasFile = !!payslip.filePath;
            const month = getMonthNameFromPeriod(payslip.payPeriod);
            const year = getYearFromPeriod(payslip.payPeriod);
            const period = getPeriodFromString(payslip.payPeriod);
            const totalHours = calculateTotalHoursFromSummary(payslip);

            return (
              <TableRow key={payslip.id}>
                {/* Month */}
                <TableCell className="font-medium">{month}</TableCell>

                {/* Year */}
                <TableCell>{year}</TableCell>

                {/* Period Badge */}
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {period}
                  </Badge>
                </TableCell>

                {/* Regular Hours */}
                <TableCell className="text-right tabular-nums">
                  {formatHours(payslip.regularHours)}
                </TableCell>

                {/* Overtime Hours */}
                <TableCell className="text-right tabular-nums">
                  {formatHours(payslip.overtimeHours)}
                </TableCell>

                {/* Total Hours */}
                <TableCell className="text-right font-medium tabular-nums">
                  {formatHours(totalHours)}
                </TableCell>

                {/* Gross Pay */}
                <TableCell className="text-right font-bold tabular-nums">
                  {formatCurrency(payslip.grossPay ?? 0)}
                </TableCell>

                {/* Download Action */}
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(payslip.id)}
                    disabled={!hasFile || isDownloading}
                    title={
                      hasFile
                        ? 'Download payslip PDF'
                        : 'Payslip file not available'
                    }
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">
                      Download {month} {year} Period {period} payslip
                    </span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
