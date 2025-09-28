"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import {
  DollarSign,
  Users,
  Calculator,
  FileSpreadsheet,
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { PayPeriodSelector } from "@/features/payroll/components/PayPeriodSelector";
import { PayrollSummaryTable } from "@/features/payroll/components/PayrollSummaryTable";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  useGetCurrentPayPeriodQuery,
  useGetPayPeriodsQuery,
  useGetPayrollSummaryQuery,
  useCalculatePayrollForPeriodMutation,
  useSendPayrollToAccountantMutation,
  useCreatePayPeriodMutation,
  useGenerateCompletedPeriodMutation,
  useCanGenerateCompletedPeriodQuery,
} from "@/store/api/payrollApi";
import {
  downloadPayrollReport,
  downloadPayslip,
  useDownloadState,
} from "@/shared/utils/fileDownload";
import {
  setCalculating,
  setGeneratingReport,
  setSendingToAccountant,
} from "@/store/payrollSlice";

export default function AdminPayrollPage() {
  const dispatch = useAppDispatch();
  const {
    selectedYear,
    selectedMonth,
    selectedPeriod,
    isCalculating,
    isGeneratingReport,
    isSendingToAccountant,
  } = useAppSelector((state) => state.payroll);

  // Local state
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState<string | null>(null);

  // Download state management
  const {
    isDownloading: isDownloadingReport,
    error: downloadError,
    handleDownload,
  } = useDownloadState();

  // API queries
  const { data: currentPeriodData } = useGetCurrentPayPeriodQuery();
  const { data: payPeriodsData } = useGetPayPeriodsQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  // Find the pay period for the selected period (A or B)
  const selectedPayPeriod = payPeriodsData?.data?.find((period) => {
    const periodStart = new Date(period.startDate);
    const isAPeriod = periodStart.getDate() === 1;
    const isBPeriod = periodStart.getDate() === 16;
    return selectedPeriod === "A" ? isAPeriod : isBPeriod;
  });

  const {
    data: payrollSummaryData,
    isLoading: isLoadingPayroll,
    error: payrollError,
    refetch: refetchPayroll,
  } = useGetPayrollSummaryQuery(
    { payPeriodId: selectedPayPeriod?.id! },
    { skip: !selectedPayPeriod?.id }
  );

  // API queries for auto-generation
  const { data: canGenerateData } = useCanGenerateCompletedPeriodQuery();

  // API mutations
  const [calculatePayroll] = useCalculatePayrollForPeriodMutation();
  const [sendToAccountant] = useSendPayrollToAccountantMutation();
  const [_createPayPeriod] = useCreatePayPeriodMutation();
  const [generateCompletedPeriod, { isLoading: isGeneratingPeriod }] =
    useGenerateCompletedPeriodMutation();

  // Handle period change - no longer needed since we use real API data
  const handlePeriodChange = (period: {
    year: number;
    month: number;
    period: "A" | "B";
  }) => {
    // Period selection is handled by Redux state and API queries automatically
    // The selectedPayPeriod will be found based on the selected year/month/period
  };

  // Handle calculate payroll
  const handleCalculatePayroll = async () => {
    if (!selectedPayPeriod?.id) return;

    try {
      dispatch(setCalculating(true));
      const result = await calculatePayroll({
        payPeriodId: selectedPayPeriod.id,
      }).unwrap();

      setShowSuccessAlert(
        `Payroll calculated successfully for ${result.employees.length} employees`
      );
      refetchPayroll();

      // Clear success message after 5 seconds
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      setShowErrorAlert("Failed to calculate payroll. Please try again.");
      setTimeout(() => setShowErrorAlert(null), 5000);
    } finally {
      dispatch(setCalculating(false));
    }
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    if (!selectedPayPeriod?.id) return;

    dispatch(setGeneratingReport(true));

    try {
      await handleDownload(async () => {
        await downloadPayrollReport(selectedPayPeriod.id, "excel");
      });

      setShowSuccessAlert(
        "Payroll report generated and downloaded successfully"
      );
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      setShowErrorAlert("Failed to generate report. Please try again.");
      setTimeout(() => setShowErrorAlert(null), 5000);
    } finally {
      dispatch(setGeneratingReport(false));
    }
  };

  // Handle send to accountant
  const handleSendToAccountant = async () => {
    if (!selectedPayPeriod?.id) return;

    try {
      dispatch(setSendingToAccountant(true));
      await sendToAccountant({ payPeriodId: selectedPayPeriod.id }).unwrap();

      setShowSuccessAlert("Payroll report sent to accountant successfully");
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      setShowErrorAlert("Failed to send to accountant. Please try again.");
      setTimeout(() => setShowErrorAlert(null), 5000);
    } finally {
      dispatch(setSendingToAccountant(false));
    }
  };

  // Handle auto-generate completed period
  const handleGenerateCompletedPeriod = async () => {
    if (!canGenerateData?.canGenerate) return;

    const confirmed = window.confirm(
      `Generate ${canGenerateData.periodInfo?.description}?\n\n${canGenerateData.reason}`
    );

    if (!confirmed) return;

    try {
      const result = await generateCompletedPeriod().unwrap();

      setShowSuccessAlert(result.message);
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate pay period. Please try again.";
      setShowErrorAlert(errorMessage);
      setTimeout(() => setShowErrorAlert(null), 5000);
    }
  };

  // Handle view employee details
  const handleViewDetails = (employeeId: string) => {
    console.log("View details for employee:", employeeId);
    // TODO: Open employee details modal or navigate to detail page
  };

  // Handle generate payslip
  const handleGeneratePayslip = async (employeeId: string) => {
    try {
      await handleDownload(async () => {
        // Note: We need to generate payslip first, then download it
        // This assumes the backend returns a payslipId when generating
        // For now, we'll use the employeeId as payslipId placeholder
        // TODO: Update this when proper payslip generation API is available
        await downloadPayslip(employeeId);
      });

      setShowSuccessAlert("Payslip downloaded successfully");
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      setShowErrorAlert("Failed to download payslip. Please try again.");
      setTimeout(() => setShowErrorAlert(null), 5000);
    }
  };

  // Calculate summary statistics
  const summaryStats = payrollSummaryData
    ? {
        totalEmployees: payrollSummaryData.length,
        totalGrossPay: payrollSummaryData.reduce(
          (sum, emp) => sum + emp.currentPeriod.grossPay,
          0
        ),
        totalNetPay: payrollSummaryData.reduce(
          (sum, emp) => sum + emp.currentPeriod.netPay,
          0
        ),
        totalHours: payrollSummaryData.reduce(
          (sum, emp) => sum + emp.currentPeriod.totalHours,
          0
        ),
        totalOvertimeHours: payrollSummaryData.reduce(
          (sum, emp) => sum + emp.currentPeriod.overtimeHours,
          0
        ),
        anomaliesCount: payrollSummaryData.filter(
          (emp) =>
            emp.currentPeriod.overtimeHours > 10 ||
            emp.currentPeriod.totalHours > 80
        ).length,
      }
    : null;

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

  // Get period label
  const getPeriodLabel = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthName = monthNames[selectedMonth - 1];
    const periodLabel = selectedPeriod === "A" ? "1st-15th" : "16th-End";
    return `${monthName} ${selectedYear} - Period ${selectedPeriod} (${periodLabel})`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span>Payroll Management</span>
          </h1>
          <p className="text-muted-foreground">
            Calculate payroll, generate reports, and manage employee
            compensation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPayroll()}
            disabled={isLoadingPayroll}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLoadingPayroll ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Success/Error Alerts */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            {showSuccessAlert}
          </AlertDescription>
        </Alert>
      )}

      {(showErrorAlert || downloadError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {showErrorAlert || downloadError}
          </AlertDescription>
        </Alert>
      )}

      {/* Pay Period Selector */}
      <PayPeriodSelector
        onPeriodChange={handlePeriodChange}
        showNavigation={true}
        showCurrentPeriodButton={true}
        status="OPEN" // TODO: Get actual status from API
      />

      {/* Period Summary Stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Employees
                  </p>
                  <p className="text-2xl font-bold">
                    {summaryStats.totalEmployees}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Gross Pay
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summaryStats.totalGrossPay)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold">
                    {formatHours(summaryStats.totalHours)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Anomalies
                  </p>
                  <p className="text-2xl font-bold">
                    {summaryStats.anomaliesCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="payroll-summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="payroll-summary"
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Payroll Summary</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Actions</span>
          </TabsTrigger>
        </TabsList>

        {/* Payroll Summary Tab */}
        <TabsContent value="payroll-summary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Employee Payroll Summary</h2>
            <Badge variant="outline">{getPeriodLabel()}</Badge>
          </div>

          <PayrollSummaryTable
            data={payrollSummaryData || []}
            isLoading={isLoadingPayroll}
            error={payrollError}
            onViewDetails={handleViewDetails}
            onGeneratePayslip={handleGeneratePayslip}
            allowDetailedView={true}
          />
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Calculate Payroll */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Calculate Payroll</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Calculate payroll for all employees in the selected period
                  based on their time entries and pay rates.
                </p>
                <Button
                  onClick={handleCalculatePayroll}
                  disabled={isCalculating || !selectedPayPeriod?.id}
                  className="w-full"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Payroll
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generate Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span>Generate Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Generate an Excel report with detailed payroll information for
                  the selected period.
                </p>
                <Button
                  onClick={handleGenerateReport}
                  disabled={
                    isGeneratingReport ||
                    isDownloadingReport ||
                    !selectedPayPeriod?.id
                  }
                  variant="outline"
                  className="w-full"
                >
                  {isGeneratingReport || isDownloadingReport ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Generate Excel Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Send to Accountant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Send to Accountant</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Email the payroll report to the company accountant for
                  processing.
                </p>
                <Button
                  onClick={handleSendToAccountant}
                  disabled={isSendingToAccountant || !selectedPayPeriod?.id}
                  variant="secondary"
                  className="w-full"
                >
                  {isSendingToAccountant ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send to Accountant
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Auto-Generate Completed Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Auto-Generate Period</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {canGenerateData?.canGenerate
                    ? `${canGenerateData.reason}`
                    : canGenerateData?.reason ||
                      "Checking generation eligibility..."}
                </p>
                {canGenerateData?.periodInfo && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Ready to Generate:
                    </p>
                    <p className="text-sm text-blue-700">
                      {canGenerateData.periodInfo.description}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleGenerateCompletedPeriod}
                  disabled={isGeneratingPeriod || !canGenerateData?.canGenerate}
                  variant={canGenerateData?.canGenerate ? "default" : "outline"}
                  className="w-full"
                >
                  {isGeneratingPeriod ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Period...
                    </>
                  ) : canGenerateData?.canGenerate ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate {canGenerateData.periodInfo?.period} Period
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Auto-Generate (Not Available)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Summary */}
          {summaryStats && (
            <Card>
              <CardHeader>
                <CardTitle>Period Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Period:</span>
                    <p className="font-medium">{getPeriodLabel()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Total Net Pay:
                    </span>
                    <p className="font-medium">
                      {formatCurrency(summaryStats.totalNetPay)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Overtime Hours:
                    </span>
                    <p className="font-medium">
                      {formatHours(summaryStats.totalOvertimeHours)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Avg Hours/Employee:
                    </span>
                    <p className="font-medium">
                      {formatHours(
                        summaryStats.totalHours /
                          Math.max(summaryStats.totalEmployees, 1)
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
