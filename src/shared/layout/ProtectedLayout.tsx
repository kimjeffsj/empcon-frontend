"use client";

import { RootState } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useGetProfileQuery } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";
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

  // Try to restore authentication state from cookies
  const {
    data: profileData,
    isSuccess,
    isError,
    isLoading: isProfileLoading,
    isFetching,
  } = useGetProfileQuery(undefined, {
    // Skip if already authenticated or on login page
    skip: isAuthenticated || pathname === "/login",
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
        const currentAuth = (window as any).store?.getState?.()?.auth
          ?.isAuthenticated;
        if (!currentAuth) {
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
  ]);

  // If on login page, don't show AppLayout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading while checking authentication
  if ((isProfileLoading || isFetching) && !isAuthenticated) {
    return <LoadingIndicator />;
  }

  // If authenticated, show AppLayout
  if (isAuthenticated && user) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Show loading for any other transitional states
  return <LoadingIndicator />;
};
