"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RootState } from "@/store";

export default function HomePage() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    // Wait a bit to allow ProtectedLayout to restore auth state
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        // Redirect based on user role
        if (user.role === "ADMIN" || user.role === "MANAGER") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/employee/dashboard");
        }
      } else {
        router.replace("/login");
      }
    }, 100); // Small delay to allow auth restoration

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
