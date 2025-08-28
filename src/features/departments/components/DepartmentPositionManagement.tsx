"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useGetDepartmentsQuery } from "@/store/api/departmentsApi";
import { useGetPositionsQuery } from "@/store/api/positionsApi";
import { SearchFilter } from "@/shared/components/SearchFilter";
import { OrganizationStats } from "./OrganizationStats";
import { DepartmentList } from "./DepartmentList";
import { PositionList } from "./PositionList";
import { OrganizationInsights } from "./OrganizationInsights";

export function DepartmentPositionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("departments");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [triggerAddDepartment, setTriggerAddDepartment] = useState(false);
  const [triggerAddPosition, setTriggerAddPosition] = useState(false);

  // API hooks for data sharing
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: positions = [] } = useGetPositionsQuery({});

  // Force refresh when data changes
  const handleDataChange = () => {
    // Data will automatically refresh via RTK Query cache invalidation
  };

  // Add button handlers
  const handleAddDepartment = () => {
    setActiveTab("departments");
    setTriggerAddDepartment(true);
  };

  const handleAddPosition = () => {
    setActiveTab("positions");
    setTriggerAddPosition(true);
  };

  // Reset triggers after they've been handled
  const resetDepartmentTrigger = () => setTriggerAddDepartment(false);
  const resetPositionTrigger = () => setTriggerAddPosition(false);

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
          <Button onClick={handleAddDepartment}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
        {activeTab === "positions" && (
          <Button onClick={handleAddPosition}>
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
            onDepartmentChange={handleDataChange}
            triggerAdd={triggerAddDepartment}
            onAddTriggered={resetDepartmentTrigger}
          />
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <PositionList
            searchTerm={searchTerm}
            departments={departments}
            departmentFilter={departmentFilter}
            onPositionChange={handleDataChange}
            triggerAdd={triggerAddPosition}
            onAddTriggered={resetPositionTrigger}
          />
        </TabsContent>
      </Tabs>

      {/* Organization Stats moved to bottom */}
      <OrganizationStats departments={departments} positions={positions} />

      <OrganizationInsights departments={departments} positions={positions} />
    </div>
  );
}
