'use client';

/**
 * SummaryCard Component
 *
 * Reusable card component for displaying summary metrics
 * Used in PayrollSummaryCards to show key payroll information
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { LucideIcon } from 'lucide-react';
import { formatCurrency, formatHours } from '../../utils/formatters';

export type SummaryCardFormat = 'currency' | 'number' | 'hours' | 'rate';

interface SummaryCardProps {
  /** Card title (e.g., "Gross Pay") */
  title: string;

  /** Value to display */
  value: string | number;

  /** Optional icon component */
  icon?: LucideIcon;

  /** Format type for value display */
  format?: SummaryCardFormat;

  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Format value based on type
 */
const formatValue = (value: string | number, format: SummaryCardFormat): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  switch (format) {
    case 'currency':
      return formatCurrency(numValue);
    case 'hours':
      return formatHours(numValue);
    case 'rate':
      return formatCurrency(numValue);
    case 'number':
    default:
      return numValue.toString();
  }
};

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  format = 'number',
  className = '',
}: SummaryCardProps) => {
  const formattedValue = formatValue(value, format);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
      </CardContent>
    </Card>
  );
};
