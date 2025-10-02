"use client";

import { useMemo } from "react";
import {
  EmployeeResponse,
  EmployeeStatus,
} from "@empcon/types";
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
import { StatusBadge } from "@/shared/components/StatusBadge";
import {
  formatPayRate,
  formatPhoneNumber,
  formatUserDate,
} from "@/lib/formatter";
import {
  useGetEmployeesQuery,
} from "@/store/api/employeesApi";
import { LoadingIndicator } from "@/shared/components/Loading";
import { ErrorMessage } from "@/shared/components/ErrorMessage";

interface EmployeeListProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onAddClick: () => void;
  onEditClick: (employee: EmployeeResponse) => void;
  onDeleteClick: (employee: EmployeeResponse) => void;
}

export const EmployeeList = ({
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  onAddClick,
  onEditClick,
  onDeleteClick,
}: EmployeeListProps) => {

  const {
    data: employeesData,
    isLoading,
    error,
    refetch,
  } = useGetEmployeesQuery({
    search: searchTerm || undefined,
    status:
      statusFilter === "all" ? undefined : (statusFilter as EmployeeStatus),
    departmentId: departmentFilter === "all" ? undefined : departmentFilter,
    page: 1,
    limit: 100,
  });

  const employees = useMemo(() => employeesData?.data || [], [employeesData?.data]);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Employee Management</h2>
          <p className="text-muted-foreground">
            Manage and view employee information
          </p>
        </div>
        <Button onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Department Filter */}
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

            {/* Status Filter */}
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

      {/* Employee List Table */}
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
                  {/* Name */}
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

                  {/* Contact */}
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

                  {/* Department/Position */}
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.department?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.position?.title}
                      </p>
                    </div>
                  </TableCell>

                  {/* Salary */}
                  <TableCell>
                    {formatPayRate(employee.payRate, employee.payType)}
                  </TableCell>

                  {/* Hire Date */}
                  <TableCell>{formatUserDate(employee.hireDate)}</TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={employee.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditClick(employee)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteClick(employee)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* No search results */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No employees found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
