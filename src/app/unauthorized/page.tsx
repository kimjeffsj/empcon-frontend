"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    if (user) {
      // Redirect to unified dashboard
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-destructive">
            Access Denied
          </CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {user ? (
              <>
                Logged in as: <strong>{user.email}</strong> ({user.role})
              </>
            ) : (
              "Please log in to continue."
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleGoBack} variant="outline">
              {user ? "Go to Dashboard" : "Go to Login"}
            </Button>
            {user && (
              <Button onClick={handleLogout} variant="ghost">
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}