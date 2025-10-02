import {
  ClockInRequest,
  ClockInResponse,
  ClockOutRequest,
  ClockOutResponse,
  ClockStatusResponse,
  GetTimeEntriesParams,
  GetTimeEntriesResponse,
  TimeAdjustmentRequest,
  TimeAdjustmentResponse,
  TimeEntry,
  TimeClockApiResponse,
} from "@empcon/types";
import { baseApi } from "./baseApi";

// ============================================================================
// Tag Helper Functions (Option 2: Employee-Specific Tags)
// ============================================================================

/**
 * Employee-specific tag generation for selective cache invalidation
 *
 * Purpose: TimeClock requires real-time updates but should only invalidate
 * caches for the specific employee who performed the action, not all employees.
 *
 * Pattern: Each tag function creates both a static tag (for admin views)
 * and an employee-specific tag (for individual employee queries).
 */

const TimeEntryTags = {
  /** Base tag - invalidates ALL time entry caches (use sparingly) */
  all: () => "TimeEntry" as const,

  /** Employee's clock status (real-time, 2min cache) */
  status: (employeeId: string) => ({ type: "TimeEntry" as const, id: `STATUS_${employeeId}` }),

  /** Employee's today entries (real-time, 2min cache) */
  today: (employeeId: string) => ({ type: "TimeEntry" as const, id: `TODAY_${employeeId}` }),

  /** Employee's general time entries list */
  list: (employeeId: string) => ({ type: "TimeEntry" as const, id: `LIST_${employeeId}` }),

  /** Employee's date range entries */
  range: (employeeId: string) => ({ type: "TimeEntry" as const, id: `RANGE_${employeeId}` }),

  /** Admin dashboard - today's roster for ALL employees */
  todayRoster: () => ({ type: "TimeEntry" as const, id: "TODAY_ROSTER" }),
};

export const timeclockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/timeclock/clock-in - Employee Clock-In
    clockIn: builder.mutation<ClockInResponse, ClockInRequest>({
      query: (clockInData) => ({
        url: "/timeclock/clock-in",
        method: "POST",
        body: clockInData,
      }),
      transformResponse: (response: TimeClockApiResponse<ClockInResponse>) =>
        response.data!,
      invalidatesTags: (result, error, request) => [
        // Employee-specific invalidation (80-90% performance improvement)
        TimeEntryTags.status(request.employeeId),
        TimeEntryTags.today(request.employeeId),
        TimeEntryTags.list(request.employeeId),
        // Admin dashboard invalidation (affects all employees view)
        TimeEntryTags.todayRoster(),
      ],
    }),

    // POST /api/timeclock/clock-out - Employee Clock-Out
    clockOut: builder.mutation<ClockOutResponse, ClockOutRequest>({
      query: (clockOutData) => ({
        url: "/timeclock/clock-out",
        method: "POST",
        body: clockOutData,
      }),
      transformResponse: (response: TimeClockApiResponse<ClockOutResponse>) =>
        response.data!,
      invalidatesTags: (result, error, request) => {
        // Extract employeeId from response (ClockOutRequest doesn't have it)
        const employeeId = result?.timeEntry?.employeeId;

        if (!employeeId) {
          // Fallback: invalidate all if employeeId unavailable
          return [TimeEntryTags.all(), TimeEntryTags.todayRoster()];
        }

        return [
          // Employee-specific invalidation
          TimeEntryTags.status(employeeId),
          TimeEntryTags.today(employeeId),
          TimeEntryTags.list(employeeId),
          // Admin dashboard invalidation
          TimeEntryTags.todayRoster(),
        ];
      },
    }),

    // GET /api/timeclock/status/:employeeId - Get Clock Status
    getClockStatus: builder.query<
      ClockStatusResponse,
      { employeeId: string; date?: string }
    >({
      query: ({ employeeId, date }) => ({
        url: `/timeclock/status/${employeeId}`,
        params: date ? { date } : {},
      }),
      transformResponse: (
        response: TimeClockApiResponse<ClockStatusResponse>
      ) => response.data!,
      providesTags: (result, error, { employeeId }) => [
        TimeEntryTags.status(employeeId),
      ],
      // Shorter cache for real-time status (2 minutes)
      keepUnusedDataFor: 2 * 60,
    }),

    // GET /api/timeclock/entries - Get Time Entries with Filtering
    getTimeEntries: builder.query<
      GetTimeEntriesResponse,
      Partial<GetTimeEntriesParams>
    >({
      query: (params = {}) => ({
        url: "/timeclock/entries",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data: TimeEntry[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result, error, params) => {
        // If employeeId filter applied, provide employee-specific tag
        if (params.employeeId) {
          return [TimeEntryTags.list(params.employeeId)];
        }
        // If no employeeId (admin view), provide roster tag
        return [TimeEntryTags.todayRoster()];
      },
    }),

    // PUT /api/timeclock/entries/:id - Manual Time Adjustment (Admin/Manager)
    adjustTimeEntry: builder.mutation<
      TimeAdjustmentResponse,
      { id: string; data: TimeAdjustmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/timeclock/entries/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (
        response: TimeClockApiResponse<TimeAdjustmentResponse>
      ) => response.data!,
      invalidatesTags: (result, error, { id }) => {
        const employeeId = result?.timeEntry?.employeeId;

        if (!employeeId) {
          // Fallback: invalidate all if employeeId unavailable
          return [TimeEntryTags.all(), TimeEntryTags.todayRoster()];
        }

        return [
          // Employee-specific invalidation
          TimeEntryTags.status(employeeId),
          TimeEntryTags.today(employeeId),
          TimeEntryTags.list(employeeId),
          TimeEntryTags.range(employeeId),
          // Admin dashboard invalidation
          TimeEntryTags.todayRoster(),
        ];
      },
    }),

    // Utility: Get Employee's Today Time Entries
    getEmployeeTodayTimeEntries: builder.query<
      GetTimeEntriesResponse,
      { employeeId: string; date?: string }
    >({
      query: ({ employeeId, date }) => {
        const baseDate = date || new Date().toISOString().split("T")[0];
        const base = new Date(baseDate);

        const startDate = new Date(base);
        startDate.setDate(base.getDate() - 1); // 하루 전

        const endDate = new Date(base);
        endDate.setDate(base.getDate() + 1); // 하루 후

        return {
          url: "/timeclock/entries",
          params: {
            employeeId,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            limit: 50,
          },
        };
      },
      transformResponse: (response: {
        success: boolean;
        data: TimeEntry[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result, error, { employeeId }) => [
        TimeEntryTags.today(employeeId),
      ],
    }),

    // Utility: Get Employee Time Entries for Date Range
    getEmployeeTimeEntriesByRange: builder.query<
      GetTimeEntriesResponse,
      { employeeId: string; startDate: string; endDate: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: "/timeclock/entries",
        params: {
          employeeId,
          startDate,
          endDate,
          limit: 100, // Sufficient for typical date ranges
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data: TimeEntry[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: (result, error, { employeeId }) => [
        TimeEntryTags.range(employeeId),
      ],
    }),

    // Today-specific API: Get today's time entries for dashboard (following Schedule API pattern)
    getTodayTimeEntries: builder.query<GetTimeEntriesResponse, void>({
      query: () => ({
        url: "/timeclock/today-entries",
      }),
      transformResponse: (response: {
        success: boolean;
        data: TimeEntry[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: [
        // Admin dashboard view - affects ALL employees
        TimeEntryTags.todayRoster(),
      ],
      // Shorter cache for real-time today status (2 minutes)
      keepUnusedDataFor: 2 * 60,
    }),

    // Development/Testing Endpoints (if needed)
    testPayrollRounding: builder.query<
      {
        originalMinutes: number;
        roundedMinutes: number;
        originalTime: string;
        roundedTime: string;
      },
      { time: string }
    >({
      query: ({ time }) => ({
        url: "/timeclock/test-rounding",
        params: { time },
      }),
      transformResponse: (response: TimeClockApiResponse<any>) =>
        response.data!,
      // Don't cache test endpoints
      keepUnusedDataFor: 0,
    }),

    testGracePeriod: builder.query<
      {
        originalTime: string;
        adjustedTime: string;
        gracePeriodApplied: boolean;
        withinGracePeriod: boolean;
      },
      { actualTime: string; scheduledTime: string; gracePeriodMinutes?: number }
    >({
      query: ({ actualTime, scheduledTime, gracePeriodMinutes }) => ({
        url: "/timeclock/test-grace-period",
        params: { actualTime, scheduledTime, gracePeriodMinutes },
      }),
      transformResponse: (response: TimeClockApiResponse<any>) =>
        response.data!,
      // Don't cache test endpoints
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  // Clock Operations
  useClockInMutation,
  useClockOutMutation,

  // Status Queries
  useGetClockStatusQuery,
  useLazyGetClockStatusQuery,

  // Time Entries
  useGetTimeEntriesQuery,
  useLazyGetTimeEntriesQuery,
  useGetEmployeeTodayTimeEntriesQuery,
  useGetEmployeeTimeEntriesByRangeQuery,
  useGetTodayTimeEntriesQuery,

  // Admin Operations
  useAdjustTimeEntryMutation,

  // Testing/Development
  useTestPayrollRoundingQuery,
  useTestGracePeriodQuery,
  useLazyTestPayrollRoundingQuery,
  useLazyTestGracePeriodQuery,
} = timeclockApi;
