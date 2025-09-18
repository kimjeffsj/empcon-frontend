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
      invalidatesTags: [
        "TimeEntry",
        { type: "TimeEntry", id: "STATUS" },
        { type: "TimeEntry", id: "TODAY_STATUS" },
        { type: "TimeEntry", id: "TODAY" },
        { type: "TimeEntry", id: "LIST" },
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
      invalidatesTags: [
        "TimeEntry",
        { type: "TimeEntry", id: "STATUS" },
        { type: "TimeEntry", id: "TODAY_STATUS" },
        { type: "TimeEntry", id: "TODAY" },
        { type: "TimeEntry", id: "LIST" },
      ],
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
        { type: "TimeEntry", id: "STATUS" },
        { type: "TimeEntry", id: `STATUS_${employeeId}` },
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
        const tags: any[] = ["TimeEntry", { type: "TimeEntry", id: "LIST" }];
        if (params.employeeId) {
          tags.push({ type: "TimeEntry", id: `EMPLOYEE_${params.employeeId}` });
        }
        return tags;
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
      invalidatesTags: (result, error, { id }) => [
        "TimeEntry",
        { type: "TimeEntry", id },
        { type: "TimeEntry", id: "STATUS" },
        { type: "TimeEntry", id: "TODAY_STATUS" },
      ],
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
        { type: "TimeEntry", id: `EMPLOYEE_TODAY_${employeeId}` },
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
        { type: "TimeEntry", id: `EMPLOYEE_RANGE_${employeeId}` },
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
        "TimeEntry",
        { type: "TimeEntry", id: "TODAY" },
        { type: "TimeEntry", id: "LIST" },
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
