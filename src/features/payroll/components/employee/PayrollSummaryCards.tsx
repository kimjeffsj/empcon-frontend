'use client';

/**
 * PayrollSummaryCards Component
 *
 * Container for 4 summary cards showing key payroll metrics:
 * - Gross Pay (current period)
 * - Hours Worked This Period
 * - Current Pay Rate
 * - Days Worked
 */

import { DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useGetEmployeePayrollSummaryQuery } from '@/store/api/payrollApi';
import { SummaryCard } from './SummaryCard';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface PayrollSummaryCardsProps {
  /** Employee ID to fetch summary for */
  employeeId: string;
}

/**
 * Loading skeleton for summary cards
 */
const SummaryCardSkeleton = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-32" />
  </div>
);

export const PayrollSummaryCards = ({ employeeId }: PayrollSummaryCardsProps) => {
  const {
    data: summary,
    isLoading,
    error,
  } = useGetEmployeePayrollSummaryQuery({ employeeId }, {
    skip: !employeeId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border p-6">
            <SummaryCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load payroll summary. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // No data state
  if (!summary || !summary.currentPeriod) {
    return (
      <Alert>
        <AlertDescription>
          No payroll data available for the current period.
        </AlertDescription>
      </Alert>
    );
  }

  const { currentPeriod, payRate } = summary;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Gross Pay */}
      <SummaryCard
        title="Gross Pay"
        value={currentPeriod.grossPay}
        format="currency"
        icon={DollarSign}
      />

      {/* Hours Worked This Period */}
      <SummaryCard
        title="Hours Worked This Period"
        value={currentPeriod.totalHours}
        format="hours"
        icon={Clock}
      />

      {/* Current Pay Rate */}
      <SummaryCard
        title="Current Pay Rate"
        value={payRate}
        format="rate"
        icon={TrendingUp}
      />

      {/* Days Worked */}
      <SummaryCard
        title="Days Worked"
        value={currentPeriod.timeEntriesCount}
        format="number"
        icon={Calendar}
      />
    </div>
  );
};
