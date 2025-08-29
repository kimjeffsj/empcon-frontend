"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { type DepartmentResponse } from "@/store/api/departmentsApi";
import { useGetEmployeesQuery } from "@/store/api/employeesApi";

interface DepartmentFormProps {
  department?: DepartmentResponse | null;
  onSubmit: (data: {
    name: string;
    description?: string;
    managerId?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function DepartmentForm({
  department,
  onSubmit,
  onCancel,
  isLoading = false,
}: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [managerId, setManagerId] = useState("");
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  // Get employees for manager selection
  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 100,
  });
  const employees = employeesData?.employees || [];

  // Filter employees to show only those with manager-level positions
  const managerCandidates = employees.filter((employee) => {
    if (!employee.position) return false;

    const positionTitle = employee.position.title.toLowerCase();

    // Simple filter: position title contains "manager"
    return positionTitle.includes("manager");
  });

  useEffect(() => {
    console.log("employees", employees);
    console.log("manager candidates", managerCandidates);
  }, []);

  // Initialize form with department data when editing
  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description || "");
      setManagerId(department.managerId || "");
    } else {
      setName("");
      setDescription("");
      setManagerId("");
    }
    setErrors({});
  }, [department]);

  const validateForm = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Department name is required";
    } else if (name.length > 100) {
      newErrors.name = "Department name must be less than 100 characters";
    }

    if (description && description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      managerId: managerId === "Manager" ? undefined : managerId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dept-name">Department Name *</Label>
        <Input
          id="dept-name"
          type="text"
          placeholder="e.g., Information Technology"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dept-manager">Department Manager</Label>
        <Select
          value={managerId}
          onValueChange={setManagerId}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select manager" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Manager">No manager assigned</SelectItem>
            {managerCandidates.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName} -{" "}
                {employee.position?.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dept-desc">Description</Label>
        <Textarea
          id="dept-desc"
          placeholder="Brief description of the department (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? department
              ? "Updating..."
              : "Creating..."
            : department
            ? "Update Department"
            : "Create Department"}
        </Button>
      </div>
    </form>
  );
}
