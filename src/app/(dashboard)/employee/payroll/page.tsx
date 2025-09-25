"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { LoadingIndicator } from "@/shared/components/Loading";
import { PayrollSummaryCard } from "@/features/payroll/components/PayrollSummaryCard";
import { PayPeriodSelector } from "@/features/payroll/components/PayPeriodSelector";
import { PayrollDetailModal } from "@/features/payroll/components/PayrollDetailModal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  useGetCurrentPayPeriodQuery,
  useGetPayPeriodsQuery,
  useGetEmployeePayrollSummaryQuery,
  useGeneratePayslipMutation,
} from "@/store/api/payrollApi";
import {
  DollarSign,
  Calendar,
  Download,
  FileText,
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function EmployeePayrollPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const { selectedYear, selectedMonth, selectedPeriod } = useAppSelector(
    (state) => state.payroll
  );

  // Local state
  const [showSuccessAlert, setShowSuccessAlert] = useState<string | null>(null);
  const [showErrorAlert, setShowErrorAlert] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // API queries
  const { data: currentPeriodData } = useGetCurrentPayPeriodQuery();
  const { data: payPeriodsData } = useGetPayPeriodsQuery({
    year: selectedYear,
    month: selectedMonth,
  });

  // Find the pay period for the selected period (A or B)
  const selectedPayPeriod = payPeriodsData?.data.find(period => {
    const periodStart = new Date(period.startDate);
    const isAPeriod = periodStart.getDate() === 1;
    const isBPeriod = periodStart.getDate() === 16;
    return selectedPeriod === "A" ? isAPeriod : isBPeriod;
  });

  const {
    data: payrollData,
    isLoading: isLoadingPayroll,
    error: payrollError
  } = useGetEmployeePayrollSummaryQuery(
    {
      employeeId: user?.id!,
      payPeriodId: selectedPayPeriod?.id
    },
    { skip: !user?.id || !selectedPayPeriod?.id }
  );

  // API mutations
  const [generatePayslip, { isLoading: isGeneratingPayslip }] = useGeneratePayslipMutation();

  // Handle period change - no longer needed since we use real API data
  const handlePeriodChange = (period: { year: number; month: number; period: "A" | "B" }) => {
    // Period selection is handled by Redux state and API queries automatically
    // The selectedPayPeriod will be found based on the selected year/month/period
  };

  // Handle download payslip
  const handleDownloadPayslip = async () => {
    if (!user?.id || !selectedPayPeriod?.id) return;

    try {
      const result = await generatePayslip({
        employeeId: user.id,
        payPeriodId: selectedPayPeriod.id
      }).unwrap();

      setShowSuccessAlert("Payslip generated successfully!");
      setTimeout(() => setShowSuccessAlert(null), 5000);
    } catch (error) {
      setShowErrorAlert("Failed to generate payslip. Please try again.");
      setTimeout(() => setShowErrorAlert(null), 5000);
    }
  };

  // Handle request review
  const handleRequestReview = async () => {
    // TODO: Implement review request logic
    setShowSuccessAlert("Review request submitted successfully!");
    setTimeout(() => setShowSuccessAlert(null), 5000);
  };

  // Handle view detailed records
  const handleViewDetails = () => {
    setShowDetailModal(true);
  };

  // Get period label for display
  const getPeriodLabel = () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[selectedMonth - 1];
    const periodLabel = selectedPeriod === "A" ? "1st-15th" : "16th-End";
    return `${monthName} ${selectedYear} - Period ${selectedPeriod} (${periodLabel})`;
  };

  // Determine if current period is active
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentPeriod = currentDate.getDate() <= 15 ? "A" : "B";
  const isCurrentPeriod =
    selectedYear === currentYear &&
    selectedMonth === currentMonth &&
    selectedPeriod === currentPeriod;

  if (!user) return <LoadingIndicator />;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span>My Payroll</span>
          </h1>
          <p className="text-muted-foreground">
            View your payroll information, download payslips, and track your earnings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {isCurrentPeriod && (
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Current Period
            </Badge>
          )}
        </div>
      </div>

      {/* Success/Error Alerts */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            {showSuccessAlert}
          </AlertDescription>
        </Alert>
      )}

      {showErrorAlert && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {showErrorAlert}
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

      {/* Payroll Tabs */}
      <Tabs defaultValue="current-period" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current-period" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Current Period</span>
          </TabsTrigger>
          <TabsTrigger value="year-summary" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Year Summary</span>
          </TabsTrigger>
        </TabsList>

        {/* Current Period Tab */}
        <TabsContent value="current-period" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payroll Summary</h2>
            <Badge variant="outline">
              {getPeriodLabel()}
            </Badge>
          </div>

          {/* Main Payroll Summary Card */}
          <PayrollSummaryCard
            data={payrollData || null}
            isLoading={isLoadingPayroll}
            error={payrollError}
            payPeriodStatus="OPEN" // TODO: Get actual status
            periodLabel={getPeriodLabel()}
            onDownloadPayslip={handleDownloadPayslip}
            onRequestReview={handleRequestReview}
            showComparison={true}
            className="mb-6"
          />

          {/* Additional Actions */}
          {payrollData && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Need more details?</h3>
                    <p className="text-sm text-muted-foreground">
                      View your detailed work records, schedule comparisons, and time entries.
                    </p>
                  </div>
                  <Button onClick={handleViewDetails} variant="outline" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>View Detailed Records</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats Grid */}
          {payrollData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hours Worked</p>
                      <p className="text-2xl font-bold">
                        {payrollData.currentPeriod.totalHours.toFixed(1)}h
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Regular: {payrollData.currentPeriod.regularHours.toFixed(1)}h
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
                      <p className="text-sm font-medium text-muted-foreground">Overtime</p>
                      <p className="text-2xl font-bold">
                        {payrollData.currentPeriod.overtimeHours.toFixed(1)}h
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ {((payrollData.payRate || 0) * 1.5).toLocaleString("en-CA", {
                          style: "currency",
                          currency: "CAD",
                        })}/hr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Time Entries</p>
                      <p className="text-2xl font-bold">
                        {payrollData.currentPeriod.timeEntriesCount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Days worked
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Year Summary Tab */}
        <TabsContent value="year-summary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Year-to-Date Summary</h2>
            <Badge variant="outline">
              {selectedYear}
            </Badge>
          </div>

          {payrollData?.ytdSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">YTD Gross Pay</p>
                      <p className="text-2xl font-bold">
                        {payrollData.ytdSummary.totalGrossPay.toLocaleString("en-CA", {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">YTD Net Pay</p>
                      <p className="text-2xl font-bold">
                        {payrollData.ytdSummary.totalNetPay.toLocaleString("en-CA", {
                          style: "currency",
                          currency: "CAD",
                        })}
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
                      <p className="text-sm font-medium text-muted-foreground">YTD Hours</p>
                      <p className="text-2xl font-bold">
                        {payrollData.ytdSummary.totalHours.toFixed(1)}h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">YTD Deductions</p>
                      <p className="text-2xl font-bold">
                        {payrollData.ytdSummary.totalDeductions.toLocaleString("en-CA", {
                          style: "currency",
                          currency: "CAD",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No year-to-date summary available</p>
                  <p className="text-sm mt-1">
                    YTD data will appear once payroll has been processed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Detailed Records Modal */}
      <PayrollDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        payrollData={payrollData || null}
        periodLabel={getPeriodLabel()}
        onRequestReview={handleRequestReview}
        isLoadingReview={false}
      />
    </div>
  );
}