"use client";

import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { OrganizationStats } from "./OrganizationStats";
import { DepartmentList } from "./DepartmentList";
import { PositionList } from "./PositionList";
import { OrganizationInsights } from "./OrganizationInsights";
import { DepartmentResponse, PositionResponse } from "@empcon/types";

interface DepartmentPositionManagementProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: string;
  setActiveTab: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  triggerAddDepartment: boolean;
  triggerAddPosition: boolean;
  departments: DepartmentResponse[];
  positions: PositionResponse[];
  onAddDepartment: () => void;
  onAddPosition: () => void;
  onDataChange: () => void;
  onResetDepartmentTrigger: () => void;
  onResetPositionTrigger: () => void;
}

export function DepartmentPositionManagement({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  departmentFilter,
  setDepartmentFilter,
  triggerAddDepartment,
  triggerAddPosition,
  departments,
  positions,
  onAddDepartment,
  onAddPosition,
  onDataChange,
  onResetDepartmentTrigger,
  onResetPositionTrigger,
}: DepartmentPositionManagementProps) {

  return (
    <div className="space-y-6">
      {/* Header with Add buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Departments & Positions</h2>
          <p className="text-muted-foreground">
            Manage organizational structure, departments, and job positions.
          </p>
        </div>
        {activeTab === "departments" && (
          <Button onClick={onAddDepartment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
        {activeTab === "positions" && (
          <Button onClick={onAddPosition}>
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        )}
      </div>

      {/* Search */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search departments and positions..."
        filters={activeTab === "positions" ? [
          {
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { value: "all", label: "All Departments" },
              ...departments.map(dept => ({
                value: dept.id,
                label: dept.name
              }))
            ],
            placeholder: "Department",
            width: "w-48"
          }
        ] : []}
      />

      {/* Tabs for Departments and Positions */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <DepartmentList
            searchTerm={searchTerm}
            onDepartmentChange={onDataChange}
            triggerAdd={triggerAddDepartment}
            onAddTriggered={onResetDepartmentTrigger}
          />
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <PositionList
            searchTerm={searchTerm}
            departments={departments}
            departmentFilter={departmentFilter}
            onPositionChange={onDataChange}
            triggerAdd={triggerAddPosition}
            onAddTriggered={onResetPositionTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Organization Stats moved to bottom */}
      <OrganizationStats departments={departments} positions={positions} />

      <OrganizationInsights departments={departments} positions={positions} />
    </div>
  );
}
