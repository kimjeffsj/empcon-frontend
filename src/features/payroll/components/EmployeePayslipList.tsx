'use client';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Skeleton } from '@/shared/ui/skeleton';
import { FileText, Info } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/authSlice';
import { useGetEmployeePayslipsQuery } from '@/store/api/payrollApi';
import { EmployeePayslipCard } from './EmployeePayslipCard';

/**
 * Employee Payslip List Component
 * Displays all payslips for the logged-in employee
 */
export const EmployeePayslipList = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const employeeId = currentUser?.id;

  const { data: payslips, isLoading, error } = useGetEmployeePayslipsQuery(
    employeeId || '',
    { skip: !employeeId }
  );

  if (!employeeId) {
    return (
      <div className="text-center py-12">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Unable to load employee information. Please try logging in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load payslips. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!payslips || payslips.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Payslips Available</h3>
        <p className="text-muted-foreground mt-2">
          Your payslips will appear here once they are processed.
        </p>
      </div>
    );
  }

  // Sort payslips by date (newest first)
  const sortedPayslips = [...payslips].sort((a, b) => {
    const dateA = a.payPeriod?.startDate ? new Date(a.payPeriod.startDate).getTime() : 0;
    const dateB = b.payPeriod?.startDate ? new Date(b.payPeriod.startDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedPayslips.map((payslip) => (
        <EmployeePayslipCard key={payslip.id} payslip={payslip} />
      ))}
    </div>
  );
};
