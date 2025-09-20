"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import {
  Clock,
  Edit,
  AlertTriangle,
  User,
  Calendar,
  Save,
  X,
  History,
} from "lucide-react";
import { useAdjustTimeEntryMutation } from "@/store/api/timeclockApi";
import { TimeEntry } from "@empcon/types";
import {
  formatPacificTime12,
  formatPacificDate,
} from "@/shared/utils/dateTime";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Form validation schema
const timeAdjustmentSchema = z.object({
  clockInTime: z.string().min(1, "Clock in time is required"),
  clockOutTime: z.string().optional().or(z.literal("")),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be less than 500 characters"),
});

type TimeAdjustmentFormData = z.infer<typeof timeAdjustmentSchema>;

interface TimeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry: TimeEntry | null;
  onSuccess?: () => void;
}

export function TimeAdjustmentModal({
  isOpen,
  onClose,
  timeEntry,
  onSuccess,
}: TimeAdjustmentModalProps) {
  const [adjustTimeEntry, { isLoading }] = useAdjustTimeEntryMutation();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<TimeAdjustmentFormData>({
    resolver: zodResolver(timeAdjustmentSchema),
  });

  // Watch form values for comparison
  const watchedValues = watch();

  // Initialize form when timeEntry changes
  useEffect(() => {
    if (timeEntry && isOpen) {
      const clockInDate = new Date(timeEntry.clockInTime);
      const clockOutDate = timeEntry.clockOutTime
        ? new Date(timeEntry.clockOutTime)
        : null;

      reset({
        clockInTime: formatTimeInputValue(clockInDate),
        clockOutTime: clockOutDate ? formatTimeInputValue(clockOutDate) : "",
        reason: "",
      });
    }
  }, [timeEntry, isOpen, reset]);

  // Calculate time differences and warnings
  const changes = timeEntry
    ? calculateTimeChanges(timeEntry, watchedValues)
    : null;

  const handleClose = () => {
    if (isDirty && !isLoading) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to close?"
        )
      ) {
        reset();
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  };

  const onSubmit = async (data: TimeAdjustmentFormData) => {
    if (!timeEntry) return;

    try {
      // Convert local datetime-local format to ISO string
      const clockInISO = new Date(data.clockInTime).toISOString();
      const clockOutISO = data.clockOutTime
        ? new Date(data.clockOutTime).toISOString()
        : undefined;

      const result = await adjustTimeEntry({
        id: timeEntry.id,
        data: {
          timeEntryId: timeEntry.id,
          clockInTime: clockInISO,
          clockOutTime: clockOutISO,
          reason: data.reason,
          adjustedBy: currentUser?.id || "",
        },
      }).unwrap();

      toast.success("Time Entry Adjusted", {
        description: result.message,
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.data?.error || "Failed to adjust time entry";

      toast.error("Adjustment Failed", {
        description: errorMessage,
      });
    }
  };

  if (!timeEntry) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5" />
            <span>Adjust Time Entry</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Make manual adjustments to this time entry. All changes will be
            logged for audit purposes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Employee and Date Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Employee</p>
                  <p className="text-sm text-gray-600">
                    {timeEntry.employee?.firstName}{" "}
                    {timeEntry.employee?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-gray-600">
                    {formatPacificDate(timeEntry.clockInTime)}
                  </p>
                </div>
              </div>
            </div>

            {timeEntry.schedule && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Scheduled Position</p>
                  <p className="text-sm text-gray-600">
                    {timeEntry.schedule.position} (
                    {formatPacificTime12(timeEntry.schedule.startTime)} -{" "}
                    {formatPacificTime12(timeEntry.schedule.endTime)})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Original vs New Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Times */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <History className="h-4 w-4" />
                <span>Original Times</span>
              </h4>

              <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Clock In:
                  </span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {formatPacificTime12(timeEntry.clockInTime)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Clock Out:
                  </span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    {timeEntry.clockOutTime
                      ? formatPacificTime12(timeEntry.clockOutTime)
                      : "Not clocked out"}
                  </span>
                </div>

                {timeEntry.totalHours && (
                  <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Total Hours:
                    </span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {timeEntry.totalHours}h
                    </span>
                  </div>
                )}
              </div>

              {timeEntry.gracePeriodApplied && (
                <Badge variant="outline" className="text-xs">
                  Grace period was applied
                </Badge>
              )}
            </div>

            {/* New Times */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>New Times</span>
              </h4>

              {changes && (
                <div className="space-y-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Clock In:
                    </span>
                    <span
                      className={`font-medium ${
                        changes.clockInChanged
                          ? "text-green-800 dark:text-green-200"
                          : "text-gray-600"
                      }`}
                    >
                      {changes.newClockInDisplay}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Clock Out:
                    </span>
                    <span
                      className={`font-medium ${
                        changes.clockOutChanged
                          ? "text-green-800 dark:text-green-200"
                          : "text-gray-600"
                      }`}
                    >
                      {changes.newClockOutDisplay || "Not clocked out"}
                    </span>
                  </div>

                  {changes.newTotalHours && (
                    <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-700">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Total Hours:
                      </span>
                      <span
                        className={`font-medium ${
                          changes.hoursChanged
                            ? "text-green-800 dark:text-green-200"
                            : "text-gray-600"
                        }`}
                      >
                        {changes.newTotalHours}h
                        {changes.hoursDifference !== 0 && (
                          <span
                            className={`ml-1 text-xs ${
                              changes.hoursDifference > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            ({changes.hoursDifference > 0 ? "+" : ""}
                            {changes.hoursDifference.toFixed(1)}h)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Adjustment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clock In Time */}
              <div className="space-y-2">
                <Label htmlFor="clockInTime">
                  Clock In Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clockInTime"
                  type="datetime-local"
                  {...register("clockInTime")}
                  className={errors.clockInTime ? "border-red-500" : ""}
                />
                {errors.clockInTime && (
                  <p className="text-sm text-red-600">
                    {errors.clockInTime.message}
                  </p>
                )}
              </div>

              {/* Clock Out Time */}
              <div className="space-y-2">
                <Label htmlFor="clockOutTime">Clock Out Time</Label>
                <Input
                  id="clockOutTime"
                  type="datetime-local"
                  {...register("clockOutTime")}
                  className={errors.clockOutTime ? "border-red-500" : ""}
                />
                {errors.clockOutTime && (
                  <p className="text-sm text-red-600">
                    {errors.clockOutTime.message}
                  </p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Adjustment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed reason for this time adjustment (e.g., Employee forgot to clock out, system error, manager approval for early departure, etc.)"
                rows={4}
                {...register("reason")}
                className={errors.reason ? "border-red-500" : ""}
              />
              {errors.reason && (
                <p className="text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>

            {/* Warnings */}
            {changes &&
              (changes.significantChange || changes.hoursDifference > 2) && (
                <div className="flex items-start space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-medium">
                      Significant Time Change Detected
                    </p>
                    <p>
                      This adjustment will change the total hours significantly.
                      Please ensure this change is accurate and properly
                      documented.
                    </p>
                  </div>
                </div>
              )}
          </form>
        </div>

        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || !isDirty}
          >
            {isLoading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Adjusting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Adjustment
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Helper functions
function formatTimeInputValue(date: Date): string {
  // Format for datetime-local input: YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function calculateTimeChanges(
  timeEntry: TimeEntry,
  formValues: Partial<TimeAdjustmentFormData>
) {
  const originalClockIn = new Date(timeEntry.clockInTime);
  const originalClockOut = timeEntry.clockOutTime
    ? new Date(timeEntry.clockOutTime)
    : null;

  const newClockIn = formValues.clockInTime
    ? new Date(formValues.clockInTime)
    : originalClockIn;
  const newClockOut = formValues.clockOutTime
    ? new Date(formValues.clockOutTime)
    : originalClockOut;

  const clockInChanged =
    Math.abs(newClockIn.getTime() - originalClockIn.getTime()) > 60000; // More than 1 minute
  const clockOutChanged =
    originalClockOut && newClockOut
      ? Math.abs(newClockOut.getTime() - originalClockOut.getTime()) > 60000
      : !!originalClockOut !== !!newClockOut;

  // Calculate new total hours
  const newTotalHours = newClockOut
    ? Math.max(
        0,
        (newClockOut.getTime() - newClockIn.getTime()) / (1000 * 60 * 60)
      )
    : null;

  const originalTotalHours = timeEntry.totalHours || 0;
  const hoursDifference = newTotalHours
    ? newTotalHours - originalTotalHours
    : 0;

  const significantChange =
    clockInChanged || clockOutChanged || Math.abs(hoursDifference) > 0.25;

  return {
    clockInChanged,
    clockOutChanged,
    hoursChanged: Math.abs(hoursDifference) > 0.1,
    newClockInDisplay: formatPacificTime12(newClockIn.toISOString()),
    newClockOutDisplay: newClockOut
      ? formatPacificTime12(newClockOut.toISOString())
      : null,
    newTotalHours: newTotalHours ? newTotalHours.toFixed(1) : null,
    hoursDifference,
    significantChange,
  };
}
