"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCurrentPath } from "@/hooks/use-pathname";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserRole } from "@empcon/types";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: UserRole[];
  badge?: string;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="h-4 w-4" />,
    href: "/dashboard",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"]
  },
  {
    id: "employees",
    label: "Employees",
    icon: <Users className="h-4 w-4" />,
    href: "/employees",
    roles: ["ADMIN", "MANAGER"],
    disabled: true,
    badge: "Phase 2"
  },
  {
    id: "schedules",
    label: "Schedules",
    icon: <Calendar className="h-4 w-4" />,
    href: "/schedules",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    disabled: true,
    badge: "Phase 3"
  },
  {
    id: "time-clock",
    label: "Time Clock",
    icon: <Clock className="h-4 w-4" />,
    href: "/time-clock",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    disabled: true,
    badge: "Phase 4"
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: <DollarSign className="h-4 w-4" />,
    href: "/payroll",
    roles: ["ADMIN"],
    disabled: true,
    badge: "Phase 5"
  },
  {
    id: "leave-requests",
    label: "Leave Requests",
    icon: <FileText className="h-4 w-4" />,
    href: "/leave-requests",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    disabled: true,
    badge: "Phase 6"
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
    href: "/notifications",
    roles: ["ADMIN", "MANAGER", "EMPLOYEE"],
    disabled: true,
    badge: "Phase 7"
  },
  {
    id: "reports",
    label: "Reports",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/reports",
    roles: ["ADMIN", "MANAGER"],
    disabled: true,
    badge: "Phase 8"
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4" />,
    href: "/settings",
    roles: ["ADMIN"],
    disabled: true,
    badge: "Phase 9"
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const currentPath = useCurrentPath();

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleMenuClick = (item: MenuItem) => {
    if (item.disabled) {
      return;
    }
    // Navigation will be implemented when routes are ready
    console.log(`Navigate to ${item.href}`);
  };

  return (
    <Card className={`h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    } ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <span className="font-semibold">EmpCon</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.role}
              </div>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-10 ${
                  isCollapsed ? "px-2" : "px-3"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handleMenuClick(item)}
                disabled={item.disabled}
              >
              <div className="flex items-center gap-3 w-full">
                {item.icon}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            isCollapsed ? "px-2" : "px-3"
          }`}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </Card>
  );
}