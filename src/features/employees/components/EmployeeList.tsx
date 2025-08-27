"use client";

import { useMemo, useState } from "react";
import { CreateEmployeeRequest, EmployeeResponse } from "@empcon/types";
import { Button } from "@/shared/ui/button";
import { Edit, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { AddEmployeeModal } from "./AddEmployeeModal";
import { toast } from "sonner";
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  formatPayRate,
  formatPhoneNumber,
  formatUserDate,
} from "@/lib/formatter";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "@/store/api/employeesApi";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";

export const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: employeesData,
    isLoading,
    error,
    refetch,
  } = useGetEmployeesQuery({
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    departmentId: departmentFilter === "all" ? undefined : departmentFilter,
    page: 1,
    limit: 100,
  });

  // Mutation hooks
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const employees = employeesData?.employees || [];

  const filteredEmployees = employees;

  const departments = useMemo(() => {
    const deptMap = new Map();
    employees.forEach((emp) => {
      if (emp.department) {
        deptMap.set(emp.department.id, emp.department);
      }
    });
    return Array.from(deptMap.values());
  }, [employees]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Employee states
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleAddEmployee = async (employeeData: CreateEmployeeRequest) => {
    try {
      await createEmployee(employeeData).unwrap();
      toast.success("Employee Added Successfully", {
        description: `${employeeData.firstName} ${employeeData.lastName} has been added to the system.`,
      });
    } catch (error) {
      toast.error("Failed to add employee", {
        description: "Please try again later.",
      });
    }
  };

  // Edit Employee handlers
  const handleEditEmployee = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async (updatedData: CreateEmployeeRequest) => {
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
    }
  };

  const handleDeleteEmployee = async (employee: EmployeeResponse) => {
    try {
      await deleteEmployee(employee.id).unwrap();
      toast.success("Employee Deleted Successfully", {
        description: `${employee.firstName} ${employee.lastName} has been removed.`,
      });
    } catch (error) {
      toast.error("Failed to delete employee", {
        description: "Please try again later.",
      });
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading employees..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Employees"
        message="Unable to fetch employee data. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage and view employee information
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* 검색 입력 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 부서 필터 */}
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 상태 필터 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 직원 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>
            Employee List ({filteredEmployees.length} employees)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department/Position</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  {/* 이름 */}
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {employee.employeeNumber}
                      </p>
                    </div>
                  </TableCell>

                  {/* 연락처 */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatPhoneNumber(employee.phone)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* 부서/직책 */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.department?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.position?.title}
                      </p>
                    </div>
                  </TableCell>

                  {/* 급여 */}
                  <TableCell>
                    {formatPayRate(employee.payRate, employee.payType)}
                  </TableCell>

                  {/* 입사일 */}
                  <TableCell>{formatUserDate(employee.hireDate)}</TableCell>

                  {/* 상태 */}
                  <TableCell>
                    <StatusBadge status={employee.status} />
                  </TableCell>

                  {/* 액션 */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 검색 결과가 없을 때 */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No employees found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
        mode="create"
      />

      {/* Edit Employee Modal */}
      <AddEmployeeModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleUpdateEmployee}
        mode="edit"
        initialData={editingEmployee || undefined}
      />
    </div>
  );
};
