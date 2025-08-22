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
import { PositionForm } from "@/components/forms/PositionForm";
import type { PositionFormData } from "@/lib/validations/employee";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockPositions = [
  {
    id: "1",
    title: "Software Developer",
    departmentId: "dept-1",
    department: { name: "Engineering" },
    description: "Develops and maintains web applications",
    employeeCount: 8,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "HR Manager",
    departmentId: "dept-2",
    department: { name: "Human Resources" },
    description: "Oversees HR operations and employee relations",
    employeeCount: 1,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    title: "Sales Representative",
    departmentId: "dept-3",
    department: { name: "Sales" },
    description: "Manages client relationships and sales activities",
    employeeCount: 6,
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    title: "Marketing Coordinator",
    departmentId: "dept-4",
    department: { name: "Marketing" },
    description: "Coordinates marketing campaigns and content creation",
    employeeCount: 2,
    createdAt: "2024-02-10",
  },
];

const mockDepartments = [
  { id: "dept-1", name: "Engineering" },
  { id: "dept-2", name: "Human Resources" },
  { id: "dept-3", name: "Sales" },
  { id: "dept-4", name: "Marketing" },
];

export default function PositionsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<typeof mockPositions[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePosition = async (data: PositionFormData) => {
    setIsLoading(true);
    try {
      // TODO: API call to create position
      console.log("Creating position:", data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating position:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPosition = async (data: PositionFormData) => {
    if (!editingPosition) return;
    
    setIsLoading(true);
    try {
      // TODO: API call to update position
      console.log("Updating position:", editingPosition.id, data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setIsEditDialogOpen(false);
      setEditingPosition(null);
    } catch (error) {
      console.error("Error updating position:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm("Are you sure you want to delete this position?")) {
      return;
    }
    
    try {
      // TODO: API call to delete position
      console.log("Deleting position:", positionId);
    } catch (error) {
      console.error("Error deleting position:", error);
    }
  };

  const openEditDialog = (position: typeof mockPositions[0]) => {
    setEditingPosition(position);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground">
            Manage job positions within departments.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Position</DialogTitle>
            </DialogHeader>
            <PositionForm
              onSubmit={handleCreatePosition}
              isLoading={isLoading}
              mode="create"
              availableDepartments={mockDepartments}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-medium">{position.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{position.department.name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {position.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {position.employeeCount} employee{position.employeeCount !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>{position.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(position)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
          </DialogHeader>
          {editingPosition && (
            <PositionForm
              initialData={{
                title: editingPosition.title,
                departmentId: editingPosition.departmentId,
                description: editingPosition.description,
              }}
              onSubmit={handleEditPosition}
              isLoading={isLoading}
              mode="edit"
              availableDepartments={mockDepartments}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}