import {
  ApiResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  BulkCreateScheduleRequest,
  BulkCreateScheduleResponse,
  GetSchedulesParams,
  GetSchedulesResponse,
  Schedule,
  ConflictCheckRequest,
  ConflictCheckResponse,
  TodayRosterResponse,
} from "@empcon/types";
import { baseApi } from "./baseApi";

export const schedulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/schedules - 스케줄 목록 조회 (필터링, 페이지네이션)
    getSchedules: builder.query<
      GetSchedulesResponse,
      Partial<GetSchedulesParams>
    >({
      query: (params = {}) => ({
        url: "/schedules",
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          ...params,
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data: Schedule[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: ["Schedule"],
    }),

    // GET /api/schedules/:id - 특정 스케줄 조회
    getScheduleById: builder.query<Schedule, string>({
      query: (id) => `/schedules/${id}`,
      transformResponse: (response: ApiResponse<Schedule>) => response.data!,
      providesTags: (result, error, id) => [{ type: "Schedule", id }],
    }),

    // POST /api/schedules - 스케줄 생성
    createSchedule: builder.mutation<Schedule, CreateScheduleRequest>({
      query: (scheduleData) => ({
        url: "/schedules",
        method: "POST",
        body: scheduleData,
      }),
      transformResponse: (response: ApiResponse<Schedule>) => response.data!,
      invalidatesTags: ["Schedule", "TodayRoster"],
    }),

    // PUT /api/schedules/:id - 스케줄 수정
    updateSchedule: builder.mutation<
      Schedule,
      { id: string; data: UpdateScheduleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/schedules/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<Schedule>) => response.data!,
      invalidatesTags: (result, error, { id }) => [
        "Schedule",
        { type: "Schedule", id },
        "TodayRoster",
      ],
    }),

    // DELETE /api/schedules/:id - 스케줄 삭제 (소프트 삭제)
    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedule", "TodayRoster"],
    }),

    // POST /api/schedules/bulk - 대량 스케줄 생성
    bulkCreateSchedules: builder.mutation<
      BulkCreateScheduleResponse,
      BulkCreateScheduleRequest
    >({
      query: (bulkData) => ({
        url: "/schedules/bulk",
        method: "POST",
        body: bulkData,
      }),
      transformResponse: (response: ApiResponse<BulkCreateScheduleResponse>) =>
        response.data!,
      invalidatesTags: ["Schedule", "TodayRoster"],
    }),

    // GET /api/schedules/conflicts - 스케줄 충돌 감지
    checkScheduleConflicts: builder.query<
      ConflictCheckResponse,
      ConflictCheckRequest
    >({
      query: (params) => ({
        url: "/schedules/conflicts",
        params,
      }),
      transformResponse: (response: ApiResponse<ConflictCheckResponse>) =>
        response.data!,
      // Don't cache conflict checks as they're always real-time
      keepUnusedDataFor: 0,
    }),

    // GET /api/schedules/today-roster - 오늘의 로스터 (Dashboard용)
    getTodayRoster: builder.query<TodayRosterResponse, void>({
      query: () => "/schedules/today-roster",
      transformResponse: (response: ApiResponse<TodayRosterResponse>) =>
        response.data!,
      providesTags: ["TodayRoster"],
      // Refetch every 5 minutes for real-time dashboard
      // pollingInterval: 5 * 60 * 1000, // 5 minutes
    }),

    // Utility: Get schedules for specific employee and date range
    getEmployeeSchedules: builder.query<
      GetSchedulesResponse,
      { employeeId: string; startDate?: string; endDate?: string }
    >({
      query: ({ employeeId, startDate, endDate }) => ({
        url: "/schedules",
        params: {
          employeeId,
          startDate,
          endDate,
          limit: 100, // Get more for calendar views
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data: Schedule[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: ["Schedule"],
    }),

    // Utility: Get schedules for date range (for calendar views)
    getSchedulesByDateRange: builder.query<
      GetSchedulesResponse,
      { startDate: string; endDate: string; employeeId?: string }
    >({
      query: ({ startDate, endDate, employeeId }) => ({
        url: "/schedules",
        params: {
          startDate,
          endDate,
          employeeId,
          limit: 1000, // Large limit for calendar views
        },
      }),
      transformResponse: (response: {
        success: boolean;
        data: Schedule[];
        pagination: any;
      }) => ({
        data: response.data,
        pagination: response.pagination,
      }),
      providesTags: ["Schedule"],
    }),
  }),
});

export const {
  useGetSchedulesQuery,
  useGetScheduleByIdQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useBulkCreateSchedulesMutation,
  useLazyCheckScheduleConflictsQuery,
  useCheckScheduleConflictsQuery,
  useGetTodayRosterQuery,
  useGetEmployeeSchedulesQuery,
  useGetSchedulesByDateRangeQuery,
  useLazyGetSchedulesByDateRangeQuery,
} = schedulesApi;
