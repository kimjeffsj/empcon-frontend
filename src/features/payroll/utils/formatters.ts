/**
 * Payroll-specific formatting utilities
 *
 * Purpose: Formatting functions for payroll data display
 * Context: Canadian localization (CAD currency, English labels)
 */

import { Payslip, PayslipSummary } from '@empcon/types';

/**
 * Format amount as Canadian dollar currency
 * @param amount - Numeric amount to format
 * @returns Formatted currency string (e.g., "$4,345.00")
 *
 * @example
 * formatCurrency(4345) // "$4,345.00"
 * formatCurrency(1234.5) // "$1,234.50"
 * formatCurrency(0) // "$0.00"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format hours with 2 decimal places
 * @param hours - Number of hours (can be null)
 * @returns Formatted hours string or "-" if null
 *
 * @example
 * formatHours(75.5) // "75.50"
 * formatHours(80) // "80.00"
 * formatHours(null) // "-"
 */
export const formatHours = (hours: number | null): string => {
  if (hours === null || hours === undefined) return '-';
  return hours.toFixed(2);
};

/**
 * Extract month name from ISO date string
 * @param dateString - ISO date string (e.g., "2024-03-01T00:00:00.000Z")
 * @returns Full month name (e.g., "January")
 *
 * @example
 * getMonthName("2024-03-01T00:00:00.000Z") // "March"
 * getMonthName("2024-12-15") // "December"
 */
export const getMonthName = (dateString: string): string => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC'
  });
};

/**
 * Extract year from ISO date string
 * @param dateString - ISO date string
 * @returns Year as string (e.g., "2024")
 *
 * @example
 * getYear("2024-03-01T00:00:00.000Z") // "2024"
 */
export const getYear = (dateString: string): string => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Extract pay period (A or B) from payslip
 *
 * Logic:
 * - Day 1-15: Period A
 * - Day 16-end of month: Period B
 *
 * @param payslip - Payslip object with payPeriod data
 * @returns "A", "B", or "-" if no data
 *
 * @example
 * extractPeriod(payslipWithMarch1) // "A"
 * extractPeriod(payslipWithMarch16) // "B"
 */
export const extractPeriod = (payslip: Payslip): 'A' | 'B' | '-' => {
  if (!payslip.payPeriod?.startDate) return '-';

  const day = new Date(payslip.payPeriod.startDate).getUTCDate();
  return day <= 15 ? 'A' : 'B';
};

/**
 * Calculate total hours (regular + overtime)
 * @param payslip - Payslip object
 * @returns Total hours sum
 *
 * @example
 * calculateTotalHours({ regularHours: 75, overtimeHours: 5 }) // 80
 * calculateTotalHours({ regularHours: null, overtimeHours: null }) // 0
 */
export const calculateTotalHours = (payslip: Payslip): number => {
  const regular = payslip.regularHours ?? 0;
  const overtime = payslip.overtimeHours ?? 0;
  return regular + overtime;
};

/**
 * Format month and year together
 * @param dateString - ISO date string
 * @returns Formatted month and year (e.g., "January 2024")
 *
 * @example
 * formatMonthYear("2024-03-01") // "March 2024"
 */
export const formatMonthYear = (dateString: string): string => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/**
 * Format pay period display string
 * @param payslip - Payslip object
 * @returns Formatted period string (e.g., "March 2024 - A")
 *
 * @example
 * formatPeriodDisplay(payslip) // "March 2024 - A"
 */
export const formatPeriodDisplay = (payslip: Payslip): string => {
  if (!payslip.payPeriod?.startDate) return '-';

  const monthYear = formatMonthYear(payslip.payPeriod.startDate);
  const period = extractPeriod(payslip);

  return `${monthYear} - ${period}`;
};

/**
 * Parse payPeriod string format "YYYY-MM-P" into components
 * @param payPeriodString - Pay period string (e.g., "2024-01-A")
 * @returns Object with year, month, and period components
 *
 * @example
 * parsePayPeriodString("2024-01-A") // { year: "2024", month: "01", period: "A" }
 * parsePayPeriodString("invalid") // { year: "-", month: "-", period: "-" }
 */
export const parsePayPeriodString = (
  payPeriodString: string
): { year: string; month: string; period: string } => {
  if (!payPeriodString) return { year: '-', month: '-', period: '-' };

  const parts = payPeriodString.split('-');
  if (parts.length !== 3) return { year: '-', month: '-', period: '-' };

  return {
    year: parts[0],
    month: parts[1],
    period: parts[2],
  };
};

/**
 * Get month name from payPeriod string "YYYY-MM-P"
 * @param payPeriodString - Pay period string (e.g., "2024-01-A")
 * @returns Full month name (e.g., "January")
 *
 * @example
 * getMonthNameFromPeriod("2024-01-A") // "January"
 * getMonthNameFromPeriod("2024-12-B") // "December"
 */
export const getMonthNameFromPeriod = (payPeriodString: string): string => {
  if (!payPeriodString) return '-';

  const { year, month } = parsePayPeriodString(payPeriodString);
  if (year === '-' || month === '-') return '-';

  // Create date from year and month (use day 1 to get month name)
  const date = new Date(`${year}-${month}-01`);
  return date.toLocaleString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  });
};

/**
 * Get year from payPeriod string "YYYY-MM-P"
 * @param payPeriodString - Pay period string (e.g., "2024-01-A")
 * @returns Year as string (e.g., "2024")
 *
 * @example
 * getYearFromPeriod("2024-01-A") // "2024"
 */
export const getYearFromPeriod = (payPeriodString: string): string => {
  if (!payPeriodString) return '-';

  const { year } = parsePayPeriodString(payPeriodString);
  return year;
};

/**
 * Get period (A or B) from payPeriod string "YYYY-MM-P"
 * @param payPeriodString - Pay period string (e.g., "2024-01-A")
 * @returns Period character ("A", "B", or "-")
 *
 * @example
 * getPeriodFromString("2024-01-A") // "A"
 * getPeriodFromString("2024-01-B") // "B"
 */
export const getPeriodFromString = (payPeriodString: string): string => {
  if (!payPeriodString) return '-';

  const { period } = parsePayPeriodString(payPeriodString);
  return period;
};

/**
 * Calculate total hours for PayslipSummary (which already has totalHours)
 * @param payslip - PayslipSummary object
 * @returns Total hours
 *
 * @example
 * calculateTotalHoursFromSummary({ totalHours: 80 }) // 80
 */
export const calculateTotalHoursFromSummary = (
  payslip: PayslipSummary
): number => {
  return payslip.totalHours ?? 0;
};
