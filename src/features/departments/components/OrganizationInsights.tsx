"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Building, Users, Briefcase, TrendingUp } from "lucide-react";
import { type DepartmentResponse } from "@/store/api/departmentsApi";
import { type PositionResponse } from "@/store/api/positionsApi";

interface OrganizationInsightsProps {
  departments: DepartmentResponse[];
  positions: PositionResponse[];
}

export function OrganizationInsights({
  departments,
  positions,
}: OrganizationInsightsProps) {
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
      {/* Organization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Organization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4>Department Distribution</h4>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">
                      {dept.employeeCount} (
                      {totalEmployees > 0
                        ? Math.round(
                            (dept.employeeCount / totalEmployees) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4>Management Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Managed Departments</span>
                  <span className="text-muted-foreground">
                    {departmentsWithManagers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Unmanaged Departments</span>
                  <span className="text-muted-foreground">
                    {departments.length - departmentsWithManagers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Coverage Rate</span>
                  <span className="text-muted-foreground">
                    {managerCoverage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4>Position Distribution</h4>
              <div className="space-y-2">
                {departments.map((dept) => {
                  const deptPositions = positions.filter(
                    (pos) => pos.departmentId === dept.id
                  ).length;
                  return (
                    <div
                      key={dept.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{dept.name}</span>
                      <span className="text-muted-foreground">
                        {deptPositions} position{deptPositions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
