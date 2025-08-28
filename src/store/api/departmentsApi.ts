import { ApiResponse, CreateDepartmentRequest, UpdateDepartmentRequest } from "@empcon/types";
import { baseApi } from "./baseApi";

// API 문서 기준 Department Response 타입
export interface DepartmentResponse {
  id: string;
  name: string;
  description: string | null;
  managerId: string | null;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/departments - 모든 부서 조회
    getDepartments: builder.query<DepartmentResponse[], void>({
      query: () => "/departments",
      transformResponse: (response: ApiResponse<DepartmentResponse[]>) =>
        response.data!,
      providesTags: ["Department"],
    }),

    // GET /api/departments/:id - 특정 부서 조회
    getDepartmentById: builder.query<DepartmentResponse, string>({
      query: (id) => `/departments/${id}`,
      transformResponse: (response: ApiResponse<DepartmentResponse>) =>
        response.data!,
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),

    // POST /api/departments - 부서 생성
    createDepartment: builder.mutation<DepartmentResponse, CreateDepartmentRequest>({
      query: (departmentData) => ({
        url: "/departments",
        method: "POST",
        body: departmentData,
      }),
      transformResponse: (response: ApiResponse<DepartmentResponse>) =>
        response.data!,
      invalidatesTags: ["Department"],
    }),

    // PUT /api/departments/:id - 부서 수정
    updateDepartment: builder.mutation<
      DepartmentResponse,
      { id: string; data: UpdateDepartmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<DepartmentResponse>) =>
        response.data!,
      invalidatesTags: (result, error, { id }) => [
        "Department",
        { type: "Department", id },
      ],
    }),

    // DELETE /api/departments/:id - 부서 삭제
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi;