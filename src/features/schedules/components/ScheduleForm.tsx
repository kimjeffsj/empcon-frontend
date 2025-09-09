"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateScheduleRequest,
  UpdateScheduleRequest,
  Schedule,
  CreateScheduleRequestSchema,
  UpdateScheduleRequestSchema,
} from "@empcon/types";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Card, CardContent } from "@/shared/ui/card";
import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { useGetEmployeesQuery } from "@/store/api/employeesApi";
import { useLazyCheckScheduleConflictsQuery } from "@/store/api/schedulesApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialData?: Schedule;
  onSubmit: (
    data: CreateScheduleRequest | UpdateScheduleRequest
  ) => Promise<void>;
}

// Utility functions for date/time handling
const formatDateForInput = (date: string | Date) => {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};

const formatTimeForInput = (date: string | Date) => {
  const d = new Date(date);
  return d.toTimeString().slice(0, 5);
};

const combineDateAndTime = (date: string, time: string): string => {
  const dateObj = new Date(`${date}T${time}`);
  return dateObj.toISOString();
};

export const ScheduleForm = ({
  open,
  onClose,
  mode = "create",
  initialData,
  onSubmit,
}: ScheduleFormProps) => {
  // Get employees for dropdown
  const { data: employeesData, isLoading: employeesLoading } =
    useGetEmployeesQuery({
      limit: 100,
      status: "ACTIVE" as const,
    });

  // Conflict checking
  const [checkConflicts, { data: conflictData, isLoading: conflictLoading }] =
    useLazyCheckScheduleConflictsQuery();

  // Form setup
  const schema =
    mode === "edit" ? UpdateScheduleRequestSchema : CreateScheduleRequestSchema;

  const form = useForm<CreateScheduleRequest | UpdateScheduleRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: "",
      startTime: "",
      endTime: "",
      breakDuration: 0,
      position: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;

  // Watch form values for conflict checking
  const employeeId = watch("employeeId");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  // State for date and time inputs
  const [selectedDate, setSelectedDate] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [endTimeInput, setEndTimeInput] = useState("");

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData && open) {
      // initialData.startTime/endTime are now strings from API
      const startDate = new Date(initialData.startTime);
      const endDate = new Date(initialData.endTime);

      setSelectedDate(formatDateForInput(startDate));
      setStartTimeInput(formatTimeForInput(startDate));
      setEndTimeInput(formatTimeForInput(endDate));

      reset({
        employeeId: initialData.employeeId,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        breakDuration: initialData.breakDuration,
        position: initialData.position || "",
        notes: initialData.notes || "",
      });
    } else if (mode === "create" && open) {
      // Reset form for create mode
      const today = new Date();
      setSelectedDate(formatDateForInput(today));
      setStartTimeInput("09:00");
      setEndTimeInput("17:00");

      reset({
        employeeId: "",
        startTime: "",
        endTime: "",
        breakDuration: 0,
        position: "",
        notes: "",
      });
    }
  }, [mode, initialData, open, reset]);

  // Update combined datetime when date/time inputs change
  useEffect(() => {
    if (selectedDate && startTimeInput) {
      const combined = combineDateAndTime(selectedDate, startTimeInput);
      setValue("startTime", combined);
    }
  }, [selectedDate, startTimeInput, setValue]);

  useEffect(() => {
    if (selectedDate && endTimeInput) {
      const combined = combineDateAndTime(selectedDate, endTimeInput);
      setValue("endTime", combined);
    }
  }, [selectedDate, endTimeInput, setValue]);

  // Check conflicts when relevant fields change
  useEffect(() => {
    if (employeeId && startTime && endTime) {
      const timeoutId = setTimeout(() => {
        checkConflicts({
          employeeId,
          startTime,
          endTime,
          excludeScheduleId: mode === "edit" ? initialData?.id : undefined,
        });
      }, 500); // Debounce

      return () => clearTimeout(timeoutId);
    }
  }, [employeeId, startTime, endTime, checkConflicts, mode, initialData?.id]);

  const handleFormSubmit = async (
    data: CreateScheduleRequest | UpdateScheduleRequest
  ) => {
    try {
      await onSubmit(data);
      onClose();
      reset();
      toast.success(mode === "edit" ? "Schedule Updated" : "Schedule Created", {
        description:
          mode === "edit"
            ? "The schedule has been updated successfully."
            : "New schedule has been created successfully.",
      });
    } catch (error) {
      toast.error(
        mode === "edit"
          ? "Failed to update schedule"
          : "Failed to create schedule",
        {
          description: "Please check your input and try again.",
        }
      );
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setSelectedDate("");
    setStartTimeInput("");
    setEndTimeInput("");
  };

  const employees = employeesData?.employees || [];
  const hasConflict = conflictData?.hasConflict;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {mode === "edit" ? "Edit Schedule" : "Create New Schedule"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee *</Label>
            <Controller
              name="employeeId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employeesLoading ? (
                      <SelectItem value="" disabled>
                        Loading employees...
                      </SelectItem>
                    ) : (
                      employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} (
                          {employee.employeeNumber})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date and Time Inputs */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTimeInput}
                      onChange={(e) => setEndTimeInput(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conflict Warning */}
          {conflictLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Checking for schedule conflicts...
              </AlertDescription>
            </Alert>
          )}

          {hasConflict && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: This schedule conflicts with existing schedules for
                this employee.
                {conflictData?.conflictingSchedules?.map((conflict, index) => (
                  <div key={index} className="mt-1 text-sm">
                    • Conflict with schedule from{" "}
                    {formatTimeForInput(conflict.startTime)} to{" "}
                    {formatTimeForInput(conflict.endTime)}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {!hasConflict &&
            !conflictLoading &&
            employeeId &&
            startTime &&
            endTime && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No schedule conflicts detected.
                </AlertDescription>
              </Alert>
            )}

          {/* Additional Fields */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
          {/* Break Duration */}
          {/* <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
              <Controller
                name="breakDuration"
                control={control}
                render={({ field }) => (
                  <Input
                    id="breakDuration"
                    type="number"
                    min="0"
                    max="480"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                )}
              />
            </div> */}

          {/* Position */}
          {/* <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <Input
                    id="position"
                    placeholder="e.g., Cashier, Server, Cook..."
                    {...field}
                  />
                )}
              />
            </div>
          </div> */}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or notes for this schedule..."
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>

          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (hasConflict && mode === "create")}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                ? "Update Schedule"
                : "Create Schedule"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
