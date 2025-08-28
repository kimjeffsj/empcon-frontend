"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  Users,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  type DepartmentResponse,
} from "@/store/api/departmentsApi";
import {
  useGetPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
  type PositionResponse,
} from "@/store/api/positionsApi";
import { DepartmentForm } from "./DepartmentForm";
import { PositionForm } from "./PositionForm";
import { toast } from "sonner";

export function DepartmentPositionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isPosDialogOpen, setIsPosDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentResponse | null>(null);
  const [editingPosition, setEditingPosition] =
    useState<PositionResponse | null>(null);

  // API hooks
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: positions = [] } = useGetPositionsQuery({});
  const [createDepartment, { isLoading: isCreatingDept }] =
    useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdatingDept }] =
    useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const [createPosition, { isLoading: isCreatingPos }] =
    useCreatePositionMutation();
  const [updatePosition, { isLoading: isUpdatingPos }] =
    useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

  // CRUD Handlers for Department
  const handleCreateDepartment = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      const result = await createDepartment(data).unwrap();
      setIsDeptDialogOpen(false);
      setEditingDepartment(null);
      toast.success("Department Created Successfully", {
        description: `${result.name} department has been created.`,
      });
    } catch (error) {
      toast.error("Failed to create department", {
        description: "Please check your input and try again.",
      });
      throw error; // Re-throw to prevent modal close
    }
  };

  const handleUpdateDepartment = async (data: {
    name: string;
    description?: string;
  }) => {
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
    } catch (error) {
      toast.error("Failed to update department", {
        description: "Please check your input and try again.",
      });
      throw error; // Re-throw to prevent modal close
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
    } catch (error) {
      toast.error("Failed to delete department", {
        description: "Department may have active employees assigned.",
      });
    }
  };

  // CRUD Handlers for Position
  const handleCreatePosition = async (data: {
    title: string;
    departmentId: string;
    description?: string;
  }) => {
    try {
      const result = await createPosition(data).unwrap();
      setIsPosDialogOpen(false);
      setEditingPosition(null);
      toast.success("Position Created Successfully", {
        description: `${result.title} position has been created.`,
      });
    } catch (error) {
      toast.error("Failed to create position", {
        description: "Please check your input and try again.",
      });
      throw error; // Re-throw to prevent modal close
    }
  };

  const handleUpdatePosition = async (data: {
    title: string;
    departmentId: string;
    description?: string;
  }) => {
    if (!editingPosition) return;

    try {
      const result = await updatePosition({
        id: editingPosition.id,
        data,
      }).unwrap();
      setIsPosDialogOpen(false);
      setEditingPosition(null);
      toast.success("Position Updated Successfully", {
        description: `${result.title} position has been updated.`,
      });
    } catch (error) {
      toast.error("Failed to update position", {
        description: "Please check your input and try again.",
      });
      throw error; // Re-throw to prevent modal close
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    const position = positions.find((p) => p.id === positionId);
    if (
      !confirm(
        "Are you sure you want to delete this position? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deletePosition(positionId).unwrap();
      toast.success("Position Deleted Successfully", {
        description: `${position?.title || "Position"} has been removed.`,
      });
    } catch (error) {
      toast.error("Failed to delete position", {
        description: "Position may have active employees assigned.",
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

  const openAddPositionDialog = () => {
    setEditingPosition(null);
    setIsPosDialogOpen(true);
  };

  const openEditPositionDialog = (position: PositionResponse) => {
    setEditingPosition(position);
    setIsPosDialogOpen(true);
  };

  const closePositionDialog = () => {
    setIsPosDialogOpen(false);
    setEditingPosition(null);
  };

  // Filter data
  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description &&
        dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPositions = positions.filter(
    (pos) =>
      pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalEmployees = departments.reduce(
    (sum, dept) => sum + dept.employeeCount,
    0
  );

  // Manager Coverage - percentage of departments with assigned managers
  const departmentsWithManagers = departments.filter(
    (dept) => dept.managerId
  ).length;
  const managerCoverage =
    departments.length > 0
      ? Math.round((departmentsWithManagers / departments.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Departments & Positions</h2>
        <p className="text-muted-foreground">
          Manage organizational structure, departments, and job positions.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Positions
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">defined positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Manager Coverage
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managerCoverage}%</div>
            <p className="text-xs text-muted-foreground">
              departments with managers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments and positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Departments and Positions */}
      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
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
                            onClick={() =>
                              handleDeleteDepartment(department.id)
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3>Position Management</h3>
              <p className="text-sm text-muted-foreground">
                Define job positions, levels, and salary ranges.
              </p>
            </div>
            <Button onClick={openAddPositionDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Position
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {position.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {position.department.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{position.employeeCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditPositionDialog(position)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePosition(position.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Organization Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Organization Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4>Department Distribution</h4>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">
                      {dept.employeeCount} (
                      {totalEmployees > 0
                        ? Math.round(
                            (dept.employeeCount / totalEmployees) * 100
                          )
                        : 0}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4>Management Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Managed Departments</span>
                  <span className="text-muted-foreground">
                    {departmentsWithManagers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Unmanaged Departments</span>
                  <span className="text-muted-foreground">
                    {departments.length - departmentsWithManagers}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Coverage Rate</span>
                  <span className="text-muted-foreground">
                    {managerCoverage}%
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4>Position Distribution</h4>
              <div className="space-y-2">
                {departments.map((dept) => {
                  const deptPositions = positions.filter(
                    (pos) => pos.departmentId === dept.id
                  ).length;
                  return (
                    <div
                      key={dept.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>{dept.name}</span>
                      <span className="text-muted-foreground">
                        {deptPositions} position{deptPositions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
            onSubmit={
              editingDepartment
                ? handleUpdateDepartment
                : handleCreateDepartment
            }
            onCancel={closeDepartmentDialog}
            isLoading={isCreatingDept || isUpdatingDept}
          />
        </AlertDialogContent>
      </AlertDialog>

      {/* Position Dialog */}
      <AlertDialog open={isPosDialogOpen} onOpenChange={setIsPosDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingPosition ? "Edit Position" : "Add New Position"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <PositionForm
            position={editingPosition}
            departments={departments}
            onSubmit={
              editingPosition ? handleUpdatePosition : handleCreatePosition
            }
            onCancel={closePositionDialog}
            isLoading={isCreatingPos || isUpdatingPos}
          />
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
