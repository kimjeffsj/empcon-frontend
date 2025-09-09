"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Building, Users, Briefcase } from "lucide-react";
import { type DepartmentResponse } from "@/store/api/departmentsApi";
import { type PositionResponse } from "@/store/api/positionsApi";

interface OrganizationStatsProps {
  departments: DepartmentResponse[];
  positions: PositionResponse[];
}

export function OrganizationStats({
  departments,
  positions,
}: OrganizationStatsProps) {
  // Calculate stats
  const totalEmployees = departments.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0
  );

  // Manager Coverage - percentage of departments with assigned managers
  const departmentsWithManagers = departments.filter(
    (dept) => dept.managerId
  ).length;
  const managerCoverage =
    departments.length > 0
      ? Math.round((departmentsWithManagers / departments.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Positions
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">defined positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Manager Coverage
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerCoverage}%</div>
            <p className="text-xs text-muted-foreground">
              departments with managers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
