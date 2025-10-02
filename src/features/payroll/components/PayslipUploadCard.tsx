'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Progress } from '@/shared/ui/progress';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Upload, File, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetPayPeriodsQuery,
  useBulkUploadPayslipsMutation,
} from '@/store/api/payrollApi';
import { validatePdfFiles, createPayslipFormData, formatFileSize } from '../utils/fileHandlers';

/**
 * Payslip Upload Card Component
 * Allows managers to bulk upload payslip PDF files
 */
export const PayslipUploadCard = () => {
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch pay periods
  const { data: payPeriodsData, isLoading: isLoadingPeriods } = useGetPayPeriodsQuery({});
  const payPeriods = payPeriodsData?.data || [];

  // Upload mutation
  const [uploadPayslips, { isLoading: isUploading }] = useBulkUploadPayslipsMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    const validation = validatePdfFiles(files);
    if (!validation.valid) {
      toast.error(validation.errors.join('\n'));
      return;
    }

    setSelectedFiles(files);
    toast.success(`${files.length} file(s) selected`);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedPeriodId) {
      toast.error('Please select a pay period');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    try {
      setUploadProgress(0);
      const formData = createPayslipFormData(selectedFiles);

      const result = await uploadPayslips({
        payPeriodId: selectedPeriodId,
        formData,
      }).unwrap();

      setUploadProgress(100);

      if (result.success > 0) {
        toast.success(
          `Successfully uploaded ${result.success} payslip(s). ${result.failed} failed.`
        );
      }

      if (result.errors.length > 0) {
        console.error('Upload errors:', result.errors);
        toast.error(`Upload errors: ${result.errors.slice(0, 3).join(', ')}`);
      }

      // Clear selection
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload payslips:', error);
      const errorMessage = error && typeof error === 'object' && 'data' in error &&
        error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : 'Failed to upload payslips';
      toast.error(errorMessage);
      setUploadProgress(0);
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Payslip Files
        </CardTitle>
        <CardDescription>
          Bulk upload payslip PDF files from accountant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Pay Period</label>
          <Select
            value={selectedPeriodId}
            onValueChange={setSelectedPeriodId}
            disabled={isLoadingPeriods || isUploading}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Select PDF Files</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            Maximum 50 files, 10MB per file. Format: &ldquo;Period - FirstName LastName.pdf&rdquo;
          </p>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Selected Files ({selectedFiles.length})
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <File className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isUploading && uploadProgress > 0 && (
          <div className="space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-xs text-center text-muted-foreground">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedPeriodId || selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? (
            'Uploading...'
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {selectedFiles.length} File(s)
            </>
          )}
        </Button>

        <Alert>
          <AlertDescription>
            Files will be automatically matched to employees based on the filename format.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
