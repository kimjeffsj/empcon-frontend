/**
 * File handling utilities for payroll feature
 * Handles file downloads and uploads with proper browser integration
 */

/**
 * Trigger browser download for a blob
 * @param blob - The blob data to download
 * @param filename - Desired filename for the download
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Validate file type before upload
 * @param file - File to validate
 * @returns True if file type is allowed (PDF only)
 */
export const validatePdfFile = (file: File): boolean => {
  const validTypes = ['application/pdf'];
  return validTypes.includes(file.type);
};

/**
 * Validate multiple files before upload
 * @param files - Array of files to validate
 * @returns Object with validation result and error messages
 */
export const validatePdfFiles = (files: File[]): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push('No files selected');
  }

  if (files.length > 50) {
    errors.push('Maximum 50 files allowed');
  }

  files.forEach((file, index) => {
    if (!validatePdfFile(file)) {
      errors.push(`File ${index + 1} (${file.name}) is not a PDF`);
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push(
        `File ${index + 1} (${file.name}) exceeds 10MB limit`
      );
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create FormData for bulk payslip upload
 * @param files - Array of PDF files to upload
 * @returns FormData object ready for API submission
 */
export const createPayslipFormData = (files: File[]): FormData => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('payslips', file);
  });
  return formData;
};

/**
 * Generate filename for payslip download
 * @param employeeName - Employee's name
 * @param periodLabel - Pay period label (e.g., "Sep A")
 * @returns Formatted filename
 */
export const generatePayslipFilename = (
  employeeName: string,
  periodLabel: string
): string => {
  return `${periodLabel} - ${employeeName}.pdf`;
};

/**
 * Generate filename for Excel report download
 * @param month - Month number (1-12)
 * @param year - Year
 * @param period - Period ('A' or 'B')
 * @returns Formatted filename
 */
export const generateExcelFilename = (
  month: number,
  year: number,
  period: 'A' | 'B'
): string => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = monthNames[month - 1];
  return `${monthName} ${period} Payroll ${year}.xlsx`;
};

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
