"use client";

import { AuthenticatedRoute } from "@/components/auth/protected-route";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminContent } from "@/components/dashboard/admin-content";
import { ManagerContent } from "@/components/dashboard/manager-content";
import { EmployeeContent } from "@/components/dashboard/employee-content";

export default function Dashboard() {
  const { user } = useAuth();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case "ADMIN":
        return "Admin Dashboard";
      case "MANAGER":
        return "Manager Dashboard";
      case "EMPLOYEE":
        return "Employee Dashboard";
      default:
        return "Dashboard";
    }
  };

  const renderRoleContent = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminContent />;
      case "MANAGER":
        return <ManagerContent />;
      case "EMPLOYEE":
        return <EmployeeContent />;
      default:
        return null;
    }
  };

  return (
    <AuthenticatedRoute>
      <MainLayout>
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>

            {/* Role-based Content */}
            {renderRoleContent()}

            {/* Shared User Info Section */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Email:</strong> {user?.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {user?.role}
                  </div>
                  <div>
                    <strong>Name:</strong> {user?.firstName} {user?.lastName}
                  </div>
                  <div>
                    <strong>User ID:</strong> {user?.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </AuthenticatedRoute>
  );
}
