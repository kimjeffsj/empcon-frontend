"use client";

import { useState } from "react";
import { DepartmentPositionManagement } from "@/features/departments/components/DepartmentPositionManagement";
import { useGetDepartmentsQuery } from "@/store/api/departmentsApi";
import { useGetPositionsQuery } from "@/store/api/positionsApi";

export default function DepartmentsPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("departments");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [triggerAddDepartment, setTriggerAddDepartment] = useState(false);
  const [triggerAddPosition, setTriggerAddPosition] = useState(false);

  // API hooks for data sharing
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: positions = [] } = useGetPositionsQuery({});

  // Add button handlers
  const handleAddDepartment = () => {
    setActiveTab("departments");
    setTriggerAddDepartment(true);
  };

  const handleAddPosition = () => {
    setActiveTab("positions");
    setTriggerAddPosition(true);
  };

  // Force refresh when data changes
  const handleDataChange = () => {
    // Data will automatically refresh via RTK Query cache invalidation
  };

  // Reset triggers after they've been handled
  const resetDepartmentTrigger = () => setTriggerAddDepartment(false);
  const resetPositionTrigger = () => setTriggerAddPosition(false);

  return (
    <div className="container mx-auto py-6">
      <DepartmentPositionManagement
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        triggerAddDepartment={triggerAddDepartment}
        triggerAddPosition={triggerAddPosition}
        departments={departments}
        positions={positions}
        onAddDepartment={handleAddDepartment}
        onAddPosition={handleAddPosition}
        onDataChange={handleDataChange}
        onResetDepartmentTrigger={resetDepartmentTrigger}
        onResetPositionTrigger={resetPositionTrigger}
      />
    </div>
  );
}
