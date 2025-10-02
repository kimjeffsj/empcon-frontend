'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useGetPayPeriodsQuery, useGetPayslipsQuery, useLazyDownloadPayslipQuery } from '@/store/api/payrollApi';
import { PayslipStatusBadge } from './PayslipStatusBadge';
import { downloadFile } from '../utils/fileHandlers';
import type { Payslip } from '@empcon/types';

/**
 * Payslip Table Component
 * Displays all payslips with download functionality
 */
export const PayslipTable = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Fetch pay periods
  const { data: payPeriodsData, isLoading: isLoadingPeriods } = useGetPayPeriodsQuery({});
  const payPeriods = payPeriodsData?.data || [];

  // Fetch payslips for selected period
  const { data: payslips, isLoading: isLoadingPayslips } = useGetPayslipsQuery(
    selectedPeriodId ? { payPeriodId: selectedPeriodId } : undefined,
    { skip: !selectedPeriodId }
  );

  // Download payslip mutation
  const [downloadPayslip, { isLoading: isDownloading }] = useLazyDownloadPayslipQuery();

  const handleDownload = async (payslip: Payslip) => {
    if (!payslip.filePath) {
      toast.error('Payslip file not available');
      return;
    }

    try {
      const blob = await downloadPayslip(payslip.id).unwrap();

      // Generate filename
      const employeeName = payslip.employee
        ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
        : 'Unknown';
      const filename = `Payslip - ${employeeName}.pdf`;

      downloadFile(blob, filename);
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      console.error('Failed to download payslip:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error &&
        error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : 'Failed to download payslip';
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Payslip Management
        </CardTitle>
        <CardDescription>
          View and manage all employee payslips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Pay Period</label>
          <Select
            value={selectedPeriodId}
            onValueChange={setSelectedPeriodId}
            disabled={isLoadingPeriods}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a pay period" />
            </SelectTrigger>
            <SelectContent>
              {payPeriods?.map((period) => {
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                const label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} (${
                  period.status
                })`;
                return (
                  <SelectItem key={period.id} value={period.id}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {isLoadingPayslips ? (
          <div className="text-center py-8 text-muted-foreground">Loading payslips...</div>
        ) : !selectedPeriodId ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a pay period to view payslips
          </div>
        ) : payslips && payslips.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee #</TableHead>
                  <TableHead className="text-right">Regular Hours</TableHead>
                  <TableHead className="text-right">OT Hours</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">
                      {payslip.employee
                        ? `${payslip.employee.firstName} ${payslip.employee.lastName}`
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>{payslip.employee?.employeeNumber || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      {payslip.regularHours !== null ? payslip.regularHours.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {payslip.overtimeHours !== null ? payslip.overtimeHours.toFixed(2) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {payslip.grossPay !== null ? `$${payslip.grossPay.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      <PayslipStatusBadge hasFile={!!payslip.filePath} />
                    </TableCell>
                    <TableCell>
                      {payslip.filePath ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(payslip)}
                          disabled={isDownloading}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No payslips found for this period
          </div>
        )}
      </CardContent>
    </Card>
  );
};
