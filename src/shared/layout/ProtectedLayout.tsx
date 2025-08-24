"use client";

import { RootState } from "@/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AppLayout } from "./AppLayout";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, pathname, router]);

  // If on login page, don't show AppLayout
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If authenticated, show AppLayout
  if (isAuthenticated) {
    return <AppLayout>{children}</AppLayout>;
  }

  // Loading state or redirect
  return <div>Loading...</div>;
};
