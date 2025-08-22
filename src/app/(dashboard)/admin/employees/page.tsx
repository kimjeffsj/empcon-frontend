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
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Users, Mail, Phone } from "lucide-react";
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
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] =
    useState<EmployeeResponse | null>(null);
  const [viewingEmployee, setViewingEmployee] =
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
          firstName: emp.firstName || emp.user?.email.split('@')[0] || 'Unknown',
          lastName: emp.lastName || '',
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

  const openDetailDialog = (employee: EmployeeResponse) => {
    setViewingEmployee(employee);
    setIsDetailDialogOpen(true);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage and view employee information.
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-black/90 text-white">
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

      {/* Search and Filters */}
      <Card className="bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-white">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-white">
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

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
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
                <TableHead>Hire Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openDetailDialog(employee)}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {employee.firstName || employee.lastName ? 
                          `${employee.firstName} ${employee.lastName}`.trim() :
                          <span className="text-muted-foreground">
                            {employee.user?.email.split('@')[0] || 'Unknown User'}
                          </span>
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.user?.email || employee.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {employee.user?.email || employee.email}
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {employee.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {employee.department?.name || 'Unassigned'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {employee.position?.title || 'No Position'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'Not Set'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(employee.status)}>
                      {employee.status === 'ON_LEAVE' ? 'On Leave' : 
                       employee.status === 'ACTIVE' ? 'Active' : employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(employee);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmployee(employee.id);
                        }}
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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Full Name</h3>
                  <p className="font-medium">
                    {viewingEmployee.firstName || viewingEmployee.lastName ? 
                      `${viewingEmployee.firstName} ${viewingEmployee.lastName}`.trim() :
                      viewingEmployee.user?.email.split('@')[0] || 'Unknown User'
                    }
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Employee #</h3>
                  <p className="font-mono">{viewingEmployee.employeeNumber || 'Not Assigned'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Email</h3>
                  <p>{viewingEmployee.user?.email || viewingEmployee.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Phone</h3>
                  <p>{viewingEmployee.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Department</h3>
                  <p>{viewingEmployee.department?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Position</h3>
                  <p>{viewingEmployee.position?.title || 'No Position'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                  <Badge variant={getStatusBadgeColor(viewingEmployee.status)}>
                    {viewingEmployee.status === 'ON_LEAVE' ? 'On Leave' : 
                     viewingEmployee.status === 'ACTIVE' ? 'Active' : viewingEmployee.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Hire Date</h3>
                  <p>{viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString() : 'Not Set'}</p>
                </div>
                {viewingEmployee.payRate > 0 && (
                  <>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Pay Type</h3>
                      <p>{viewingEmployee.payType}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground">Pay Rate</h3>
                      <p>
                        {viewingEmployee.payType === "HOURLY"
                          ? `$${viewingEmployee.payRate}/hr`
                          : `$${viewingEmployee.payRate.toLocaleString()}/yr`}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {viewingEmployee.addressLine1 && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Address</h3>
                  <div className="text-sm space-y-1">
                    <p>{viewingEmployee.addressLine1}</p>
                    {viewingEmployee.addressLine2 && <p>{viewingEmployee.addressLine2}</p>}
                    <p>{viewingEmployee.city}, {viewingEmployee.province} {viewingEmployee.postalCode}</p>
                  </div>
                </div>
              )}

              {(viewingEmployee.emergencyContactName || viewingEmployee.emergencyContactPhone) && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">Emergency Contact</h3>
                  <div className="space-y-1">
                    {viewingEmployee.emergencyContactName && <p>Name: {viewingEmployee.emergencyContactName}</p>}
                    {viewingEmployee.emergencyContactPhone && <p>Phone: {viewingEmployee.emergencyContactPhone}</p>}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    openEditDialog(viewingEmployee);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
