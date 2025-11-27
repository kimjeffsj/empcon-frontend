import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import {
  setTokenRefreshing,
  tokenRefreshSuccess,
  tokenRefreshFailed,
} from "@/store/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  credentials: "include", // Enable cookie sending
});

const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let adjustedArgs = args;

  if (typeof args === "object" && args !== null && !(args instanceof Array)) {
    const fetchArgs = { ...args } as FetchArgs;
    const body = (fetchArgs as FetchArgs).body;

    if (body instanceof FormData) {
      if (fetchArgs.headers) {
        const headers = new Headers(fetchArgs.headers as HeadersInit);
        headers.delete("content-type");
        fetchArgs.headers = headers;
      }
    } else if (
      body !== undefined &&
      body !== null &&
      typeof body !== "string" &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams)
    ) {
      const headers = new Headers(
        (fetchArgs.headers as HeadersInit) ?? undefined
      );
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json");
      }
      fetchArgs.headers = headers;
    }

    adjustedArgs = fetchArgs;
  }

  return rawBaseQuery(adjustedArgs, api, extraOptions);
};

// Custom baseQuery with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Try the original request
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error and we're not already refreshing tokens
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;

    // Avoid multiple simultaneous refresh attempts
    if (state.auth.isRefreshing) {
      // If already refreshing, wait and retry the original request
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return await baseQuery(args, api, extraOptions);
    }

    // Mark as refreshing
    api.dispatch(setTokenRefreshing(true));

    try {
      // Attempt to refresh the token
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
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
        // Token refresh failed - preserve user data but clear auth
        api.dispatch(tokenRefreshFailed());

        // Only redirect to login if not on login page
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
      }
    } catch (error) {
      // Token refresh failed - preserve user data but clear auth
      console.warn("Token refresh failed:", error);
      api.dispatch(tokenRefreshFailed());

      // Only redirect to login if not on login page
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
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
