"use client";

import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  LayoutDashboard,
  Users,
  Building,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import { RootState } from "@/store";
import { useLogoutMutation } from "@/store/api/authApi";
import { logout } from "@/store/authSlice";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

const ADMIN_MENU_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/employees", label: "Employees", icon: Users },
  {
    href: "/admin/departments",
    label: "Departments & Positions",
    icon: Building,
  },
  { href: "/admin/schedules", label: "Schedules", icon: Calendar },
  { href: "/admin/timeclocks", label: "Time Clocks", icon: Clock },
  { href: "/admin/leaves", label: "Leaves", icon: FileText },
  { href: "/admin/payroll", label: "Payroll", icon: DollarSign },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const EMPLOYEE_MENU_ITEMS = [
  { href: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employee/schedule", label: "My Schedule", icon: Calendar },
  { href: "/employee/timeclock", label: "Time Clock", icon: Clock },
  { href: "/employee/leaves", label: "Leave Requests", icon: FileText },
  { href: "/employee/payroll", label: "Payroll", icon: DollarSign },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  if (!user) return <>{children}</>;

  const menuItems =
    user.role === "ADMIN" || user.role === "MANAGER"
      ? ADMIN_MENU_ITEMS
      : EMPLOYEE_MENU_ITEMS;
  const isAdmin = user.role === "ADMIN" || user.role === "MANAGER";

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      alert("Logout failed");
      console.error("Logout failed:", error);
    } finally {
      dispatch(logout());
      router.push("/login");
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Building className="h-6 w-6" />
              ) : (
                <User className="h-6 w-6" />
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  EmpCon {isAdmin ? "Admin" : "Employee"}
                </h2>
                <p className="text-xs text-sidebar-foreground/70">
                  {user.firstName} {user.lastName}
                </p>
                {!isAdmin && user.department && (
                  <p className="text-xs text-sidebar-foreground/50">
                    {user.department}
                  </p>
                )}
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton onClick={() => router.push(item.href)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
