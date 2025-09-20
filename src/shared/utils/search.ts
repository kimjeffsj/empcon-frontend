import React from "react";

// ===============================
// SEARCH AND FILTER UTILITIES
// ===============================

/**
 * Employee search fields interface
 */
export interface EmployeeSearchFields {
  employeeNumber?: string;
  name?: string;
  position?: string;
  location?: string;
  department?: string;
}

/**
 * Generic item with employee information
 */
export interface ItemWithEmployee {
  employee?: {
    employeeNumber: string;
    firstName: string;
    lastName: string;
    position?: string;
    department?: string;
    location?: string;
  };
}

/**
 * Build predicate function for employee-based search
 * Returns a function that can be used with Array.filter()
 */
export function buildEmployeeSearchPredicate<T extends ItemWithEmployee>(
  searchTerm: string,
  searchFields: EmployeeSearchFields = {}
): (item: T) => boolean {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  if (!normalizedSearch) {
    return () => true; // Return all items if no search term
  }

  return (item: T) => {
    if (!item.employee) return false;

    const { employee } = item;
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();

    // Check all searchable fields
    const searchTargets = [
      searchFields.employeeNumber !== false ? employee.employeeNumber : "",
      searchFields.name !== false ? fullName : "",
      searchFields.position !== false ? (employee.position || "") : "",
      searchFields.department !== false ? (employee.department || "") : "",
      searchFields.location !== false ? (employee.location || "") : "",
    ].filter(Boolean);

    return searchTargets.some(target =>
      target.toLowerCase().includes(normalizedSearch)
    );
  };
}

/**
 * Filter items by status
 * Generic function that works with any item having a status field
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  statusFilter: string | null
): T[] {
  if (!statusFilter || statusFilter === "all") {
    return items;
  }
  return items.filter(item => item.status === statusFilter);
}

/**
 * Filter items by date range
 * Works with items having startTime field
 */
export function filterByDateRange<T extends { startTime: string }>(
  items: T[],
  startDate?: string,
  endDate?: string
): T[] {
  if (!startDate && !endDate) {
    return items;
  }

  return items.filter(item => {
    const itemDate = new Date(item.startTime).toISOString().split('T')[0];

    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;

    return true;
  });
}

/**
 * Generic multi-criteria filter function
 * Combines search, status, and date filtering
 */
export function applyFilters<T extends ItemWithEmployee & { status: string; startTime: string }>(
  items: T[],
  filters: {
    search?: string;
    status?: string | null;
    startDate?: string;
    endDate?: string;
    searchFields?: EmployeeSearchFields;
  }
): T[] {
  let filtered = items;

  // Apply search filter
  if (filters.search) {
    const searchPredicate = buildEmployeeSearchPredicate(
      filters.search,
      filters.searchFields
    );
    filtered = filtered.filter(searchPredicate);
  }

  // Apply status filter
  filtered = filterByStatus(filtered, filters.status);

  // Apply date range filter
  filtered = filterByDateRange(filtered, filters.startDate, filters.endDate);

  return filtered;
}

/**
 * Debounced search hook for better performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for managing search and filter state
 */
export function useSearchAndFilter<T extends ItemWithEmployee & { status: string; startTime: string }>(
  items: T[],
  defaultFilters: Partial<{
    search: string;
    status: string | null;
    startDate: string;
    endDate: string;
    searchFields: EmployeeSearchFields;
  }> = {}
) {
  const [filters, setFilters] = React.useState({
    search: "",
    status: null as string | null,
    startDate: "",
    endDate: "",
    searchFields: {},
    ...defaultFilters,
  });

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(filters.search, 300);

  const filteredItems = React.useMemo(() => {
    return applyFilters(items, {
      ...filters,
      search: debouncedSearch,
    });
  }, [items, debouncedSearch, filters.status, filters.startDate, filters.endDate, filters.searchFields]);

  const updateFilters = React.useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({
      search: "",
      status: null,
      startDate: "",
      endDate: "",
      searchFields: {},
      ...defaultFilters,
    });
  }, [defaultFilters]);

  return {
    filters,
    filteredItems,
    updateFilters,
    resetFilters,
    resultsCount: filteredItems.length,
    totalCount: items.length,
  };
}