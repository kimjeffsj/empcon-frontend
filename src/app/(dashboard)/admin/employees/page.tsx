"use client";

import { useState } from "react";
import { EmployeeList } from "@/features/employees/components/EmployeeList";
import { AddEmployeeModal } from "@/features/employees/components/AddEmployeeModal";
import { CreateEmployeeRequest, UpdateEmployeeRequest, EmployeeResponse } from "@empcon/types";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/store/api/employeesApi";
import { toast } from "sonner";

export default function EmployeesPage() {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeResponse | null>(null);

  // Mutations
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  // Add Employee Handler
  const handleAddEmployee = async (employeeData: CreateEmployeeRequest) => {
    try {
      await createEmployee(employeeData).unwrap();
      toast.success("Employee Added Successfully", {
        description: `${employeeData.firstName} ${employeeData.lastName} has been added to the system.`,
      });
      setIsAddModalOpen(false);
    } catch {
      toast.error("Failed to add employee", {
        description: "Please try again later.",
      });
    }
  };

  // Edit Employee Handlers
  const handleEditEmployee = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async (updatedData: UpdateEmployeeRequest) => {
    if (!editingEmployee) return;

    try {
      await updateEmployee({
        id: editingEmployee.id,
        data: updatedData,
      }).unwrap();

      toast.success("Employee Updated Successfully", {
        description: `${updatedData.firstName} ${updatedData.lastName} has been updated.`,
      });

      setIsEditModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast.error("Failed to update employee", {
        description: "Please try again later.",
      });
      throw error;
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeResponse) => {
    try {
      await deleteEmployee(employee.id).unwrap();
      toast.success("Employee Deleted Successfully", {
        description: `${employee.firstName} ${employee.lastName} has been removed.`,
      });
    } catch {
      toast.error("Failed to delete employee", {
        description: "Please try again later.",
      });
    }
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingEmployee(null);
  };

  return (
    <div className="container mx-auto py-6">
      <EmployeeList 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onAddClick={() => setIsAddModalOpen(true)}
        onEditClick={handleEditEmployee}
        onDeleteClick={handleDeleteEmployee}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={handleCloseModals}
        onCreate={handleAddEmployee}
        mode="create"
      />

      {/* Edit Employee Modal */}
      <AddEmployeeModal
        open={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleUpdateEmployee}
        mode="edit"
        initialData={editingEmployee || undefined}
      />
    </div>
  );
}
