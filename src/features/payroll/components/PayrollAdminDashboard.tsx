'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/redux';
import { selectUserRole } from '@/store/authSlice';
import { UserRole } from '@empcon/types';
import { ExcelGenerationCard } from './ExcelGenerationCard';
import { PayslipUploadCard } from './PayslipUploadCard';
import { PayslipTable } from './PayslipTable';

/**
 * Payroll Admin Dashboard Component
 * Main dashboard for managers/admins to manage payroll
 * Restricted to MANAGER and ADMIN roles only
 */
export const PayrollAdminDashboard = () => {
  const userRole = useAppSelector(selectUserRole);
  const router = useRouter();

  // Protect admin-only route
  useEffect(() => {
    if (userRole && userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER) {
      router.push('/payroll/employee');
    }
  }, [userRole, router]);

  // Show nothing while checking permissions
  if (!userRole || (userRole !== UserRole.ADMIN && userRole !== UserRole.MANAGER)) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage payroll reports and employee payslips
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Excel Generation Section */}
        <ExcelGenerationCard />

        {/* Payslip Upload Section */}
        <PayslipUploadCard />
      </div>

      {/* Payslip Table Section */}
      <PayslipTable />
    </div>
  );
};
