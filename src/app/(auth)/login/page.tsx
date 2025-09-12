"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useLoginMutation } from "@/store/api/authApi";
import { setCredentials } from "@/store/authSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  // Demo user data for portfolio
  // const demoUsers = [
  //   {
  //     id: '1',
  //     name: 'Admin Manager',
  //     email: 'admin@company.com',
  //     role: 'ADMIN' as const,
  //     password: 'admin123'
  //   },
  //   {
  //     id: '2',
  //     name: 'John Employee',
  //     email: 'employee@company.com',
  //     role: 'EMPLOYEE' as const,
  //     department: 'Development',
  //     position: 'Software Engineer',
  //     password: 'emp123'
  //   }
  // ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
        })
      );

      // Redirect based on role
      if (result.user.role === "ADMIN" || result.user.role === "MANAGER") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password.");
    }
  };

  // Demo for portfolio
  // const handleDemoLogin = (userType: 'admin' | 'employee') => {
  //   const user = demoUsers.find(u => u.role.toLowerCase() === userType.toLowerCase())
  //   if (user) {
  //     setEmail(user.email)
  //     setPassword(user.password)
  //     // Auto-submit the form
  //     handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle>Employee Management System</CardTitle>
          <CardDescription>
            Sign in to your account to access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                {/* <span className="bg-background px-2 text-muted-foreground">
                  Demo Login
                </span> */}
                <span className="bg-background px-2 text-muted-foreground">
                  Can&apos;t access?
                </span>
              </div>
            </div>
            {/* Demo Login function for portfolio */}
            {/* <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('admin')}
                className="text-xs"
              >
                Login as Admin
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleDemoLogin('employee')}
                className="text-xs"
              >
                Login as Employee
              </Button>
            </div> */}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Contact manager for access</p>
            <p>Cell: 778-862-5460</p>
            <p>Email: kklkgb@gmail.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
