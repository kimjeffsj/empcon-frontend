"use client";

import { RootState } from "@/store";
import { useLogoutMutation } from "@/store/api/authApi";
import { logout } from "@/store/authSlice";
import { stat } from "fs";
import {
  BarChart3,
  Building,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../ui/button";

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

export const Sidebar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [logoutMutation] = useLogoutMutation();

  if (!user) return null;

  const menuItems =
    user.role === "ADMIN" ? ADMIN_MENU_ITEMS : EMPLOYEE_MENU_ITEMS;
  const isAdmin = user.role === "ADMIN" || "MANGER";

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error("Logout failed: ", error);
    } finally {
      dispatch(logout());
      router.push("/login");
    }
  };

  return (
    <div className="bg-card text-card-foreground w-64 space-y-6 py-7 px-2 border-r">
      {/* Header */}
      <div className="px-4">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Building className="h-6 w-6" />
          ) : (
            <User className="h-6 w-6" />
          )}
          <div>
            <h2 className="text-lg font-semibold">
              EMS {isAdmin ? "Admin" : "Employee"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {user.firstName} {user.lastName}
            </p>
            {!isAdmin && user.department && (
              <p className="text-xs text-muted-foreground">{user.department}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => router.push(item.href)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pt-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};
