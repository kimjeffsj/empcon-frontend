"use client";

import { useMemo, useState } from "react";
import { mockDepartments, mockEmployees } from "../data/mockEmployees";
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

export const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [employees, setEmployees] = useState<EmployeeResponse[]>(mockEmployees);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Employee states
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filtered Employees (useMemo)
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchMatch =
        searchTerm === "" ||
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department?.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const departmentMatch =
        departmentFilter === "all" ||
        employee.departmentId === departmentFilter;

      const statusMatch =
        statusFilter === "all" || employee.status === statusFilter;

      return searchMatch && departmentMatch && statusMatch;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const handleAddEmployee = (employeeData: CreateEmployeeRequest) => {
    // Mock 데이터로 새 직원 생성
    const departmentName = mockDepartments.find(
      (d) => d.id === employeeData.departmentId
    )?.name;

    const newEmployee: EmployeeResponse = {
      id: `emp-${Date.now()}`, // 임시 ID
      employeeNumber: `EMP${Date.now().toString().slice(-9)}`,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      middleName: employeeData.middleName,
      email: employeeData.email,
      phone: employeeData.phone,
      addressLine1: employeeData.addressLine1,
      addressLine2: employeeData.addressLine2,
      city: employeeData.city,
      province: employeeData.province,
      postalCode: employeeData.postalCode,
      dateOfBirth: employeeData.dateOfBirth,
      hireDate: employeeData.hireDate,
      payRate: employeeData.payRate || 0,
      payType: employeeData.payType,
      status: "ACTIVE", // 새 직원은 기본적으로 ACTIVE
      departmentId: employeeData.departmentId,
      positionId: employeeData.positionId,
      managerId: employeeData.managerId,
      emergencyContactName: employeeData.emergencyContactName,
      emergencyContactPhone: employeeData.emergencyContactPhone,
      notes: employeeData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: `user-${Date.now()}`,
        email: employeeData.email,
        role: employeeData.role || "EMPLOYEE",
      },
      department: {
        id: employeeData.departmentId,
        name: departmentName || "Unknown",
      },
      position: {
        id: employeeData.positionId,
        title: "Position Title", // TODO: position 매핑 추가
      },
    };

    // 직원 목록에 추가
    setEmployees((prev) => [newEmployee, ...prev]);

    // 성공 알림
    toast.success("Employee Added Successfully", {
      description: `${newEmployee.firstName} ${newEmployee.lastName} has been added to the system.`,
    });

    console.log("New employee added:", newEmployee);
  };

  // Edit Employee handlers
  const handleEditEmployee = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = (updatedData: CreateEmployeeRequest) => {
    if (!editingEmployee) return;

    // Update employee in list
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              ...updatedData,
              updatedAt: new Date().toISOString(),
              user: {
                ...emp.user!,
                role: updatedData.role || emp.user?.role || "EMPLOYEE",
              },
            }
          : emp
      )
    );

    // Success notification
    toast.success("Employee Updated Successfully", {
      description: `${updatedData.firstName} ${updatedData.lastName} has been updated.`,
    });

    // Close modal and reset state
    setIsEditModalOpen(false);
    setEditingEmployee(null);

    console.log("Employee updated:", updatedData);
  };

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
                {mockDepartments.map((dept) => (
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
                      <Button variant="ghost" size="sm">
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
