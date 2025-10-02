'use client';

/**
 * Payroll Employee Page
 *
 * Displays employee's payroll information including:
 * - Summary cards (Gross Pay, Hours Worked, Pay Rate, Days Worked)
 * - Payroll history table with download functionality
 *
 * Route: /employee/payroll
 * Access: All authenticated employees
 */

import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/authSlice';
import {
  useGetEmployeePayslipsQuery,
  useLazyDownloadPayslipQuery,
} from '@/store/api/payrollApi';
import { PayrollSummaryCards } from '../components/employee/PayrollSummaryCards';
import { PayrollHistoryTable } from '../components/employee/PayrollHistoryTable';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Info } from 'lucide-react';
import { toast } from 'sonner';
import { downloadFile } from '../utils/fileHandlers';

export default function PayrollEmployeePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const employeeId = currentUser?.id;

  // Fetch payslips data
  const {
    data: payslips,
    isLoading,
    error,
  } = useGetEmployeePayslipsQuery(employeeId || '', {
    skip: !employeeId,
  });

  // Download mutation
  const [downloadPayslip, { isLoading: isDownloading }] =
    useLazyDownloadPayslipQuery();

  /**
   * Handle payslip download
   */
  const handleDownload = async (payslipId: string) => {
    try {
      const blob = await downloadPayslip(payslipId).unwrap();
      downloadFile(blob, `payslip-${payslipId}.pdf`);
      toast.success('Payslip downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download payslip. Please try again.');
    }
  };

  // Employee ID check
  if (!employeeId) {
    return (
      <div className="container mx-auto py-8 max-w-7xl">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Unable to load employee information. Please try logging in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground mt-2">
          View your payroll summary and download payslips
        </p>
      </div>

      {/* Summary Cards Section */}
      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="text-xl font-semibold mb-4">
          Latest Period Summary
        </h2>
        <PayrollSummaryCards employeeId={employeeId} />
      </section>

      {/* Payroll History Section */}
      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-semibold mb-4">
          Payroll History
        </h2>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load payroll history. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Data Display */}
        {!isLoading && !error && payslips && (
          <PayrollHistoryTable
            payslips={payslips}
            onDownload={handleDownload}
            isDownloading={isDownloading}
          />
        )}
      </section>
    </div>
  );
}
