"use client";

import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@empcon/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = ["ADMIN", "MANAGER", "EMPLOYEE"],
  redirectTo = "/login" 
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, hasRole, isLoading, router, redirectTo, requiredRoles]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if not authenticated or no required role
  if (!isAuthenticated || (requiredRoles.length > 0 && !hasRole(requiredRoles))) {
    return null;
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      {children}
    </ProtectedRoute>
  );
}

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "MANAGER"]}>
      {children}
    </ProtectedRoute>
  );
}

export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "MANAGER", "EMPLOYEE"]}>
      {children}
    </ProtectedRoute>
  );
}