import {
  ApiResponse,
  CreateEmployeeRequest,
  EmployeeListRequest,
  EmployeeListResponse,
  EmployeeResponse,
  UpdateEmployeeRequest,
} from "@empcon/types";
import { baseApi } from "./baseApi";

export const employeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/employees - 직원 목록 조회 (검색, 필터링, 페이지네이션)
    getEmployees: builder.query<
      EmployeeListResponse,
      Partial<EmployeeListRequest>
    >({
      query: (params = {}) => ({
        url: "/employees",
        params: {
          page: params.page || 1,
          limit: params.limit || 100,
          ...params,
        },
      }),
      transformResponse: (response: EmployeeListResponse) => response,
      providesTags: ["Employee"],
    }),

    // GET /api/employees/:id - 특정 직원 조회
    getEmployeeById: builder.query<EmployeeResponse, string>({
      query: (id) => `/employees/${id}`,
      transformResponse: (response: ApiResponse<EmployeeResponse>) =>
        response.data!,
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),

    // POST /api/employees - 직원 생성
    createEmployee: builder.mutation<EmployeeResponse, CreateEmployeeRequest>({
      query: (employeeData) => ({
        url: "/employees",
        method: "POST",
        body: employeeData,
      }),
      transformResponse: (response: ApiResponse<EmployeeResponse>) =>
        response.data!,
      invalidatesTags: ["Employee"],
    }),

    // PUT /api/employees/:id - 직원 수정
    updateEmployee: builder.mutation<
      EmployeeResponse,
      { id: string; data: UpdateEmployeeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/employees/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<EmployeeResponse>) =>
        response.data!,
      invalidatesTags: (result, error, { id }) => [
        "Employee",
        { type: "Employee", id },
      ],
    }),

    // DELETE /api/employees/:id - 직원 삭제 (소프트 삭제)
    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employee"],
    }),

    // GET /api/employees/validate/email - 이메일 중복 검증
    validateEmail: builder.query<{ available: boolean; message: string }, string>({
      query: (email) => `/employees/validate/email?email=${encodeURIComponent(email)}`,
      transformResponse: (response: { success: boolean; data: { available: boolean; message: string } }) => response.data,
    }),

    // GET /api/employees/validate/employee-number - 직원번호 중복 검증
    validateEmployeeNumber: builder.query<{ available: boolean; message: string }, string>({
      query: (number) => `/employees/validate/employee-number?number=${encodeURIComponent(number)}`,
      transformResponse: (response: { success: boolean; data: { available: boolean; message: string } }) => response.data,
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useLazyValidateEmailQuery,
  useLazyValidateEmployeeNumberQuery,
} = employeesApi;
