"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { EmployeePayrollSummary } from "@empcon/types";
import { ScrollArea } from "@/shared/ui/scroll-area";

interface PayrollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollData: EmployeePayrollSummary | null;
  periodLabel: string;
  onRequestReview?: () => void;
  isLoadingReview?: boolean;
}

// Mock data interfaces for detailed records
interface DailyWorkRecord {
  date: string;
  dayOfWeek: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  scheduledHours: number;
  actualHours: number;
  breakTime: number;
  status: "present" | "absent" | "partial" | "overtime";
  notes?: string;
  hasAnomaly: boolean;
  anomalyTypes?: string[];
}

// Mock data generator for daily records
const generateMockDailyRecords = (periodLabel: string): DailyWorkRecord[] => {
  // Extract dates from period label - simplified for demo
  const records: DailyWorkRecord[] = [];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 1; i <= 15; i++) {
    const dayOfWeek = days[i % 7];
    const isWeekend = dayOfWeek === "Sat" || dayOfWeek === "Sun";

    // Skip some days for variety
    if (Math.random() > 0.85) continue;

    const scheduledStart = isWeekend ? undefined : "09:00";
    const scheduledEnd = isWeekend ? undefined : "18:00";
    const scheduledHours = isWeekend ? 0 : 8;

    // Generate actual times with some variance
    const actualStart = scheduledStart
      ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`
      : undefined;
    const actualEnd = scheduledEnd
      ? `${17 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`
      : undefined;

    const actualHours =
      actualStart && actualEnd ? 8 + (Math.random() - 0.5) * 2 : 0;

    const breakTime = actualHours > 0 ? 1 : 0;

    // Determine status and anomalies
    const hasOvertime = actualHours > scheduledHours + 0.5;
    const hasExcessiveHours = actualHours > 10;
    const hasScheduleVariance = Math.abs(actualHours - scheduledHours) > 1;

    const hasAnomaly = hasOvertime || hasExcessiveHours || hasScheduleVariance;
    const anomalyTypes = [];
    if (hasOvertime) anomalyTypes.push("Overtime detected");
    if (hasExcessiveHours) anomalyTypes.push("Excessive daily hours");
    if (hasScheduleVariance) anomalyTypes.push("Schedule variance");

    let status: "present" | "absent" | "partial" | "overtime" = "present";
    if (actualHours === 0) status = "absent";
    else if (actualHours < scheduledHours - 1) status = "partial";
    else if (hasOvertime) status = "overtime";

    records.push({
      date: `2025-01-${i.toString().padStart(2, "0")}`,
      dayOfWeek,
      scheduledStart,
      scheduledEnd,
      actualStart,
      actualEnd,
      scheduledHours,
      actualHours: Number(actualHours.toFixed(1)),
      breakTime,
      status,
      hasAnomaly,
      anomalyTypes: anomalyTypes.length > 0 ? anomalyTypes : undefined,
      notes: hasAnomaly ? "System detected anomaly - please review" : undefined,
    });
  }

  return records.sort((a, b) => a.date.localeCompare(b.date));
};

export function PayrollDetailModal({
  isOpen,
  onClose,
  payrollData,
  periodLabel,
  onRequestReview,
  isLoadingReview = false,
}: PayrollDetailModalProps) {
  const [selectedRecord, setSelectedRecord] = useState<DailyWorkRecord | null>(
    null
  );

  // Generate mock daily records - in real app, this would come from API
  const dailyRecords = generateMockDailyRecords(periodLabel);

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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  // Get status badge properties
  const getStatusBadge = (status: DailyWorkRecord["status"]) => {
    switch (status) {
      case "present":
        return {
          variant: "default" as const,
          label: "Present",
          icon: CheckCircle,
        };
      case "absent":
        return {
          variant: "destructive" as const,
          label: "Absent",
          icon: XCircle,
        };
      case "partial":
        return {
          variant: "secondary" as const,
          label: "Partial",
          icon: AlertTriangle,
        };
      case "overtime":
        return {
          variant: "outline" as const,
          label: "Overtime",
          icon: TrendingUp,
        };
      default:
        return { variant: "outline" as const, label: "Unknown", icon: Info };
    }
  };

  // Calculate summary statistics
  const totalScheduledHours = dailyRecords.reduce(
    (sum, record) => sum + record.scheduledHours,
    0
  );
  const totalActualHours = dailyRecords.reduce(
    (sum, record) => sum + record.actualHours,
    0
  );
  const totalAnomalies = dailyRecords.filter(
    (record) => record.hasAnomaly
  ).length;
  const attendanceDays = dailyRecords.filter(
    (record) => record.actualHours > 0
  ).length;

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-6xl max-h-[90vh]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Detailed Work Records</span>
          </AlertDialogTitle>
          <p className="text-sm text-muted-foreground">{periodLabel}</p>
        </AlertDialogHeader>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Period Summary</TabsTrigger>
            <TabsTrigger value="daily">Daily Records</TabsTrigger>
          </TabsList>

          {/* Period Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              {payrollData && (
                <div className="space-y-6">
                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Clock className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                          <p className="text-sm text-muted-foreground">
                            Total Hours
                          </p>
                          <p className="text-lg font-bold">
                            {formatHours(payrollData.currentPeriod.totalHours)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <TrendingUp className="h-5 w-5 mx-auto mb-2 text-orange-600" />
                          <p className="text-sm text-muted-foreground">
                            Overtime
                          </p>
                          <p className="text-lg font-bold">
                            {formatHours(
                              payrollData.currentPeriod.overtimeHours
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <Calendar className="h-5 w-5 mx-auto mb-2 text-green-600" />
                          <p className="text-sm text-muted-foreground">
                            Days Worked
                          </p>
                          <p className="text-lg font-bold">{attendanceDays}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-600" />
                          <p className="text-sm text-muted-foreground">
                            Anomalies
                          </p>
                          <p className="text-lg font-bold">{totalAnomalies}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pay Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-medium">Hours & Pay</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Regular Hours</span>
                              <span className="font-mono">
                                {formatHours(
                                  payrollData.currentPeriod.regularHours
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Overtime Hours</span>
                              <span className="font-mono">
                                {formatHours(
                                  payrollData.currentPeriod.overtimeHours
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pay Rate</span>
                              <span className="font-mono">
                                {formatCurrency(payrollData.payRate)}/hr
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Overtime Rate</span>
                              <span className="font-mono">
                                {formatCurrency(payrollData.payRate * 1.5)}/hr
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium">Earnings</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Regular Pay</span>
                              <span className="font-mono">
                                {formatCurrency(
                                  payrollData.currentPeriod.regularPay
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Overtime Pay</span>
                              <span className="font-mono">
                                {formatCurrency(
                                  payrollData.currentPeriod.overtimePay
                                )}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-medium">
                              <span>Gross Pay</span>
                              <span className="font-mono">
                                {formatCurrency(
                                  payrollData.currentPeriod.grossPay
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Deductions</span>
                              <span className="font-mono">
                                -
                                {formatCurrency(
                                  payrollData.currentPeriod.deductions
                                )}
                              </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                              <span>Net Pay</span>
                              <span className="font-mono">
                                {formatCurrency(
                                  payrollData.currentPeriod.netPay
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Comparison with Previous Period */}
                  {payrollData.previousPeriods &&
                    payrollData.previousPeriods.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Comparison with Previous Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-muted-foreground">
                                Hours Change
                              </p>
                              <p className="text-lg font-medium">
                                {payrollData.currentPeriod.totalHours >
                                payrollData.previousPeriods[0].totalHours ? (
                                  <span className="text-green-600 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 mr-1" />+
                                    {(
                                      payrollData.currentPeriod.totalHours -
                                      payrollData.previousPeriods[0].totalHours
                                    ).toFixed(1)}
                                    h
                                  </span>
                                ) : (
                                  <span className="text-red-600 flex items-center justify-center">
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                    {(
                                      payrollData.currentPeriod.totalHours -
                                      payrollData.previousPeriods[0].totalHours
                                    ).toFixed(1)}
                                    h
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">
                                Pay Change
                              </p>
                              <p className="text-lg font-medium">
                                {payrollData.currentPeriod.grossPay >
                                payrollData.previousPeriods[0].grossPay ? (
                                  <span className="text-green-600 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4 mr-1" />+
                                    {formatCurrency(
                                      payrollData.currentPeriod.grossPay -
                                        payrollData.previousPeriods[0].grossPay
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-red-600 flex items-center justify-center">
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                    {formatCurrency(
                                      payrollData.currentPeriod.grossPay -
                                        payrollData.previousPeriods[0].grossPay
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">
                                Avg Hours/Day
                              </p>
                              <p className="text-lg font-medium">
                                {(
                                  payrollData.currentPeriod.totalHours /
                                  payrollData.currentPeriod.timeEntriesCount
                                ).toFixed(1)}
                                h
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Daily Records Tab */}
          <TabsContent value="daily" className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {/* Daily Records Table */}
                <div className="space-y-3">
                  {dailyRecords.map((record, index) => {
                    const statusBadge = getStatusBadge(record.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          record.hasAnomaly
                            ? "border-orange-200 bg-orange-50/30"
                            : ""
                        } ${
                          selectedRecord === record ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() =>
                          setSelectedRecord(
                            selectedRecord === record ? null : record
                          )
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="font-medium">
                                  {formatDate(record.date)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {record.dayOfWeek}
                                </p>
                              </div>

                              {record.scheduledStart && record.scheduledEnd ? (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">
                                    Scheduled
                                  </p>
                                  <p className="font-mono">
                                    {record.scheduledStart} -{" "}
                                    {record.scheduledEnd}
                                  </p>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">
                                    Day Off
                                  </p>
                                </div>
                              )}

                              {record.actualStart && record.actualEnd && (
                                <div className="text-sm">
                                  <p className="text-muted-foreground">
                                    Actual
                                  </p>
                                  <p className="font-mono">
                                    {record.actualStart} - {record.actualEnd}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-right text-sm">
                                <p className="font-medium">
                                  {formatHours(record.actualHours)}
                                </p>
                                {record.scheduledHours > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    vs {formatHours(record.scheduledHours)}{" "}
                                    scheduled
                                  </p>
                                )}
                              </div>

                              <Badge
                                variant={statusBadge.variant}
                                className="flex items-center space-x-1"
                              >
                                <StatusIcon className="h-3 w-3" />
                                <span>{statusBadge.label}</span>
                              </Badge>

                              {record.hasAnomaly && (
                                <Badge
                                  variant="outline"
                                  className="text-orange-600 border-orange-300"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Anomaly
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {selectedRecord === record && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Time Details
                                  </h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span>Work Hours:</span>
                                      <span>
                                        {formatHours(record.actualHours)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Break Time:</span>
                                      <span>
                                        {formatHours(record.breakTime)}
                                      </span>
                                    </div>
                                    {record.scheduledHours > 0 && (
                                      <div className="flex justify-between">
                                        <span>Variance:</span>
                                        <span
                                          className={
                                            record.actualHours >
                                            record.scheduledHours
                                              ? "text-orange-600"
                                              : record.actualHours <
                                                record.scheduledHours - 0.5
                                              ? "text-red-600"
                                              : "text-green-600"
                                          }
                                        >
                                          {record.actualHours >
                                          record.scheduledHours
                                            ? "+"
                                            : ""}
                                          {(
                                            record.actualHours -
                                            record.scheduledHours
                                          ).toFixed(1)}
                                          h
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {record.hasAnomaly && record.anomalyTypes && (
                                  <div>
                                    <h4 className="font-medium mb-2 text-orange-600">
                                      Anomalies Detected
                                    </h4>
                                    <ul className="space-y-1 text-sm">
                                      {record.anomalyTypes.map((anomaly, i) => (
                                        <li
                                          key={i}
                                          className="flex items-center space-x-2"
                                        >
                                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                                          <span>{anomaly}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {record.notes && (
                                <div className="mt-3">
                                  <h4 className="font-medium mb-1">Notes</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {record.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <div className="flex justify-between w-full">
            <div className="flex items-center space-x-2">
              {totalAnomalies > 0 && (
                <Badge variant="outline" className="text-orange-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {totalAnomalies} Anomal{totalAnomalies > 1 ? "ies" : "y"}{" "}
                  Detected
                </Badge>
              )}
            </div>

            <div className="flex space-x-3">
              {onRequestReview && totalAnomalies > 0 && (
                <Button
                  variant="outline"
                  onClick={onRequestReview}
                  disabled={isLoadingReview}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Request Review</span>
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
