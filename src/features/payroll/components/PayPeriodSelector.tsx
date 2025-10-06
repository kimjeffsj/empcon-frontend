"use client";

import React, { useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  setSelectedYear,
  setSelectedMonth,
  setSelectedPeriod,
  navigateToPreviousPeriod,
  navigateToNextPeriod,
  navigateToCurrentPeriod,
} from "@/store/payrollSlice";
import { PayPeriodStatus } from "@empcon/types";

interface PayPeriodSelectorProps {
  onPeriodChange?: (period: {
    year: number;
    month: number;
    period: "A" | "B";
  }) => void;
  showNavigation?: boolean;
  showCurrentPeriodButton?: boolean;
  status?: PayPeriodStatus;
  className?: string;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const STATUS_COLORS: Record<PayPeriodStatus, string> = {
  OPEN: "bg-green-500/10 text-green-700 border-green-500/20",
  PROCESSING: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COMPLETED: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  PAID: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

const STATUS_LABELS: Record<PayPeriodStatus, string> = {
  OPEN: "Open",
  PROCESSING: "Processing", // Email sent to accountant, waiting for PDFs
  COMPLETED: "Completed", // PDFs uploaded, ready to mark as paid
  PAID: "Paid",
};

export function PayPeriodSelector({
  onPeriodChange,
  showNavigation = true,
  showCurrentPeriodButton = true,
  status,
  className = "",
}: PayPeriodSelectorProps) {
  const dispatch = useAppDispatch();
  const { selectedYear, selectedMonth, selectedPeriod } = useAppSelector(
    (state) => state.payroll
  );

  // Get current date for comparison
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentPeriod = currentDate.getDate() <= 15 ? "A" : "B";

  const isCurrentPeriod =
    selectedYear === currentYear &&
    selectedMonth === currentMonth &&
    selectedPeriod === currentPeriod;

  // Generate year options (current year ± 2 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Call onPeriodChange when period selection changes
  useEffect(() => {
    onPeriodChange?.({
      year: selectedYear,
      month: selectedMonth,
      period: selectedPeriod,
    });
  }, [selectedYear, selectedMonth, selectedPeriod, onPeriodChange]);

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    dispatch(setSelectedYear(newYear));
    onPeriodChange?.({
      year: newYear,
      month: selectedMonth,
      period: selectedPeriod,
    });
  };

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month);
    dispatch(setSelectedMonth(newMonth));
    onPeriodChange?.({
      year: selectedYear,
      month: newMonth,
      period: selectedPeriod,
    });
  };

  const handlePeriodChange = (period: "A" | "B") => {
    dispatch(setSelectedPeriod(period));
    onPeriodChange?.({
      year: selectedYear,
      month: selectedMonth,
      period,
    });
  };

  const handlePreviousPeriod = () => {
    dispatch(navigateToPreviousPeriod());
  };

  const handleNextPeriod = () => {
    dispatch(navigateToNextPeriod());
  };

  const handleCurrentPeriod = () => {
    dispatch(navigateToCurrentPeriod());
    onPeriodChange?.({
      year: currentYear,
      month: currentMonth,
      period: currentPeriod,
    });
  };

  // Format period display
  const formatPeriodDisplay = () => {
    const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;
    const periodLabel = selectedPeriod === "A" ? "1st-15th" : "16th-End";
    return `${monthName} ${selectedYear} - Period ${selectedPeriod} (${periodLabel})`;
  };

  // Get period date range
  const getPeriodDateRange = () => {
    const month = selectedMonth;
    const year = selectedYear;

    if (selectedPeriod === "A") {
      return {
        start: `${year}-${month.toString().padStart(2, "0")}-01`,
        end: `${year}-${month.toString().padStart(2, "0")}-15`,
      };
    } else {
      // Get last day of month
      const lastDay = new Date(year, month, 0).getDate();
      return {
        start: `${year}-${month.toString().padStart(2, "0")}-16`,
        end: `${year}-${month.toString().padStart(2, "0")}-${lastDay}`,
      };
    }
  };

  const dateRange = getPeriodDateRange();

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Pay Period</h3>
            </div>
            {status && (
              <Badge variant="outline" className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
            )}
          </div>

          {/* Navigation controls */}
          {showNavigation && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPeriod}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {showCurrentPeriodButton && !isCurrentPeriod && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurrentPeriod}
                  className="h-8"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Current
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPeriod}
                className="h-8"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Period selection controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Year selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Year
              </label>
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Month
              </label>
              <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Period selector */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Period
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={selectedPeriod === "A" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePeriodChange("A")}
                  className="flex-1"
                >
                  A (1-15)
                </Button>
                <Button
                  variant={selectedPeriod === "B" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePeriodChange("B")}
                  className="flex-1"
                >
                  B (16-End)
                </Button>
              </div>
            </div>
          </div>

          {/* Period summary */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium">{formatPeriodDisplay()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {dateRange.start} to {dateRange.end}
            </div>
            {isCurrentPeriod && (
              <Badge variant="outline" className="mt-2 text-xs">
                Current Period
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

