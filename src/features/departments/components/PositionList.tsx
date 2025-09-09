"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
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
import { Edit, Trash2, Users } from "lucide-react";
import {
  useGetPositionsQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
  type PositionResponse,
} from "@/store/api/positionsApi";
import { type DepartmentResponse } from "@/store/api/departmentsApi";
import { PositionForm } from "./PositionForm";
import { toast } from "sonner";

interface PositionListProps {
  searchTerm: string;
  departments: DepartmentResponse[];
  departmentFilter?: string;
  onPositionChange?: () => void;
  triggerAdd?: boolean;
  onAddTriggered?: () => void;
}

export function PositionList({
  searchTerm,
  departments,
  departmentFilter = "all",
  onPositionChange,
  triggerAdd,
  onAddTriggered,
}: PositionListProps) {
  const [isPosDialogOpen, setIsPosDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] =
    useState<PositionResponse | null>(null);

  // API hooks
  const { data: positions = [] } = useGetPositionsQuery({});
  const [createPosition, { isLoading: isCreatingPos }] =
    useCreatePositionMutation();
  const [updatePosition, { isLoading: isUpdatingPos }] =
    useUpdatePositionMutation();
  const [deletePosition] = useDeletePositionMutation();

  // Handle external trigger for Add Position
  useEffect(() => {
    if (triggerAdd) {
      openAddPositionDialog();
      onAddTriggered?.();
    }
  }, [triggerAdd, onAddTriggered]);

  // CRUD Handlers
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
      onPositionChange?.();
    } catch (error) {
      toast.error("Failed to create position", {
        description: "Please check your input and try again.",
      });
      throw error;
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
      onPositionChange?.();
    } catch (error) {
      toast.error("Failed to update position", {
        description: "Please check your input and try again.",
      });
      throw error;
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
      onPositionChange?.();
    } catch (error) {
      toast.error("Failed to delete position", {
        description: "Position may have active employees assigned.",
      });
      throw error;
    }
  };

  // Dialog handlers
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
  const filteredPositions = positions.filter((pos) => {
    // Search filter
    const matchesSearch =
      pos.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.department.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" || pos.departmentId === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Position List ({filteredPositions.length} positions)
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    <Badge variant="outline">{position.department.name}</Badge>
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

          {filteredPositions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No positions found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
