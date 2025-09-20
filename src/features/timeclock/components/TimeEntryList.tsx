"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Skeleton } from "@/shared/ui/skeleton";
import { Calendar, Clock, Edit, Trash2, MapPin } from "lucide-react";
import { useTimeEntries } from "../hooks/useTimeEntries";
import { TimeEntry } from "@empcon/types";
import { TimeAdjustmentModal } from "./TimeAdjustmentModal";

interface TimeEntryListProps {
  employeeId?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  searchQuery?: string;
  statusFilter?: string;
  className?: string;
  showEmployeeInfo?: boolean;
  allowManualAdjustments?: boolean;
  onSummaryLoad?: (
    summary: {
      totalEntries: number;
      completedShifts: number;
      totalHours: number;
      averageHours: number;
      overtimeHours: number;
    },
    isLoading: boolean
  ) => void;
}

export function TimeEntryList({
  employeeId,
  dateRange,
  searchQuery = "",
  statusFilter = "ALL",
  className = "",
  showEmployeeInfo = false,
  allowManualAdjustments = false,
  onSummaryLoad,
}: TimeEntryListProps) {
  const [adjustmentModal, setAdjustmentModal] = useState<{
    isOpen: boolean;
    timeEntry: TimeEntry | null;
  }>({
    isOpen: false,
    timeEntry: null,
  });

  const { entries, rawEntries, summary, isLoading, error, refetch } =
    useTimeEntries({
      employeeId,
      config: {
        showEmployeeInfo,
        allowManualAdjustments,
        itemsPerPage: 100,
        enableSearch: false,
      },
      defaultFilters: {
        ...dateRange,
      },
    });

  // Client-side filtering
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Status filter
    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Search filter
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(entry =>
        entry.employee?.firstName?.toLowerCase().includes(query) ||
        entry.employee?.lastName?.toLowerCase().includes(query) ||
        entry.employee?.employeeNumber?.includes(query) ||
        entry.schedulePosition?.toLowerCase().includes(query) ||
        entry.date.includes(query)
      );
    }

    return filtered;
  }, [entries, statusFilter, searchQuery]);

  // Pass summary data to parent component
  useEffect(() => {
    if (onSummaryLoad) {
      onSummaryLoad(summary, isLoading);
    }
  }, [summary, isLoading]); // Remove onSummaryLoad from deps to prevent infinite loop

  const handleAdjustTime = (entryId: string) => {
    const timeEntry = rawEntries.find((entry) => entry.id === entryId);
    if (timeEntry) {
      setAdjustmentModal({
        isOpen: true,
        timeEntry,
      });
    }
  };

  const handleModalClose = () => {
    setAdjustmentModal({
      isOpen: false,
      timeEntry: null,
    });
  };

  const handleAdjustmentSuccess = () => {
    refetch();
    handleModalClose();
  };

  // Pacific Time formatting functions are now imported from utils

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading time entries: {String(error)}
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployeeInfo && <TableHead>Employee</TableHead>}
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            {allowManualAdjustments && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showEmployeeInfo ? 7 : 6}
                className="text-center py-8 text-muted-foreground"
              >
                {searchQuery || statusFilter !== "ALL"
                  ? "No entries match your search criteria"
                  : "No time entries found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                {/* Employee Info */}
                {showEmployeeInfo && (
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {entry.employee?.firstName} {entry.employee?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.employee?.employeeNumber}
                      </p>
                    </div>
                  </TableCell>
                )}

                {/* Date */}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{entry.date || "-"}</span>
                  </div>
                </TableCell>

                {/* Time */}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {entry.clockOutTime
                        ? `${entry.clockInTime} - ${entry.clockOutTime}`
                        : `${entry.clockInTime} - Still Working`}
                    </span>
                  </div>
                </TableCell>

                {/* Duration */}
                <TableCell>
                  {entry.totalHours
                    ? `${Math.floor(entry.totalHours)}h ${Math.round(
                        (entry.totalHours % 1) * 60
                      )}m`
                    : "-"}
                </TableCell>

                {/* Location */}
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {entry.schedulePosition ||
                        entry.schedule?.position ||
                        "N/A"}
                    </span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={
                      entry.status === "CLOCKED_IN" ? "default" : "secondary"
                    }
                    className={`${
                      entry.status === "CLOCKED_IN"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : entry.status === "CLOCKED_OUT"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }`}
                  >
                    {entry.status === "CLOCKED_IN"
                      ? "Scheduled"
                      : entry.status === "CLOCKED_OUT"
                      ? "Scheduled"
                      : entry.status}
                  </Badge>
                </TableCell>

                {/* Actions */}
                {allowManualAdjustments && (
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAdjustTime(entry.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Time Adjustment Modal */}
      <TimeAdjustmentModal
        isOpen={adjustmentModal.isOpen}
        onClose={handleModalClose}
        timeEntry={adjustmentModal.timeEntry}
        onSuccess={handleAdjustmentSuccess}
      />
    </div>
  );
}
