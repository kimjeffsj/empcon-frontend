import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5002/api",
  credentials: "include", // Enable cookie sending
  prepareHeaders: (headers) => {
    headers.set("content-type", "application/json");
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "User",
    "Employee",
    "Department",
    "Position",
    "Schedule",
    "TimeEntry",
    "LeaveRequest",
    "Payroll",
    "Notification",
  ],
  endpoints: () => ({}),
});
