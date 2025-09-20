import { SearchFilter } from "@/shared/components/SearchFilter";
import { useState, useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { TimeSummaryStats } from "./TimeSummaryStats";
import { TimeEntryList } from "./TimeEntryList";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

// Time Summary interface
interface TimeSummary {
  totalEntries: number;
  completedShifts: number;
  totalHours: number;
  averageHours: number;
  overtimeHours: number;
}

// Separate component for Time Entries tab content
interface TimeEntriesTabContentProps {
  dateRange: { startDate: string; endDate: string } | undefined;
  selectedDateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function TimeEntriesTabContent({
  dateRange,
  selectedDateRange,
  onDateRangeChange,
}: TimeEntriesTabContentProps) {
  // Local filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Summary state received from TimeEntryList
  const [summary, setSummary] = useState<TimeSummary>({
    totalEntries: 0,
    completedShifts: 0,
    totalHours: 0,
    averageHours: 0,
    overtimeHours: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const handleSummaryLoad = useCallback((
    summaryData: TimeSummary,
    isLoading: boolean
  ) => {
    setSummary((prev) =>
      JSON.stringify(prev) !== JSON.stringify(summaryData) ? summaryData : prev
    );
    setIsLoadingSummary((prev) => (prev !== isLoading ? isLoading : prev));
  }, []);

  // Status filter handler
  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(prev => prev !== value ? value : prev);
  }, []);

  // Filter options for SearchFilter
  const filterOptions = useMemo(
    () => [
      {
        value: statusFilter,
        onChange: handleStatusFilterChange,
        options: [
          { value: "ALL", label: "All Status" },
          { value: "CLOCKED_IN", label: "Clocked In" },
          { value: "CLOCKED_OUT", label: "Clocked Out" },
          { value: "ADJUSTED", label: "Adjusted" },
        ],
        placeholder: "Filter by status",
        width: "w-[140px]",
      },
    ],
    [statusFilter, handleStatusFilterChange]
  );

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            All Employee Time Entries
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Review, search, and adjust employee time entries across all
            departments
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchFilter
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by name, employee ID, or department..."
        showDateRange={true}
        dateRange={selectedDateRange}
        onDateRangeChange={onDateRangeChange}
        dateRangePlaceholder="Select date range"
        filters={filterOptions}
      />

      {/* Statistics Cards */}
      <TimeSummaryStats summary={summary} isLoading={isLoadingSummary} />

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Time Entries
            {!isLoadingSummary && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({summary.totalEntries} entries found)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeEntryList
            dateRange={dateRange}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            showEmployeeInfo={true} // Show employee info for admin view
            allowManualAdjustments={true} // Allow time adjustments
            className="border-none shadow-none"
            onSummaryLoad={handleSummaryLoad}
          />
        </CardContent>
      </Card>
    </div>
  );
}
