"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeForm } from "@/components/forms/EmployeeForm";
import { Plus, Edit, Trash2, Search, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { employeeApi, departmentApi, positionApi, ApiError } from "@/lib/api";
import type { EmployeeResponse, EmployeeStatus } from "@empcon/types";
import type { EmployeeFormData } from "@/lib/validations/employee";

export default function EmployeesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showSinVisibility, setShowSinVisibility] = useState<
    Record<string, boolean>
  >({});

  // API state
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [positions, setPositions] = useState<
    Array<{ id: string; title: string }>
  >([]);
  const [managers, setManagers] = useState<
    Array<{ id: string; firstName: string; lastName: string }>
  >([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsDataLoading(true);
    setError(null);
    try {
      const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
        employeeApi.getEmployees({ page: 1, limit: 100 }),
        departmentApi.getDepartments(),
        positionApi.getPositions(),
      ]);

      setEmployees(employeesRes.employees);
      setDepartments(departmentsRes.data || []);
      setPositions(positionsRes.data || []);

      // Extract managers from employees (those with MANAGER or ADMIN role)
      const managerEmployees = employeesRes.employees
        .filter(
          (emp) => emp.user?.role === "MANAGER" || emp.user?.role === "ADMIN"
        )
        .map((emp) => ({
          id: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
        }));
      setManagers(managerEmployees);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to load data"
      );
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    setIsLoading(true);
    try {
      await employeeApi.createEmployee(data);
      setIsCreateDialogOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error creating employee:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to create employee"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;

    setIsLoading(true);
    try {
      await employeeApi.updateEmployee(editingEmployee.id, data);
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating employee:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to update employee"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await employeeApi.deleteEmployee(employeeId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to delete employee"
      );
    }
  };

  const openEditDialog = (employee: EmployeeResponse) => {
    setEditingEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const toggleSinVisibility = (employeeId: string) => {
    setShowSinVisibility((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  const getStatusBadgeColor = (status: EmployeeStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "ON_LEAVE":
        return "outline";
      case "TERMINATED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;
    const matchesDepartment =
      departmentFilter === "all" || employee.departmentId === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (isDataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">Loading employee data...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-red-600">Error: {error}</p>
          </div>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">
            Manage employee information and records.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm
              onSubmit={handleCreateEmployee}
              isLoading={isLoading}
              mode="create"
              availableDepartments={departments}
              availablePositions={positions}
              availableManagers={managers}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
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
            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pay Type</TableHead>
                <TableHead>SIN</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-mono text-sm">
                    {employee.employeeNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </div>
                      {employee.middleName && (
                        <div className="text-sm text-muted-foreground">
                          {employee.middleName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    {employee.department ? (
                      <Badge variant="outline">
                        {employee.department.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.position ? (
                      <span className="text-sm">{employee.position.title}</span>
                    ) : (
                      <Badge variant="secondary">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(employee.status)}>
                      {employee.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{employee.payType}</div>
                      <div className="text-muted-foreground">
                        {employee.payType === "HOURLY"
                          ? `$${employee.payRate}/hr`
                          : `$${employee.payRate.toLocaleString()}/yr`}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {employee.sin
                          ? showSinVisibility[employee.id]
                            ? employee.sin
                            : "***-***-***"
                          : "N/A"}
                      </span>
                      {employee.sin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSinVisibility(employee.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showSinVisibility[employee.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.manager ? (
                      <span className="text-sm">
                        {employee.manager.firstName} {employee.manager.lastName}
                      </span>
                    ) : (
                      <Badge variant="secondary">No Manager</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm
              initialData={{
                firstName: editingEmployee.firstName,
                lastName: editingEmployee.lastName,
                middleName: editingEmployee.middleName || "",
                email: editingEmployee.user?.email || editingEmployee.email,
                phone: editingEmployee.phone,
                addressLine1: editingEmployee.addressLine1,
                addressLine2: editingEmployee.addressLine2 || "",
                city: editingEmployee.city,
                province: editingEmployee.province,
                postalCode: editingEmployee.postalCode,
                dateOfBirth: editingEmployee.dateOfBirth,
                hireDate: editingEmployee.hireDate,
                payRate: editingEmployee.payRate,
                payType: editingEmployee.payType,
                departmentId: editingEmployee.departmentId,
                positionId: editingEmployee.positionId,
                managerId: editingEmployee.managerId || "",
                sin: editingEmployee.sin || "***-***-***", // Show real SIN if available
                emergencyContactName:
                  editingEmployee.emergencyContactName || "",
                emergencyContactPhone:
                  editingEmployee.emergencyContactPhone || "",
                notes: editingEmployee.notes || "",
              }}
              onSubmit={handleEditEmployee}
              isLoading={isLoading}
              mode="edit"
              availableDepartments={departments}
              availablePositions={positions}
              availableManagers={managers}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
