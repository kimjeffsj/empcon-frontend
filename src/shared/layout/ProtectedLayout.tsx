"use client";

import { RootState } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetProfileQuery } from "@/store/api/authApi";
import { setCredentials, clearUserData } from "@/store/authSlice";
import { AppLayout } from "./AppLayout";
import { LoadingIndicator } from "../components/Loading";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user data is complete (has essential fields)
  const isUserDataComplete = Boolean(
    user && user.id && user.email && user.role
  );

  // Try to restore authentication state from cookies
  const {
    data: profileData,
    isSuccess,
    isError,
    isLoading: isProfileLoading,
    isFetching,
  } = useGetProfileQuery(undefined, {
    // Skip if on login page OR if authenticated with complete user data
    skip: pathname === "/login" || (isAuthenticated && isUserDataComplete),
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
  });

  // Restore Redux state when profile data is received
  useEffect(() => {
    if (isSuccess && profileData) {
      dispatch(setCredentials({ user: profileData }));
    }
  }, [isSuccess, profileData, dispatch]);

  // Handle authentication redirects with improved logic
  useEffect(() => {
    // Don't redirect while profile is loading or fetching
    if (isProfileLoading || isFetching) return;

    // Don't redirect on login page
    if (pathname === "/login") return;

    // Only redirect to login if:
    // 1. Not authenticated AND
    // 2. Profile query has completed (not loading) AND
    // 3. Profile query failed (isError) AND
    // 4. We've waited long enough for any potential auth restoration
    if (!isAuthenticated && !isProfileLoading && !isFetching && isError) {
      const timer = setTimeout(() => {
        // Double-check auth state hasn't changed during timeout
        const currentAuth = (
          window as unknown as { store?: { getState: () => RootState } }
        ).store?.getState?.()?.auth?.isAuthenticated;
        if (!currentAuth) {
          // Clear any remaining user data before redirect
          dispatch(clearUserData());
          router.push("/login");
        }
      }, 200); // Small delay to ensure auth state is properly restored

      return () => clearTimeout(timer);
    }
  }, [
    isAuthenticated,
    pathname,
    router,
    isError,
    isProfileLoading,
    isFetching,
    dispatch,
  ]);

  // If on login page, don't show AppLayout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading while checking authentication or fetching profile data
  if (isProfileLoading || isFetching) {
    return <LoadingIndicator />;
  }

  // Show loading if authenticated but user data is incomplete (waiting for profile fetch)
  if (isAuthenticated && !isUserDataComplete) {
    return <LoadingIndicator />;
  }

  // If authenticated with complete user data, show AppLayout
  if (isAuthenticated && isUserDataComplete) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Show loading for any other transitional states
  return <LoadingIndicator />;
};
