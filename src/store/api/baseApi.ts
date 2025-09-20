import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import { setTokenRefreshing, tokenRefreshSuccess, tokenRefreshFailed } from "@/store/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5002/api",
  credentials: "include", // Enable cookie sending
  prepareHeaders: (headers) => {
    headers.set("content-type", "application/json");
    return headers;
  },
});

// Custom baseQuery with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  // Try the original request
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error and we're not already refreshing tokens
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;

    // Avoid multiple simultaneous refresh attempts
    if (state.auth.isRefreshing) {
      // If already refreshing, wait and retry the original request
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await baseQuery(args, api, extraOptions);
    }

    // Mark as refreshing
    api.dispatch(setTokenRefreshing(true));

    try {
      // Attempt to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: {},
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Token refresh succeeded
        api.dispatch(tokenRefreshSuccess());

        // Retry the original request with fresh token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Token refresh failed
        api.dispatch(tokenRefreshFailed());

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch {
      // Token refresh failed
      api.dispatch(tokenRefreshFailed());

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Employee",
    "Department",
    "Position",
    "Schedule",
    "TodayRoster",
    "TimeEntry",
    "LeaveRequest",
    "Payroll",
    "Notification",
  ],
  endpoints: () => ({}),
});
