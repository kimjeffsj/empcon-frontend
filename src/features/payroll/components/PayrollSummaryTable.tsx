"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Search,
  User,
  DollarSign,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { EmployeePayrollSummary } from "@empcon/types";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setEmployeeSearch,
  toggleAnomaliesFilter,
  toggleEmployeeExpansion,
  clearFilters,
} from "@/store/payrollSlice";

interface PayrollSummaryTableProps {
  data: EmployeePayrollSummary[];
  isLoading?: boolean;
  error?: any;
  onViewDetails?: (employeeId: string) => void;
  onGeneratePayslip?: (employeeId: string) => void;
  allowDetailedView?: boolean;
  className?: string;
}

export function PayrollSummaryTable({
  data = [],
  isLoading = false,
  error,
  onViewDetails,
  onGeneratePayslip,
  allowDetailedView = true,
  className = "",
}: PayrollSummaryTableProps) {
  const dispatch = useAppDispatch();
  const { filters, expandedEmployeeIds } = useAppSelector(
    (state) => state.payroll
  );

  // Local sorting state
  const [sortField, setSortField] = useState<
    "employeeName" | "totalHours" | "grossPay" | "netPay" | "overtime"
  >("employeeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (filters.employeeSearch) {
      const searchLower = filters.employeeSearch.toLowerCase();
      filtered = filtered.filter(
        (employee) =>
          employee.employeeName.toLowerCase().includes(searchLower) ||
          employee.employeeNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Apply anomalies filter
    if (filters.showAnomaliesOnly) {
      filtered = filtered.filter((employee) => {
        // Check if employee has anomalies (overtime hours > 10, excessive hours, etc.)
        const hasOvertimeAnomaly = employee.currentPeriod.overtimeHours > 10;
        const hasExcessiveHours = employee.currentPeriod.totalHours > 80;
        return hasOvertimeAnomaly || hasExcessiveHours;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortField) {
        case "employeeName":
          aValue = a.employeeName;
          bValue = b.employeeName;
          break;
        case "totalHours":
          aValue = a.currentPeriod.totalHours;
          bValue = b.currentPeriod.totalHours;
          break;
        case "grossPay":
          aValue = a.currentPeriod.grossPay;
          bValue = b.currentPeriod.grossPay;
          break;
        case "netPay":
          aValue = a.currentPeriod.netPay;
          bValue = b.currentPeriod.netPay;
          break;
        case "overtime":
          aValue = a.currentPeriod.overtimeHours;
          bValue = b.currentPeriod.overtimeHours;
          break;
        default:
          aValue = a.employeeName;
          bValue = b.employeeName;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === "asc" ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortDirection === "asc" ? comparison : -comparison;
      }
    });

    return filtered;
  }, [data, filters, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    dispatch(setEmployeeSearch(value));
  };

  // Handle anomalies filter
  const handleAnomaliesToggle = () => {
    dispatch(toggleAnomaliesFilter());
  };

  // Handle employee expansion
  const handleToggleExpansion = (employeeId: string) => {
    dispatch(toggleEmployeeExpansion(employeeId));
  };

  // Check if employee has anomalies
  const hasAnomalies = (employee: EmployeePayrollSummary) => {
    return (
      employee.currentPeriod.overtimeHours > 10 ||
      employee.currentPeriod.totalHours > 80
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  // Format hours
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex space-x-4 mb-4">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading payroll data: {String(error)}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={filters.employeeSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Anomalies Filter */}
        <Button
          variant={filters.showAnomaliesOnly ? "default" : "outline"}
          size="sm"
          onClick={handleAnomaliesToggle}
          className="flex items-center space-x-2"
        >
          <AlertTriangle className="h-4 w-4" />
          <span>Anomalies Only</span>
        </Button>

        {/* Sort Options */}
        <Select
          value={sortField}
          onValueChange={(value) => handleSort(value as typeof sortField)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employeeName">Employee</SelectItem>
            <SelectItem value="totalHours">Total Hours</SelectItem>
            <SelectItem value="grossPay">Gross Pay</SelectItem>
            <SelectItem value="netPay">Net Pay</SelectItem>
            <SelectItem value="overtime">Overtime</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {(filters.employeeSearch || filters.showAnomaliesOnly) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(clearFilters())}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort("employeeName")}
            >
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Employee</span>
                {sortField === "employeeName" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("totalHours")}
            >
              <div className="flex items-center justify-end space-x-1">
                <Clock className="h-4 w-4" />
                <span>Hours</span>
                {sortField === "totalHours" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("overtime")}
            >
              <div className="flex items-center justify-end space-x-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Overtime</span>
                {sortField === "overtime" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("grossPay")}
            >
              <div className="flex items-center justify-end space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Gross Pay</span>
                {sortField === "grossPay" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 text-right"
              onClick={() => handleSort("netPay")}
            >
              <div className="flex items-center justify-end space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Net Pay</span>
                {sortField === "netPay" && (
                  <span className="text-xs">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {filters.employeeSearch || filters.showAnomaliesOnly
                  ? "No employees match your search criteria"
                  : "No payroll data found"}
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedData.map((employee) => {
              const isExpanded = expandedEmployeeIds.includes(employee.employeeId);
              const employeeHasAnomalies = hasAnomalies(employee);

              return (
                <React.Fragment key={employee.employeeId}>
                  {/* Main Row */}
                  <TableRow className={employeeHasAnomalies ? "bg-yellow-50/50" : ""}>
                    {/* Expand/Collapse */}
                    <TableCell>
                      {allowDetailedView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExpansion(employee.employeeId)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>

                    {/* Employee Info */}
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{employee.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {employee.employeeNumber || "No ID"}
                          </p>
                        </div>
                        {employeeHasAnomalies && (
                          <Badge variant="outline" className="bg-yellow-100 border-yellow-300">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Anomaly
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Total Hours */}
                    <TableCell className="text-right font-mono">
                      <div>
                        <span className="font-medium">
                          {formatHours(employee.currentPeriod.totalHours)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {formatHours(employee.currentPeriod.regularHours)} regular
                        </p>
                      </div>
                    </TableCell>

                    {/* Overtime Hours */}
                    <TableCell className="text-right font-mono">
                      <span
                        className={
                          employee.currentPeriod.overtimeHours > 10
                            ? "text-orange-600 font-medium"
                            : ""
                        }
                      >
                        {formatHours(employee.currentPeriod.overtimeHours)}
                      </span>
                    </TableCell>

                    {/* Gross Pay */}
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(employee.currentPeriod.grossPay)}
                    </TableCell>

                    {/* Net Pay */}
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(employee.currentPeriod.netPay)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(employee.employeeId)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {onGeneratePayslip && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGeneratePayslip(employee.employeeId)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details Row */}
                  {isExpanded && allowDetailedView && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Pay Details */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Pay Details</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Pay Rate:</span>
                                <span className="font-mono">
                                  {formatCurrency(employee.payRate)}/hr
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regular Pay:</span>
                                <span className="font-mono">
                                  {formatCurrency(employee.currentPeriod.regularPay)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Overtime Pay:</span>
                                <span className="font-mono">
                                  {formatCurrency(employee.currentPeriod.overtimePay)}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-1">
                                <span>Deductions:</span>
                                <span className="font-mono">
                                  {formatCurrency(employee.currentPeriod.deductions)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Time Summary */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Time Summary</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Time Entries:</span>
                                <span>
                                  {employee.currentPeriod.timeEntriesCount} entries
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Avg Hours/Day:</span>
                                <span className="font-mono">
                                  {(
                                    employee.currentPeriod.totalHours /
                                    Math.max(employee.currentPeriod.timeEntriesCount, 1)
                                  ).toFixed(1)}h
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* YTD Summary */}
                          {employee.ytdSummary && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Year to Date</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>YTD Gross:</span>
                                  <span className="font-mono">
                                    {formatCurrency(employee.ytdSummary.totalGrossPay)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>YTD Hours:</span>
                                  <span className="font-mono">
                                    {formatHours(employee.ytdSummary.totalHours)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Summary Footer */}
      {filteredAndSortedData.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Employees:</span>
              <p className="font-medium">{filteredAndSortedData.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Hours:</span>
              <p className="font-medium">
                {formatHours(
                  filteredAndSortedData.reduce(
                    (sum, emp) => sum + emp.currentPeriod.totalHours,
                    0
                  )
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Gross Pay:</span>
              <p className="font-medium">
                {formatCurrency(
                  filteredAndSortedData.reduce(
                    (sum, emp) => sum + emp.currentPeriod.grossPay,
                    0
                  )
                )}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Net Pay:</span>
              <p className="font-medium">
                {formatCurrency(
                  filteredAndSortedData.reduce(
                    (sum, emp) => sum + emp.currentPeriod.netPay,
                    0
                  )
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}