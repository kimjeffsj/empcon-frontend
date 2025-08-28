"use client";

import { useState } from "react";
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

  // API hooks for data sharing
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: positions = [] } = useGetPositionsQuery({});

  // Force refresh when data changes
  const handleDataChange = () => {
    // Data will automatically refresh via RTK Query cache invalidation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Departments & Positions</h2>
        <p className="text-muted-foreground">
          Manage organizational structure, departments, and job positions.
        </p>
      </div>

      {/* Organization Stats */}
      <OrganizationStats departments={departments} positions={positions} />

      {/* Search */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search departments and positions..."
      />

      {/* Tabs for Departments and Positions */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <DepartmentList
            searchTerm={searchTerm}
            onDepartmentChange={handleDataChange}
          />
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions">
          <PositionList
            searchTerm={searchTerm}
            departments={departments}
            onPositionChange={handleDataChange}
          />
        </TabsContent>
      </Tabs>

      <OrganizationInsights departments={departments} positions={positions} />
    </div>
  );
}
