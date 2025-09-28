import {
  PayPeriod,
  CreatePayPeriodRequest,
  CreatePayPeriodResponse,
  UpdatePayPeriodRequest,
  GetPayPeriodsParams,
  GetPayPeriodsResponse,
  GetCurrentPayPeriodResponse,
  EmployeePayrollSummary,
  PayrollBatchCalculation,
  ApiResponse,
} from "@empcon/types";
import { baseApi } from "./baseApi";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Pay Period Management
    getCurrentPayPeriod: builder.query<GetCurrentPayPeriodResponse, void>({
      query: () => "/payroll/periods/current",
      transformResponse: (response: ApiResponse<GetCurrentPayPeriodResponse>) => response.data!,
      providesTags: [{ type: "Payroll", id: "CURRENT_PERIOD" }],
    }),

    getPayPeriods: builder.query<GetPayPeriodsResponse, GetPayPeriodsParams>({
      query: (params) => ({
        url: "/payroll/periods",
        params,
      }),
      transformResponse: (response: ApiResponse<GetPayPeriodsResponse>) => response.data!,
      providesTags: (result) => [
        ...(result?.data?.map?.(({ id }) => ({
          type: "Payroll" as const,
          id,
        })) || []),
        { type: "Payroll", id: "LIST" },
      ],
    }),

    createPayPeriod: builder.mutation<
      CreatePayPeriodResponse,
      CreatePayPeriodRequest
    >({
      query: (payPeriodData) => ({
        url: "/payroll/periods",
        method: "POST",
        body: payPeriodData,
      }),
      invalidatesTags: [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "CURRENT_PERIOD" },
      ],
    }),

    updatePayPeriod: builder.mutation<
      { payPeriod: PayPeriod; message: string },
      { id: string; data: UpdatePayPeriodRequest }
    >({
      query: ({ id, data }) => ({
        url: `/payroll/periods/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Payroll", id },
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "CURRENT_PERIOD" },
      ],
    }),

    deletePayPeriod: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/payroll/periods/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Payroll", id },
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "CURRENT_PERIOD" },
      ],
    }),

    // Payroll Calculations
    calculatePayrollForPeriod: builder.mutation<
      PayrollBatchCalculation,
      { payPeriodId: string }
    >({
      query: ({ payPeriodId }) => ({
        url: `/payroll/calculate/${payPeriodId}`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: [{ type: "Payroll", id: "CALCULATIONS" }],
    }),

    getPayrollSummary: builder.query<
      EmployeePayrollSummary[],
      { payPeriodId: string }
    >({
      query: ({ payPeriodId }) => `/payroll/periods/${payPeriodId}/summary`,
      transformResponse: (response: ApiResponse<EmployeePayrollSummary[]>) => response.data!,
      providesTags: [{ type: "Payroll", id: "SUMMARY" }],
    }),

    getEmployeePayrollSummary: builder.query<
      EmployeePayrollSummary,
      { employeeId: string; payPeriodId?: string }
    >({
      query: ({ employeeId, payPeriodId }) => ({
        url: `/payroll/employee/${employeeId}/summary`,
        params: payPeriodId ? { payPeriodId } : {},
      }),
      transformResponse: (response: ApiResponse<EmployeePayrollSummary>) => response.data!,
      providesTags: (result, error, { employeeId, payPeriodId }) => [
        {
          type: "Payroll",
          id: payPeriodId
            ? `${payPeriodId}-${employeeId}`
            : `current-${employeeId}`,
        },
      ],
    }),

    // Payslips
    generatePayslip: builder.mutation<
      { message: string; payslipId: string },
      { employeeId: string; payPeriodId: string }
    >({
      query: ({ employeeId, payPeriodId }) => ({
        url: "/payroll/payslips/generate",
        method: "POST",
        body: { employeeId, payPeriodId },
      }),
      invalidatesTags: [{ type: "Payroll", id: "PAYSLIPS" }],
    }),

    // Email Integration
    sendPayrollToAccountant: builder.mutation<
      { message: string },
      { payPeriodId: string; accountantEmail?: string }
    >({
      query: ({ payPeriodId, accountantEmail }) => ({
        url: "/payroll/email/send-to-accountant",
        method: "POST",
        body: { payPeriodId, accountantEmail },
      }),
      invalidatesTags: [{ type: "Payroll", id: "EMAIL_LOGS" }],
    }),

    // Auto-Generation
    generateCompletedPeriod: builder.mutation<
      CreatePayPeriodResponse,
      void
    >({
      query: () => ({
        url: "/payroll/periods/generate-completed-period",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: ApiResponse<CreatePayPeriodResponse>) => response.data!,
      invalidatesTags: [
        { type: "Payroll", id: "LIST" },
        { type: "Payroll", id: "CURRENT_PERIOD" },
      ],
    }),

    canGenerateCompletedPeriod: builder.query<
      {
        canGenerate: boolean;
        reason: string;
        periodInfo?: {
          year: number;
          month: number;
          period: 'A' | 'B';
          description: string;
        };
      },
      void
    >({
      query: () => "/payroll/periods/can-generate",
      transformResponse: (response: ApiResponse<{
        canGenerate: boolean;
        reason: string;
        periodInfo?: {
          year: number;
          month: number;
          period: 'A' | 'B';
          description: string;
        };
      }>) => response.data!,
      providesTags: [{ type: "Payroll", id: "CAN_GENERATE" }],
    }),
  }),
});

export const {
  // Pay Period hooks
  useGetCurrentPayPeriodQuery,
  useGetPayPeriodsQuery,
  useCreatePayPeriodMutation,
  useUpdatePayPeriodMutation,
  useDeletePayPeriodMutation,

  // Calculation hooks
  useCalculatePayrollForPeriodMutation,
  useGetPayrollSummaryQuery,
  useGetEmployeePayrollSummaryQuery,

  // Payslip hooks
  useGeneratePayslipMutation,

  // Report hooks
  useSendPayrollToAccountantMutation,

  // Auto-generation hooks
  useGenerateCompletedPeriodMutation,
  useCanGenerateCompletedPeriodQuery,
} = payrollApi;
