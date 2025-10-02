'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Download, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useLazyDownloadPayslipQuery } from '@/store/api/payrollApi';
import { PayslipStatusBadge } from './PayslipStatusBadge';
import { downloadFile } from '../utils/fileHandlers';
import type { Payslip } from '@empcon/types';

interface EmployeePayslipCardProps {
  payslip: Payslip;
}

/**
 * Employee Payslip Card Component
 * Displays a single payslip with download functionality
 */
export const EmployeePayslipCard = ({ payslip }: EmployeePayslipCardProps) => {
  const [downloadPayslip, { isLoading }] = useLazyDownloadPayslipQuery();

  const handleDownload = async () => {
    if (!payslip.filePath) {
      toast.error('Payslip file not available yet');
      return;
    }

    try {
      const blob = await downloadPayslip(payslip.id).unwrap();

      // Generate filename
      const startDate = payslip.payPeriod?.startDate
        ? new Date(payslip.payPeriod.startDate).toLocaleDateString()
        : 'Unknown';
      const filename = `Payslip - ${startDate}.pdf`;

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {payslip.payPeriod ? (
                <>
                  {formatDate(payslip.payPeriod.startDate)} - {formatDate(payslip.payPeriod.endDate)}
                </>
              ) : (
                'Pay Period'
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Pay Date: {formatDate(payslip.payPeriod?.payDate)}
            </CardDescription>
          </div>
          <PayslipStatusBadge hasFile={!!payslip.filePath} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hours Information */}
        {(payslip.regularHours !== null || payslip.overtimeHours !== null) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Regular Hours
              </p>
              <p className="text-2xl font-bold">
                {payslip.regularHours !== null ? payslip.regularHours.toFixed(2) : '-'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Overtime Hours
              </p>
              <p className="text-2xl font-bold">
                {payslip.overtimeHours !== null ? payslip.overtimeHours.toFixed(2) : '-'}
              </p>
            </div>
          </div>
        )}

        {/* Pay Information */}
        {payslip.grossPay !== null && (
          <div className="pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gross Pay</span>
                <span className="font-semibold">${payslip.grossPay.toFixed(2)}</span>
              </div>
              {payslip.deductions !== null && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Deductions</span>
                  <span className="font-semibold text-red-600">
                    -${payslip.deductions.toFixed(2)}
                  </span>
                </div>
              )}
              {payslip.netPay !== null && (
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Net Pay</span>
                  <span className="text-xl font-bold text-green-600">
                    ${payslip.netPay.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={!payslip.filePath || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            'Downloading...'
          ) : payslip.filePath ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Payslip
            </>
          ) : (
            'Payslip Not Available Yet'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
