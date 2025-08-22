"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building, 
  Users, 
  Briefcase,
  TrendingUp
} from "lucide-react";
import { DepartmentForm } from "@/components/forms/DepartmentForm";
import { PositionForm } from "@/components/forms/PositionForm";
import { departmentApi, positionApi, ApiError } from "@/lib/api";
import type { Department, Position } from "@empcon/types";

// Extended interfaces for UI display
interface DepartmentWithStats extends Department {
  employeeCount?: number;
}

interface PositionWithStats extends Position {
  departmentName?: string;
  employeeCount?: number;
}

export default function DepartmentsPage() {
  // State management
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [positions, setPositions] = useState<PositionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [isPosDialogOpen, setIsPosDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentWithStats | null>(null);
  const [editingPosition, setEditingPosition] = useState<PositionWithStats | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [departmentsRes, positionsRes] = await Promise.all([
        departmentApi.getDepartments(),
        positionApi.getPositions(),
      ]);

      // Transform departments data
      const departmentsData = departmentsRes.data || [];
      const transformedDepartments: DepartmentWithStats[] = departmentsData.map(dept => ({
        ...dept,
        createdAt: new Date(dept.createdAt || new Date()),
        updatedAt: new Date(dept.updatedAt || new Date()),
        createdBy: dept.createdBy || "system",
        employeeCount: 0 // Will be calculated from positions
      }));

      // Transform positions data
      const positionsData = positionsRes.data || [];
      const transformedPositions: PositionWithStats[] = positionsData.map(pos => {
        const department = transformedDepartments.find(d => d.id === pos.departmentId);
        return {
          ...pos,
          createdAt: new Date(pos.createdAt || new Date()),
          updatedAt: new Date(pos.updatedAt || new Date()),
          createdBy: pos.createdBy || "system",
          departmentName: department?.name || "Unknown Department",
          employeeCount: 0 // This would come from employee counts in a real scenario
        };
      });

      setDepartments(transformedDepartments);
      setPositions(transformedPositions);
    } catch (error) {
      console.error("Error loading data:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to load data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredPositions = positions.filter(pos =>
    pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pos.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmployees = departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);

  // Department CRUD handlers
  const handleCreateDepartment = async (data: any) => {
    setIsSubmitting(true);
    try {
      await departmentApi.createDepartment({
        name: data.name,
        description: data.description,
      });
      setIsDeptDialogOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error creating department:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to create department"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = async (data: any) => {
    if (!editingDepartment) return;
    setIsSubmitting(true);
    try {
      await departmentApi.updateDepartment(editingDepartment.id, {
        name: data.name,
        description: data.description,
      });
      setEditingDepartment(null);
      setIsDeptDialogOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating department:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to update department"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm("Are you sure you want to delete this department? This will also delete all associated positions.")) {
      return;
    }
    
    try {
      await departmentApi.deleteDepartment(departmentId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error deleting department:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to delete department"
      );
    }
  };

  // Position CRUD handlers
  const handleCreatePosition = async (data: any) => {
    setIsSubmitting(true);
    try {
      await positionApi.createPosition({
        title: data.title,
        departmentId: data.departmentId,
        description: data.description,
      });
      setIsPosDialogOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error creating position:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to create position"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPosition = async (data: any) => {
    if (!editingPosition) return;
    setIsSubmitting(true);
    try {
      await positionApi.updatePosition(editingPosition.id, {
        title: data.title,
        departmentId: data.departmentId,
        description: data.description,
      });
      setEditingPosition(null);
      setIsPosDialogOpen(false);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error updating position:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to update position"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm("Are you sure you want to delete this position?")) {
      return;
    }
    
    try {
      await positionApi.deletePosition(positionId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Error deleting position:", error);
      setError(
        error instanceof ApiError ? error.message : "Failed to delete position"
      );
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Departments & Positions</h1>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading departments and positions...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Departments & Positions</h1>
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
          <Button onClick={loadData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Departments & Positions</h1>
            <p className="text-muted-foreground">
              Manage organizational structure, departments, and job positions.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">defined positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">across all departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-gray-50/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments and positions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white"
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
              <h3 className="text-lg font-semibold">Department Management</h3>
              <p className="text-sm text-muted-foreground">Manage organizational departments and their structure.</p>
            </div>
            <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingDepartment(null)}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDepartment ? 'Edit Department' : 'Add New Department'}
                  </DialogTitle>
                </DialogHeader>
                <DepartmentForm
                  initialData={editingDepartment ? {
                    name: editingDepartment.name,
                    description: editingDepartment.description || ""
                  } : undefined}
                  onSubmit={editingDepartment ? handleEditDepartment : handleCreateDepartment}
                  onCancel={() => {
                    setIsDeptDialogOpen(false);
                    setEditingDepartment(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{department.name}</p>
                          <p className="text-sm text-muted-foreground">{department.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{department.employeeCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {department.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingDepartment(department);
                              setIsDeptDialogOpen(true);
                            }}
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
        </TabsContent>

        {/* Positions Tab */}
        <TabsContent value="positions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Position Management</h3>
              <p className="text-sm text-muted-foreground">Define job positions and their departments.</p>
            </div>
            <Dialog open={isPosDialogOpen} onOpenChange={setIsPosDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingPosition(null)}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPosition ? 'Edit Position' : 'Add New Position'}
                  </DialogTitle>
                </DialogHeader>
                <PositionForm
                  initialData={editingPosition ? {
                    title: editingPosition.title,
                    departmentId: editingPosition.departmentId,
                    description: editingPosition.description || ""
                  } : undefined}
                  departments={departments}
                  onSubmit={editingPosition ? handleEditPosition : handleCreatePosition}
                  onCancel={() => {
                    setIsPosDialogOpen(false);
                    setEditingPosition(null);
                  }}
                  isSubmitting={isSubmitting}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{position.title}</p>
                          <p className="text-sm text-muted-foreground">{position.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{position.departmentName}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{position.employeeCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {position.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingPosition(position);
                              setIsPosDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeletePosition(position.id)}
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
        </TabsContent>
      </Tabs>

      {/* Simple Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Organization Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Department Distribution</h4>
              <div className="space-y-2">
                {departments.map(dept => (
                  <div key={dept.id} className="flex justify-between items-center text-sm">
                    <span>{dept.name}</span>
                    <span className="text-muted-foreground">
                      {dept.employeeCount || 0} employees
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Positions by Department</h4>
              <div className="space-y-2">
                {departments.map(dept => {
                  const deptPositions = positions.filter(p => p.departmentId === dept.id);
                  return (
                    <div key={dept.id} className="flex justify-between items-center text-sm">
                      <span>{dept.name}</span>
                      <span className="text-muted-foreground">
                        {deptPositions.length} positions
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}