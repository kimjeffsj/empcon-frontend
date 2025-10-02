'use client';

import { EmployeePayslipList } from '../components/EmployeePayslipList';

/**
 * Payroll Employee Page
 * Route: /payroll/employee
 * Access: All authenticated employees
 */
export default function PayrollEmployeePage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Payslips</h1>
        <p className="text-muted-foreground mt-2">
          View and download your payslip documents
        </p>
      </div>

      <EmployeePayslipList />
    </div>
  );
}
