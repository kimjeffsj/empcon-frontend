'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetPayPeriodsQuery,
  useGeneratePayrollReportMutation,
} from '@/store/api/payrollApi';
import { downloadFile, generateExcelFilename } from '../utils/fileHandlers';

/**
 * Excel Generation Card Component
 * Allows managers to generate and download Excel payroll reports
 */
export const ExcelGenerationCard = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

  // Fetch pay periods
  const { data: payPeriods, isLoading: isLoadingPeriods } = useGetPayPeriodsQuery();

  // Generate Excel mutation
  const [generateReport, { isLoading: isGenerating }] = useGeneratePayrollReportMutation();

  const handleGenerate = async () => {
    if (!selectedPeriodId) {
      toast.error('Please select a pay period');
      return;
    }

    try {
      const selectedPeriod = payPeriods?.find((p) => p.id === selectedPeriodId);
      if (!selectedPeriod) {
        toast.error('Selected pay period not found');
        return;
      }

      // Generate Excel file
      const blob = await generateReport({ payPeriodId: selectedPeriodId }).unwrap();

      // Extract period info for filename
      const startDate = new Date(selectedPeriod.startDate);
      const month = startDate.getMonth() + 1;
      const year = startDate.getFullYear();
      const day = startDate.getDate();
      const period = day === 1 ? 'A' : 'B';

      const filename = generateExcelFilename(month, year, period as 'A' | 'B');
      downloadFile(blob, filename);

      toast.success('Excel report generated successfully');
    } catch (error) {
      console.error('Failed to generate Excel:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error &&
        error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : 'Failed to generate Excel report';
      toast.error(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Generate Excel Report
        </CardTitle>
        <CardDescription>
          Generate payroll Excel report to send to accountant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Pay Period</label>
          <Select
            value={selectedPeriodId}
            onValueChange={setSelectedPeriodId}
            disabled={isLoadingPeriods}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a pay period" />
            </SelectTrigger>
            <SelectContent>
              {payPeriods?.map((period) => {
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                const label = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} (${
                  period.status
                })`;
                return (
                  <SelectItem key={period.id} value={period.id}>
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!selectedPeriodId || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            'Generating...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Excel
            </>
          )}
        </Button>

        <Alert>
          <AlertDescription>
            The Excel file will contain employee hours and calculations for the selected pay period.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
