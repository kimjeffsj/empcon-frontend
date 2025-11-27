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
  Payslip,
  PayslipSummary,
  GetPayslipsParams,
  BulkUploadPayslipFilesResponse,
} from "@empcon/types";
import { baseApi } from "./baseApi";

export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Pay Period Management
    getCurrentPayPeriod: builder.query<GetCurrentPayPeriodResponse, void>({
      query: () => "/payroll/periods/current",
      transformResponse: (response: ApiResponse<GetCurrentPayPeriodResponse>) =>
        response.data!,
      providesTags: [{ type: "Payroll", id: "CURRENT_PERIOD" }],
    }),

    getPayPeriods: builder.query<GetPayPeriodsResponse, GetPayPeriodsParams>({
      query: (params) => ({
        url: "/payroll/periods",
        params,
      }),
      transformResponse: (response: ApiResponse<GetPayPeriodsResponse>) =>
        response.data!,
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
      transformResponse: (response: ApiResponse<EmployeePayrollSummary[]>) =>
        response.data!,
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
      transformResponse: (response: ApiResponse<EmployeePayrollSummary>) =>
        response.data!,
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
    // Note: Payslip generation removed - handled via bulk upload from accountant
    // Workflow: Calculate → Excel → Email → Accountant creates PDFs → Bulk Upload

    /**
     * Get payslips with filtering
     * For employees: automatically filtered to show only their own payslips
     * For managers: can view all payslips
     */
    getPayslips: builder.query<Payslip[], GetPayslipsParams | undefined>({
      query: (params) => ({
        url: "/payroll/payslips",
        params,
      }),
      providesTags: ["Payroll"],
    }),

    /**
     * Get specific employee's payslips
     * Employees can only view their own, managers can view any
     */
    getEmployeePayslips: builder.query<PayslipSummary[], string>({
      query: (employeeId) => `/payroll/employee/${employeeId}/payslips`,
      transformResponse: (response: ApiResponse<PayslipSummary[]>) =>
        response.data || [],
      providesTags: (result, error, employeeId) => [
        { type: "Payroll", id: employeeId },
      ],
    }),

    /**
     * Get single payslip by ID
     */
    getPayslipById: builder.query<Payslip, string>({
      query: (id) => `/payroll/payslips/${id}`,
      providesTags: (result, error, id) => [{ type: "Payroll", id }],
    }),

    /**
     * Download payslip PDF file
     * Employees can only download their own, managers can download any
     * @returns PDF file as Blob
     * Usage: Use useLazyDownloadPayslipQuery for button click triggers
     */
    downloadPayslip: builder.query<Blob, string>({
      query: (id) => ({
        url: `/payroll/payslips/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Reports
    /**
     * Generate Excel payroll report for accountant (Manager only)
     * @returns Excel file as Blob
     */
    generatePayrollReport: builder.mutation<Blob, { payPeriodId: string }>({
      query: ({ payPeriodId }) => ({
        url: "/payroll/reports/generate",
        method: "POST",
        body: { payPeriodId },
        responseHandler: (response) => response.blob(),
      }),
    }),

    /**
     * Bulk upload payslip PDF files (Manager only)
     * @param payPeriodId - Pay period ID
     * @param formData - FormData containing multiple PDF files
     * @returns Upload result with success/failed counts
     */
    bulkUploadPayslips: builder.mutation<
      BulkUploadPayslipFilesResponse,
      { payPeriodId: string; formData: FormData }
    >({
      query: ({ payPeriodId, formData }) => ({
        url: `/payroll/periods/${payPeriodId}/upload-bulk`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: ApiResponse<BulkUploadPayslipFilesResponse>) =>
        response.data!,
      invalidatesTags: ["Payroll"],
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
    generateCompletedPeriod: builder.mutation<CreatePayPeriodResponse, void>({
      query: () => ({
        url: "/payroll/periods/generate-completed-period",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: ApiResponse<CreatePayPeriodResponse>) =>
        response.data!,
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
          period: "A" | "B";
          description: string;
        };
      },
      void
    >({
      query: () => "/payroll/periods/can-generate",
      transformResponse: (
        response: ApiResponse<{
          canGenerate: boolean;
          reason: string;
          periodInfo?: {
            year: number;
            month: number;
            period: "A" | "B";
            description: string;
          };
        }>
      ) => response.data!,
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
  useGetPayslipsQuery,
  useGetEmployeePayslipsQuery,
  useGetPayslipByIdQuery,
  useLazyDownloadPayslipQuery,

  // Report hooks
  useGeneratePayrollReportMutation,
  useBulkUploadPayslipsMutation,
  useSendPayrollToAccountantMutation,

  // Auto-generation hooks
  useGenerateCompletedPeriodMutation,
  useCanGenerateCompletedPeriodQuery,
} = payrollApi;
