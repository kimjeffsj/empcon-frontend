import { PayrollAdminDashboard } from '../components/PayrollAdminDashboard';

/**
 * Payroll Admin Page
 * Route: /payroll/admin
 * Access: MANAGER and ADMIN only
 */
export default function PayrollAdminPage() {
  return <PayrollAdminDashboard />;
}
