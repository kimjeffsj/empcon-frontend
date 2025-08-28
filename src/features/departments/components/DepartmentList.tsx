"use client";

import { useState } from "react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  type DepartmentResponse,
} from "@/store/api/departmentsApi";
import { DepartmentForm } from "./DepartmentForm";
import { toast } from "sonner";

interface DepartmentListProps {
  searchTerm: string;
  onDepartmentChange?: () => void;
}

export function DepartmentList({ searchTerm, onDepartmentChange }: DepartmentListProps) {
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponse | null>(null);

  // API hooks
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [createDepartment, { isLoading: isCreatingDept }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdatingDept }] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();

  // CRUD Handlers
  const handleCreateDepartment = async (data: { name: string; description?: string }) => {
    try {
      const result = await createDepartment(data).unwrap();
      setIsDeptDialogOpen(false);
      setEditingDepartment(null);
      toast.success("Department Created Successfully", {
        description: `${result.name} department has been created.`,
      });
      onDepartmentChange?.();
    } catch (error) {
      toast.error("Failed to create department", {
        description: "Please check your input and try again.",
      });
      throw error;
    }
  };

  const handleUpdateDepartment = async (data: { name: string; description?: string }) => {
    if (!editingDepartment) return;

    try {
      const result = await updateDepartment({
        id: editingDepartment.id,
        data,
      }).unwrap();
      setIsDeptDialogOpen(false);
      setEditingDepartment(null);
      toast.success("Department Updated Successfully", {
        description: `${result.name} department has been updated.`,
      });
      onDepartmentChange?.();
    } catch (error) {
      toast.error("Failed to update department", {
        description: "Please check your input and try again.",
      });
      throw error;
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    const department = departments.find((d) => d.id === departmentId);
    if (
      !confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteDepartment(departmentId).unwrap();
      toast.success("Department Deleted Successfully", {
        description: `${department?.name || "Department"} has been removed.`,
      });
      onDepartmentChange?.();
    } catch (error) {
      toast.error("Failed to delete department", {
        description: "Department may have active employees assigned.",
      });
    }
  };

  // Dialog handlers
  const openAddDepartmentDialog = () => {
    setEditingDepartment(null);
    setIsDeptDialogOpen(true);
  };

  const openEditDepartmentDialog = (department: DepartmentResponse) => {
    setEditingDepartment(department);
    setIsDeptDialogOpen(true);
  };

  const closeDepartmentDialog = () => {
    setIsDeptDialogOpen(false);
    setEditingDepartment(null);
  };

  // Filter data
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3>Department Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage organizational departments and their structure.
          </p>
        </div>
        <Button onClick={openAddDepartmentDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Departments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{department.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {department.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.manager
                      ? `${department.manager.firstName} ${department.manager.lastName}`
                      : "No manager assigned"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{department.employeeCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDepartmentDialog(department)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDepartment(department.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No departments found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Dialog */}
      <AlertDialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingDepartment ? "Edit Department" : "Add New Department"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <DepartmentForm
            department={editingDepartment}
            onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
            onCancel={closeDepartmentDialog}
            isLoading={isCreatingDept || isUpdatingDept}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}