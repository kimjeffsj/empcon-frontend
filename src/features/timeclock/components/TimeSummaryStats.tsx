"use client";

import React from "react";
import { StatsCard } from "@/shared/components/StatsCard";
import { 
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface TimeSummary {
  totalEntries: number;
  completedShifts: number;
  totalHours: number;
  averageHours: number;
  overtimeHours: number;
}

interface TimeSummaryStatsProps {
  summary: TimeSummary;
  isLoading?: boolean;
  className?: string;
}

export function TimeSummaryStats({ 
  summary, 
  isLoading = false, 
  className = "" 
}: TimeSummaryStatsProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate performance metrics
  const completionRate = summary.totalEntries > 0 
    ? Math.round((summary.completedShifts / summary.totalEntries) * 100) 
    : 0;
  
  const hasOvertime = summary.overtimeHours > 0;
  const avgHoursStatus = summary.averageHours >= 8 ? "positive" : "neutral";

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {/* Total Hours */}
      <StatsCard
        title="Total Hours"
        value={`${summary.totalHours}h`}
        change={`${summary.totalEntries} entries`}
        changeType="neutral"
        icon={Clock}
      />
      
      {/* Completed Shifts */}
      <StatsCard
        title="Completed Shifts"
        value={summary.completedShifts.toString()}
        change={`${completionRate}% completion rate`}
        changeType={completionRate >= 90 ? "positive" : completionRate >= 70 ? "neutral" : "negative"}
        icon={CheckCircle2}
      />
      
      {/* Average Hours */}
      <StatsCard
        title="Average Hours"
        value={`${summary.averageHours}h`}
        change={summary.completedShifts > 0 ? "per completed shift" : "No completed shifts"}
        changeType={avgHoursStatus}
        icon={TrendingUp}
      />
      
      {/* Overtime Hours */}
      <StatsCard
        title="Overtime Hours"
        value={`${summary.overtimeHours}h`}
        change={hasOvertime ? `${Math.round((summary.overtimeHours / summary.totalHours) * 100)}% of total` : "No overtime"}
        changeType={hasOvertime ? "negative" : "positive"}
        icon={AlertTriangle}
      />
    </div>
  );
}