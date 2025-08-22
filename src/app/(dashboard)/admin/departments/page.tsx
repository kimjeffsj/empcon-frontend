"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import type { DepartmentFormData } from "@/lib/validations/employee";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockDepartments = [
  {
    id: "1",
    name: "Human Resources",
    description: "Manages employee relations, recruitment, and compliance",
    managerId: "mgr-1",
    manager: { firstName: "Alice", lastName: "Smith" },
    employeeCount: 5,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Engineering",
    description: "Software development and technical operations",
    managerId: "mgr-2",
    manager: { firstName: "Bob", lastName: "Johnson" },
    employeeCount: 12,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Sales",
    description: "Customer acquisition and revenue generation",
    managerId: null,
    manager: null,
    employeeCount: 8,
    createdAt: "2024-02-01",
  },
];

const mockManagers = [
  { id: "mgr-1", firstName: "Alice", lastName: "Smith" },
  { id: "mgr-2", firstName: "Bob", lastName: "Johnson" },
  { id: "mgr-3", firstName: "Carol", lastName: "Williams" },
];

export default function DepartmentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<typeof mockDepartments[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateDepartment = async (data: DepartmentFormData) => {
    setIsLoading(true);
    try {
      // TODO: API call to create department
      console.log("Creating department:", data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating department:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDepartment = async (data: DepartmentFormData) => {
    if (!editingDepartment) return;
    
    setIsLoading(true);
    try {
      // TODO: API call to update department
      console.log("Updating department:", editingDepartment.id, data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditDialogOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      console.error("Error updating department:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }
    
    try {
      // TODO: API call to delete department
      console.log("Deleting department:", departmentId);
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const openEditDialog = (department: typeof mockDepartments[0]) => {
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage organizational departments and their managers.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm
              onSubmit={handleCreateDepartment}
              isLoading={isLoading}
              mode="create"
              availableManagers={mockManagers}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {department.description}
                  </TableCell>
                  <TableCell>
                    {department.manager ? (
                      <span>{department.manager.firstName} {department.manager.lastName}</span>
                    ) : (
                      <Badge variant="secondary">No Manager</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {department.employeeCount} employee{department.employeeCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>{department.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(department)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {editingDepartment && (
            <DepartmentForm
              initialData={{
                name: editingDepartment.name,
                description: editingDepartment.description,
                managerId: editingDepartment.managerId || "",
              }}
              onSubmit={handleEditDepartment}
              isLoading={isLoading}
              mode="edit"
              availableManagers={mockManagers}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}