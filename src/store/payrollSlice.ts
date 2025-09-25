import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PayPeriod, PayPeriodStatus } from "@empcon/types";

interface PayrollState {
  // Current pay period selection
  selectedPayPeriodId: string | null;
  selectedYear: number;
  selectedMonth: number;
  selectedPeriod: "A" | "B";

  // UI state
  isCalculating: boolean;
  isSendingToAccountant: boolean;
  isGeneratingReport: boolean;

  // Filters and preferences
  filters: {
    employeeSearch: string;
    statusFilter: PayPeriodStatus | "ALL";
    showAnomaliesOnly: boolean;
  };

  // Dashboard state
  showEmployeeDetails: boolean;
  expandedEmployeeIds: string[];

  // Last updated timestamps for data freshness
  lastCalculationTime: string | null;
  lastReportGenerationTime: string | null;
}

const currentDate = new Date();
const initialState: PayrollState = {
  selectedPayPeriodId: null,
  selectedYear: currentDate.getFullYear(),
  selectedMonth: currentDate.getMonth() + 1, // JS months are 0-indexed
  selectedPeriod: currentDate.getDate() <= 15 ? "A" : "B",

  isCalculating: false,
  isSendingToAccountant: false,
  isGeneratingReport: false,

  filters: {
    employeeSearch: "",
    statusFilter: "ALL",
    showAnomaliesOnly: false,
  },

  showEmployeeDetails: false,
  expandedEmployeeIds: [],

  lastCalculationTime: null,
  lastReportGenerationTime: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    // Pay period selection
    setSelectedPayPeriod: (state, action: PayloadAction<{
      payPeriodId: string;
      year: number;
      month: number;
      period: "A" | "B";
    }>) => {
      state.selectedPayPeriodId = action.payload.payPeriodId;
      state.selectedYear = action.payload.year;
      state.selectedMonth = action.payload.month;
      state.selectedPeriod = action.payload.period;
    },

    setSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
      // Reset pay period selection when year changes
      state.selectedPayPeriodId = null;
    },

    setSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
      // Reset pay period selection when month changes
      state.selectedPayPeriodId = null;
    },

    setSelectedPeriod: (state, action: PayloadAction<"A" | "B">) => {
      state.selectedPeriod = action.payload;
      // Reset pay period selection when period changes
      state.selectedPayPeriodId = null;
    },

    // Loading states
    setCalculating: (state, action: PayloadAction<boolean>) => {
      state.isCalculating = action.payload;
      if (action.payload) {
        state.lastCalculationTime = new Date().toISOString();
      }
    },

    setSendingToAccountant: (state, action: PayloadAction<boolean>) => {
      state.isSendingToAccountant = action.payload;
    },

    setGeneratingReport: (state, action: PayloadAction<boolean>) => {
      state.isGeneratingReport = action.payload;
      if (action.payload) {
        state.lastReportGenerationTime = new Date().toISOString();
      }
    },

    // Filters
    setEmployeeSearch: (state, action: PayloadAction<string>) => {
      state.filters.employeeSearch = action.payload;
    },

    setStatusFilter: (state, action: PayloadAction<PayPeriodStatus | "ALL">) => {
      state.filters.statusFilter = action.payload;
    },

    toggleAnomaliesFilter: (state) => {
      state.filters.showAnomaliesOnly = !state.filters.showAnomaliesOnly;
    },

    clearFilters: (state) => {
      state.filters = {
        employeeSearch: "",
        statusFilter: "ALL",
        showAnomaliesOnly: false,
      };
    },

    // UI state
    toggleEmployeeDetails: (state) => {
      state.showEmployeeDetails = !state.showEmployeeDetails;
    },

    expandEmployee: (state, action: PayloadAction<string>) => {
      if (!state.expandedEmployeeIds.includes(action.payload)) {
        state.expandedEmployeeIds.push(action.payload);
      }
    },

    collapseEmployee: (state, action: PayloadAction<string>) => {
      state.expandedEmployeeIds = state.expandedEmployeeIds.filter(
        (id) => id !== action.payload
      );
    },

    toggleEmployeeExpansion: (state, action: PayloadAction<string>) => {
      const employeeId = action.payload;
      if (state.expandedEmployeeIds.includes(employeeId)) {
        state.expandedEmployeeIds = state.expandedEmployeeIds.filter(
          (id) => id !== employeeId
        );
      } else {
        state.expandedEmployeeIds.push(employeeId);
      }
    },

    collapseAllEmployees: (state) => {
      state.expandedEmployeeIds = [];
    },

    expandAllEmployees: (state, action: PayloadAction<string[]>) => {
      state.expandedEmployeeIds = action.payload;
    },

    // Reset state
    resetPayrollState: () => initialState,

    // Quick navigation helpers
    navigateToCurrentPeriod: (state) => {
      const currentDate = new Date();
      state.selectedYear = currentDate.getFullYear();
      state.selectedMonth = currentDate.getMonth() + 1;
      state.selectedPeriod = currentDate.getDate() <= 15 ? "A" : "B";
      state.selectedPayPeriodId = null;
    },

    navigateToPreviousPeriod: (state) => {
      if (state.selectedPeriod === "B") {
        state.selectedPeriod = "A";
      } else {
        state.selectedPeriod = "B";
        state.selectedMonth -= 1;
        if (state.selectedMonth < 1) {
          state.selectedMonth = 12;
          state.selectedYear -= 1;
        }
      }
      state.selectedPayPeriodId = null;
    },

    navigateToNextPeriod: (state) => {
      if (state.selectedPeriod === "A") {
        state.selectedPeriod = "B";
      } else {
        state.selectedPeriod = "A";
        state.selectedMonth += 1;
        if (state.selectedMonth > 12) {
          state.selectedMonth = 1;
          state.selectedYear += 1;
        }
      }
      state.selectedPayPeriodId = null;
    },
  },
});

export const {
  // Pay period selection actions
  setSelectedPayPeriod,
  setSelectedYear,
  setSelectedMonth,
  setSelectedPeriod,

  // Loading state actions
  setCalculating,
  setSendingToAccountant,
  setGeneratingReport,

  // Filter actions
  setEmployeeSearch,
  setStatusFilter,
  toggleAnomaliesFilter,
  clearFilters,

  // UI state actions
  toggleEmployeeDetails,
  expandEmployee,
  collapseEmployee,
  toggleEmployeeExpansion,
  collapseAllEmployees,
  expandAllEmployees,

  // Navigation actions
  resetPayrollState,
  navigateToCurrentPeriod,
  navigateToPreviousPeriod,
  navigateToNextPeriod,
} = payrollSlice.actions;

export default payrollSlice.reducer;