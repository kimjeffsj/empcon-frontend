import {
  ApiResponse,
  CreatePositionRequest,
  UpdatePositionRequest,
  PositionResponse
} from "@empcon/types";
import { baseApi } from "./baseApi";

export const positionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/positions - 모든 포지션 조회
    getPositions: builder.query<PositionResponse[], { departmentId?: string }>({
      query: (params = {}) => ({
        url: "/positions",
        params: params.departmentId ? { departmentId: params.departmentId } : undefined,
      }),
      transformResponse: (response: ApiResponse<PositionResponse[]>) =>
        response.data!,
      providesTags: ["Position"],
    }),

    // GET /api/positions/:id - 특정 포지션 조회
    getPositionById: builder.query<PositionResponse, string>({
      query: (id) => `/positions/${id}`,
      transformResponse: (response: ApiResponse<PositionResponse>) =>
        response.data!,
      providesTags: (result, error, id) => [{ type: "Position", id }],
    }),

    // POST /api/positions - 포지션 생성
    createPosition: builder.mutation<PositionResponse, CreatePositionRequest>({
      query: (positionData) => ({
        url: "/positions",
        method: "POST",
        body: positionData,
      }),
      transformResponse: (response: ApiResponse<PositionResponse>) =>
        response.data!,
      invalidatesTags: ["Position"],
    }),

    // PUT /api/positions/:id - 포지션 수정
    updatePosition: builder.mutation<
      PositionResponse,
      { id: string; data: UpdatePositionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/positions/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<PositionResponse>) =>
        response.data!,
      invalidatesTags: (result, error, { id }) => [
        "Position",
        { type: "Position", id },
      ],
    }),

    // DELETE /api/positions/:id - 포지션 삭제
    deletePosition: builder.mutation<void, string>({
      query: (id) => ({
        url: `/positions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Position"],
    }),
  }),
});

export const {
  useGetPositionsQuery,
  useGetPositionByIdQuery,
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} = positionsApi;