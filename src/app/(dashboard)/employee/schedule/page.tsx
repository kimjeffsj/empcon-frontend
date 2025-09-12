"use client";

import { EmployeeScheduleHeader } from "@/features/schedules/components/employee/EmployeeScheduleHeader";
import { EmployeeScheduleCalendar } from "@/features/schedules/components/employee/EmployeeScheduleCalendar";

export default function EmployeeSchedulePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with 4 Core Stats */}
      <EmployeeScheduleHeader />

      {/* Monthly Calendar View */}
      <EmployeeScheduleCalendar />
    </div>
  );
}
