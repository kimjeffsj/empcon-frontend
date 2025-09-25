"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Separator } from "@/shared/ui/separator";
import {
  DollarSign,
  Clock,
  CalendarDays,
  Download,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { EmployeePayrollSummary, PayPeriodStatus } from "@empcon/types";

interface PayrollSummaryCardProps {
  data: EmployeePayrollSummary | null;
  isLoading?: boolean;
  error?: any;
  payPeriodStatus?: PayPeriodStatus;
  periodLabel?: string;
  onDownloadPayslip?: () => void;
  onRequestReview?: () => void;
  showComparison?: boolean;
  className?: string;
}

const STATUS_COLORS: Record<PayPeriodStatus, string> = {
  OPEN: "bg-green-500/10 text-green-700 border-green-500/20",
  PROCESSING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  SENT_TO_ACCOUNTANT: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-700 border-gray-500/20",
};

const STATUS_LABELS: Record<PayPeriodStatus, string> = {
  OPEN: "Open",
  PROCESSING: "Processing",
  SENT_TO_ACCOUNTANT: "Sent to Accountant",
  COMPLETED: "Completed",
};

export function PayrollSummaryCard({
  data,
  isLoading = false,
  error,
  payPeriodStatus = "OPEN",
  periodLabel,
  onDownloadPayslip,
  onRequestReview,
  showComparison = true,
  className = "",
}: PayrollSummaryCardProps) {
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

  // Check if employee has anomalies
  const hasAnomalies = (payroll: EmployeePayrollSummary) => {
    return (
      payroll.currentPeriod.overtimeHours > 10 ||
      payroll.currentPeriod.totalHours > 80
    );
  };

  // Calculate comparison with previous period
  const getComparison = () => {
    if (!data?.previousPeriods || data.previousPeriods.length === 0) {
      return null;
    }

    const previous = data.previousPeriods[0];
    const current = data.currentPeriod;

    const grossPayDiff = current.grossPay - previous.grossPay;
    const hoursDiff = current.totalHours - previous.totalHours;

    return {
      grossPayDiff,
      hoursDiff,
      grossPayPercent: previous.grossPay > 0 ? (grossPayDiff / previous.grossPay) * 100 : 0,
      hoursPercent: previous.totalHours > 0 ? (hoursDiff / previous.totalHours) * 100 : 0,
    };
  };

  const comparison = getComparison();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading payroll data</p>
            <p className="text-sm text-muted-foreground mt-1">{String(error)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <CalendarDays className="h-8 w-8 mx-auto mb-2" />
            <p>No payroll data available</p>
            <p className="text-sm mt-1">
              {periodLabel ? `for ${periodLabel}` : "for the selected period"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const employeeHasAnomalies = hasAnomalies(data);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Payroll Summary</span>
          </CardTitle>
          <Badge variant="outline" className={STATUS_COLORS[payPeriodStatus]}>
            {STATUS_LABELS[payPeriodStatus]}
          </Badge>
        </div>
        {periodLabel && (
          <p className="text-sm text-muted-foreground">{periodLabel}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Anomaly Alert */}
        {employeeHasAnomalies && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Anomaly Detected
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {data.currentPeriod.overtimeHours > 10 &&
                    "Excessive overtime hours detected. "}
                  {data.currentPeriod.totalHours > 80 &&
                    "High total hours for this period. "}
                  Please review your time entries.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Pay Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gross Pay */}
          <div className="p-4 bg-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Gross Pay</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(data.currentPeriod.grossPay)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            {showComparison && comparison && (
              <div className="mt-2 flex items-center space-x-1">
                {comparison.grossPayDiff >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-xs ${
                    comparison.grossPayDiff >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {comparison.grossPayDiff >= 0 ? "+" : ""}
                  {formatCurrency(comparison.grossPayDiff)} (
                  {comparison.grossPayPercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          {/* Net Pay */}
          <div className="p-4 bg-blue-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Net Pay</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(data.currentPeriod.netPay)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-blue-700">
              After deductions: {formatCurrency(data.currentPeriod.deductions)}
            </div>
          </div>

          {/* Total Hours */}
          <div className="p-4 bg-purple-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">Total Hours</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatHours(data.currentPeriod.totalHours)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            {showComparison && comparison && (
              <div className="mt-2 flex items-center space-x-1">
                {comparison.hoursDiff >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-xs ${
                    comparison.hoursDiff >= 0 ? "text-purple-600" : "text-red-600"
                  }`}
                >
                  {comparison.hoursDiff >= 0 ? "+" : ""}
                  {formatHours(comparison.hoursDiff)} (
                  {comparison.hoursPercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>

          {/* Overtime Hours */}
          <div className="p-4 bg-orange-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">Overtime</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatHours(data.currentPeriod.overtimeHours)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 text-xs text-orange-700">
              @ {formatCurrency(data.payRate * 1.5)}/hr
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Pay Breakdown</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Regular Hours ({formatHours(data.currentPeriod.regularHours)})</span>
              <span className="font-mono">
                {formatCurrency(data.currentPeriod.regularPay)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Overtime Hours ({formatHours(data.currentPeriod.overtimeHours)})</span>
              <span className="font-mono">
                {formatCurrency(data.currentPeriod.overtimePay)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Gross Pay</span>
              <span className="font-mono">
                {formatCurrency(data.currentPeriod.grossPay)}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Deductions</span>
              <span className="font-mono">
                -{formatCurrency(data.currentPeriod.deductions)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Net Pay</span>
              <span className="font-mono">
                {formatCurrency(data.currentPeriod.netPay)}
              </span>
            </div>
          </div>
        </div>

        {/* YTD Summary */}
        {data.ytdSummary && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Year to Date</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">YTD Gross Pay:</span>
                <p className="font-mono font-medium">
                  {formatCurrency(data.ytdSummary.totalGrossPay)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">YTD Hours:</span>
                <p className="font-mono font-medium">
                  {formatHours(data.ytdSummary.totalHours)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">YTD Net Pay:</span>
                <p className="font-mono font-medium">
                  {formatCurrency(data.ytdSummary.totalNetPay)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">YTD Deductions:</span>
                <p className="font-mono font-medium">
                  {formatCurrency(data.ytdSummary.totalDeductions)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onDownloadPayslip && payPeriodStatus === "COMPLETED" && (
            <Button onClick={onDownloadPayslip} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Payslip
            </Button>
          )}

          {onRequestReview && (
            <Button variant="outline" onClick={onRequestReview} className="flex-1">
              <Info className="h-4 w-4 mr-2" />
              Request Review
            </Button>
          )}

          {(!onDownloadPayslip || payPeriodStatus !== "COMPLETED") &&
            !onRequestReview && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  {payPeriodStatus === "OPEN" && "Payroll period is still open"}
                  {payPeriodStatus === "PROCESSING" && "Payroll is being processed"}
                  {payPeriodStatus === "SENT_TO_ACCOUNTANT" &&
                    "Payroll has been sent to accountant"}
                </p>
              </div>
            )}
        </div>

        {/* Work Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Time Entries: {data.currentPeriod.timeEntriesCount}</span>
            <span>
              Pay Rate: {formatCurrency(data.payRate)}/hr
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}