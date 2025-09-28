// ===============================
// FILE DOWNLOAD UTILITIES
// ===============================

/**
 * File download utilities for handling blob responses from authenticated API endpoints.
 * Separated from RTK Query to avoid caching issues and memory problems with large files.
 */

import { useState } from 'react';

// ===============================
// TYPES AND INTERFACES
// ===============================

export interface DownloadOptions {
  /** Custom filename to use instead of extracting from Content-Disposition */
  filename?: string;
  /** Whether to automatically trigger download (default: true) */
  autoDownload?: boolean;
}

export interface DownloadResult {
  /** The downloaded blob */
  blob: Blob;
  /** Extracted or provided filename */
  filename: string;
  /** Blob URL for manual handling */
  url: string;
}

export class DownloadError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly statusText?: string
  ) {
    super(message);
    this.name = 'DownloadError';
  }
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Extract filename from Content-Disposition header
 */
function extractFilename(response: Response): string {
  const contentDisposition = response.headers.get('Content-Disposition');

  if (contentDisposition) {
    // Try to match filename="..." or filename*=UTF-8''...
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch) {
      let filename = filenameMatch[1];
      // Remove quotes if present
      if (filename.startsWith('"') && filename.endsWith('"')) {
        filename = filename.slice(1, -1);
      }
      return filename;
    }
  }

  // Fallback to timestamp-based filename
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `download-${timestamp}`;
}

/**
 * Trigger automatic file download using blob URL
 */
function triggerDownload(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL after a short delay to allow download to start
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);

  return url;
}

// ===============================
// CORE DOWNLOAD FUNCTION
// ===============================

/**
 * Download file from authenticated API endpoint
 */
export async function downloadFile(
  endpoint: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const { filename: providedFilename, autoDownload = true } = options;

  try {
    const response = await fetch(`http://localhost:5002/api${endpoint}`, {
      method: 'GET',
      credentials: 'include', // Include auth cookies
      headers: {
        // Don't set Content-Type for file downloads
      },
    });

    if (!response.ok) {
      let errorMessage = `Download failed: ${response.status} ${response.statusText}`;

      // Try to get error message from response body
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response isn't JSON, use default message
      }

      throw new DownloadError(errorMessage, response.status, response.statusText);
    }

    const blob = await response.blob();
    const filename = providedFilename || extractFilename(response);

    let url: string;
    if (autoDownload) {
      url = triggerDownload(blob, filename);
    } else {
      url = URL.createObjectURL(blob);
    }

    return { blob, filename, url };

  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }

    // Handle network errors
    throw new DownloadError(
      error instanceof Error ? error.message : 'Network error during download'
    );
  }
}

/**
 * Download file with POST request (for generated reports)
 */
export async function downloadFileWithPayload(
  endpoint: string,
  payload: Record<string, unknown>,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const { filename: providedFilename, autoDownload = true } = options;

  try {
    const response = await fetch(`http://localhost:5002/api${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Download failed: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response isn't JSON, use default message
      }

      throw new DownloadError(errorMessage, response.status, response.statusText);
    }

    const blob = await response.blob();
    const filename = providedFilename || extractFilename(response);

    let url: string;
    if (autoDownload) {
      url = triggerDownload(blob, filename);
    } else {
      url = URL.createObjectURL(blob);
    }

    return { blob, filename, url };

  } catch (error) {
    if (error instanceof DownloadError) {
      throw error;
    }

    throw new DownloadError(
      error instanceof Error ? error.message : 'Network error during download'
    );
  }
}

// ===============================
// PAYROLL-SPECIFIC FUNCTIONS
// ===============================

/**
 * Download payslip PDF for a specific payslip ID
 * Replaces: useGetPayslipQuery from RTK Query
 */
export async function downloadPayslip(
  payslipId: string,
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  return downloadFile(`/payroll/payslips/${payslipId}`, {
    filename: options.filename || `payslip-${payslipId}.pdf`,
    ...options,
  });
}

/**
 * Generate and download payroll report
 * Replaces: useGeneratePayrollReportMutation from RTK Query
 */
export async function downloadPayrollReport(
  payPeriodId: string,
  format: 'excel' | 'pdf' = 'excel',
  options: DownloadOptions = {}
): Promise<DownloadResult> {
  const fileExt = format === 'excel' ? 'xlsx' : 'pdf';

  return downloadFileWithPayload(
    '/payroll/reports/generate',
    { payPeriodId, format },
    {
      filename: options.filename || `payroll-report-${payPeriodId}.${fileExt}`,
      ...options,
    }
  );
}

// ===============================
// HELPER HOOKS FOR REACT COMPONENTS
// ===============================

/**
 * React hook for handling download state
 * Provides loading state and error handling for downloads
 */
export function useDownloadState() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (downloadFn: () => Promise<DownloadResult>) => {
    setIsDownloading(true);
    setError(null);

    try {
      await downloadFn();
    } catch (err) {
      const errorMessage = err instanceof DownloadError
        ? err.message
        : 'Download failed';
      setError(errorMessage);
      throw err; // Re-throw so component can handle if needed
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    isDownloading,
    error,
    handleDownload,
    clearError: () => setError(null),
  };
}