"use client";

import { EmployeeList } from "@/features/employees/components/EmployeeList";
import { LoadingIndicator } from "@/shared/components/Loading";
import { useState } from "react";

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-red-600 font-medium">Error loading employees</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto py-6">
      <EmployeeList />
    </div>
  );
}
