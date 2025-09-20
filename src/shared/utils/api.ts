// ===============================
// API UTILITIES AND CONSTANTS
// ===============================

/**
 * Common pagination constants
 * Standardizes limit values across different API endpoints
 */
export const API_LIMITS = {
  /** Default limit for list views (tables, general lists) */
  LIST: 20,

  /** Limit for "today" views (current day data) */
  TODAY: 50,

  /** Limit for calendar views (needs more data for date ranges) */
  CALENDAR: 100,

  /** Limit for employee directory (all employees) */
  EMPLOYEES: 100,
} as const;

/**
 * Standard API response structure for paginated lists
 */
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Standard API response structure for single items
 */
export interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Normalized response structure used by RTK Query
 */
export interface NormalizedListResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * RTK Query transformer for list responses
 * Normalizes the common { success, data, pagination } pattern
 */
export function normalizeListResponse<T>(
  response: ApiListResponse<T>
): NormalizedListResponse<T> {
  return {
    data: response.data,
    pagination: response.pagination,
  };
}

/**
 * RTK Query transformer for single item responses
 * Extracts data from the common { success, data } pattern
 */
export function normalizeSingleResponse<T>(
  response: ApiSingleResponse<T>
): T {
  return response.data;
}

/**
 * Generate default query parameters for paginated endpoints
 */
export function getDefaultQueryParams(
  params: Record<string, any> = {},
  defaultLimit: number = API_LIMITS.LIST
): Record<string, any> {
  return {
    page: params.page || 1,
    limit: params.limit || defaultLimit,
    ...params,
  };
}

/**
 * Common RTK Query tag patterns for cache invalidation
 */
export const CACHE_TAGS = {
  // Entity-level tags
  SCHEDULE: "Schedule",
  TIME_ENTRY: "TimeEntry",
  EMPLOYEE: "Employee",

  // List-level tags (for invalidating lists)
  SCHEDULE_LIST: { type: "Schedule" as const, id: "LIST" },
  TIME_ENTRY_LIST: { type: "TimeEntry" as const, id: "LIST" },
  EMPLOYEE_LIST: { type: "Employee" as const, id: "LIST" },

  // Special purpose tags
  TODAY_SCHEDULE: { type: "Schedule" as const, id: "TODAY" },
  TODAY_TIME_ENTRY: { type: "TimeEntry" as const, id: "TODAY" },
  CLOCK_STATUS: { type: "TimeEntry" as const, id: "STATUS" },
} as const;

/**
 * Generate cache tags for a specific entity
 */
export function generateEntityTags<T extends string>(
  entityType: T,
  id?: string | number
): Array<{ type: T; id?: string | number }> {
  const tags: Array<{ type: T; id?: string | number }> = [{ type: entityType }];

  if (id !== undefined) {
    tags.push({ type: entityType, id });
  }

  return tags;
}

/**
 * Standard error handling for RTK Query
 */
export function handleApiError(error: any): string {
  if (error?.data?.message) {
    return error.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}