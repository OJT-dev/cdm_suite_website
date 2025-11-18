
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Zap,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Crown,
  Rocket,
  Users,
  ShoppingBag,
  Search,
  GitBranch,
  FileText,
  ClipboardList,
  FileEdit,
  FileImage,
  User,
  ChevronDown,
  Bot,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTierConfig } from "@/lib/tier-config";
import { AIAssistantButton } from "@/components/assistant/ai-assistant-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  user: any;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userTier = user?.tier || "free";
  const tierConfig = getTierConfig(userTier);

  const isEmployee = user?.role?.toUpperCase() === "ADMIN" || user?.role?.toUpperCase() === "EMPLOYEE";

  const workManagementNav = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      enabled: true,
      badge: null as string | null,
    },
    {
      name: "Lead CRM",
      href: "/dashboard/crm",
      icon: Users,
      enabled: isEmployee,
      badge: null as string | null,
    },
    {
      name: "Proposals",
      href: "/dashboard/proposals",
      icon: FileText,
      enabled: isEmployee,
      badge: null as string | null,
    },
    {
      name: "Bid Proposals",
      href: "/dashboard/bid-proposals",
      icon: Briefcase,
      enabled: isEmployee,
      badge: null as string | null,
    },
    {
      name: "Sequences",
      href: "/dashboard/crm/sequences",
      icon: GitBranch,
      enabled: isEmployee,
      badge: null as string | null,
    },
    {
      name: "Workflows",
      href: "/dashboard/workflows",
      icon: ClipboardList,
      enabled: true,
      badge: null as string | null,
    },
    {
      name: "Team Workload",
      href: "/dashboard/team",
      icon: Users,
      enabled: isEmployee,
      badge: null as string | null,
    },
    {
      name: "Website Audits",
      href: "/dashboard/audits",
      icon: Search,
      enabled: true,
      badge: null as string | null,
    },
    {
      name: "Page Builder",
      href: "/dashboard/pages",
      icon: FileEdit,
      enabled: user?.role === 'admin',
      badge: null as string | null,
    },
    {
      name: "Content Manager",
      href: "/dashboard/content/case-studies",
      icon: FileImage,
      enabled: isEmployee,
      badge: null as string | null,
    },
  ];

  const serviceFulfillmentNav = [
    {
      name: "My Services",
      href: "/dashboard/my-services",
      icon: ShoppingBag,
      enabled: !isEmployee, // Only show for clients
      badge: null,
    },
    {
      name: "Self-Service Tools",
      href: "/dashboard/self-service",
      icon: Zap,
      enabled: !isEmployee, // Only show for clients
      badge: null,
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
      enabled: userTier !== "free",
      badge: userTier === "free" ? "Upgrade" : null,
    },
    {
      name: "Services",
      href: "/dashboard/services",
      icon: ShoppingBag,
      enabled: isEmployee, // Only show for employees
      badge: null,
    },
    {
      name: "AI Website Builder",
      href: "/dashboard/builder",
      icon: Zap,
      enabled: tierConfig.limits.builderAccess,
      badge: !tierConfig.limits.builderAccess ? "Upgrade" : null,
    },
    {
      name: "AI Agent Builder",
      href: "/dashboard/ai-agents",
      icon: Bot,
      enabled: tierConfig.limits.builderAccess,
      badge: !tierConfig.limits.builderAccess ? "Upgrade" : null,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      enabled: tierConfig.limits.analyticsAccess,
      badge: !tierConfig.limits.analyticsAccess ? "Upgrade" : null,
    },
  ];

  const accountNav = [
    {
      name: "Affiliate",
      href: "/dashboard/affiliate",
      icon: Users,
      enabled: true,
      badge: null as string | null,
    },
    {
      name: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
      enabled: true,
      badge: null as string | null,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      enabled: true,
      badge: null as string | null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
              <span className="font-bold text-xl">CDM Suite</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tier badge */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={cn(
                  "px-3 py-1 rounded-full font-medium flex items-center gap-1",
                  userTier === "free" && "bg-gray-100 text-gray-700",
                  userTier === "starter" && "bg-blue-100 text-blue-700",
                  (userTier === "growth" ||
                    userTier === "pro" ||
                    userTier === "enterprise") &&
                    "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                )}
              >
                {(userTier === "pro" || userTier === "enterprise") && (
                  <Crown className="w-3 h-3" />
                )}
                {tierConfig.name}
              </div>
            </div>
            {userTier === "free" && (
              <Button
                size="sm"
                className="w-full mt-3"
                asChild
              >
                <Link href="/dashboard/billing">
                  <Rocket className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Link>
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
            {/* Work Management Section */}
            {isEmployee && (
              <div className="space-y-1">
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Work Management
                  </h3>
                </div>
                {workManagementNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isDisabled = !item.enabled;

                  return (
                    <Link
                      key={item.name}
                      href={isDisabled ? "#" : item.href}
                      onClick={(e) => {
                        if (isDisabled) {
                          e.preventDefault();
                        }
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive && "bg-blue-50 text-blue-700",
                        !isActive && !isDisabled && "text-gray-700 hover:bg-gray-50",
                        isDisabled && "text-gray-400 cursor-not-allowed opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Non-employee navigation (no sections) */}
            {!isEmployee && (
              <div className="space-y-1">
                {workManagementNav
                  .filter((item) => item.enabled)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          isActive && "bg-blue-50 text-blue-700",
                          !isActive && "text-gray-700 hover:bg-gray-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          {item.name}
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}

            {/* Service Fulfillment Section */}
            <div className="space-y-1">
              {isEmployee && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service Fulfillment
                  </h3>
                </div>
              )}
              {serviceFulfillmentNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled = !item.enabled;

                return (
                  <Link
                    key={item.name}
                    href={isDisabled ? "#" : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      }
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive && "bg-blue-50 text-blue-700",
                      !isActive && !isDisabled && "text-gray-700 hover:bg-gray-50",
                      isDisabled && "text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Account Section */}
            <div className="space-y-1">
              {isEmployee && (
                <div className="px-3 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h3>
                </div>
              )}
              {accountNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled = !item.enabled;

                return (
                  <Link
                    key={item.name}
                    href={isDisabled ? "#" : item.href}
                    onClick={(e) => {
                      if (isDisabled) {
                        e.preventDefault();
                      }
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive && "bg-blue-50 text-blue-700",
                      !isActive && !isDisabled && "text-gray-700 hover:bg-gray-50",
                      isDisabled && "text-gray-400 cursor-not-allowed opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Help & Logout */}
          <div className="px-4 py-4 border-t border-gray-200 space-y-1">
            <Link
              href="/contact"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email || ""}</p>
                  </div>
                  <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing" className="cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact" className="cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* AI Assistant */}
      <AIAssistantButton user={user} />
    </div>
  );
}
