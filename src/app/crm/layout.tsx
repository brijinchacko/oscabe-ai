"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CRMAuthGuard } from "@/components/crm/crm-auth-guard";
import { AttendanceHeader } from "@/components/crm/attendance-header";
import { AttendanceHeartbeat } from "@/components/crm/attendance-heartbeat";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  Award,
  Gift,
  Mail,
  Megaphone,
  CalendarCheck,
  BarChart3,
  Shield,
  ShieldCheck,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Plus,
  LogOut,
  Clock,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
  { label: "Clients", href: "/crm/clients", icon: Building2 },
  { label: "Candidates", href: "/crm/candidates", icon: Users },
  { label: "Jobs", href: "/crm/jobs", icon: Briefcase },
  { label: "Interviews", href: "/crm/interviews", icon: CalendarCheck },
  { label: "Placements", href: "/crm/placements", icon: Award },
  { label: "Referrals", href: "/crm/referrals", icon: Gift },
  { label: "Emails", href: "/crm/emails", icon: Mail },
  { label: "Outreach", href: "/crm/outreach", icon: Megaphone },
  { label: "Compliance", href: "/crm/compliance", icon: Shield },
  { label: "Attendance", href: "/crm/attendance", icon: Clock },
  { label: "Reports", href: "/crm/reports", icon: BarChart3 },
  { label: "Settings", href: "/crm/settings", icon: Settings },
  { label: "Admin", href: "/crm/admin", icon: ShieldCheck },
];

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Check if user has an active attendance session for the heartbeat
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/attendance");
        if (res.ok) {
          const data = await res.json();
          setHasActiveSession(
            data.session && data.session.status !== "CHECKED_OUT"
          );
        }
      } catch {
        // silently fail
      }
    }
    checkSession();
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  function isActive(href: string) {
    if (href === "/crm") return pathname === "/crm";
    return pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0f172a] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Logo variant="light" size="sm" linkTo="/crm" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-l-2 border-indigo-400 bg-indigo-500/20 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          {user?.image ? (
            <img src={user.image} alt="" className="size-9 rounded-full" />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
              {user?.name?.[0] || "U"}
            </div>
          )}
          {user && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name || "User"}
              </p>
              <p className="truncate text-xs text-gray-400">
                {user.email}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-2 top-4 rounded-md p-1 text-gray-400 hover:text-white"
        >
          <X className="size-5" />
        </button>
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      {/* Headless heartbeat tracker */}
      <AttendanceHeartbeat hasActiveSession={hasActiveSession} />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Attendance sticky header */}
        <AttendanceHeader />

        {/* Top header bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search candidates, clients, jobs..."
              className="pl-9"
            />
          </div>

          {/* Quick actions - hidden on mobile */}
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Client
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Candidate
            </Button>
            <Button variant="outline" size="sm">
              <Plus className="size-3.5" />
              Job
            </Button>
          </div>

          {/* Notification bell */}
          <button className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
            <Bell className="size-5" />
            <span className="absolute right-1 top-1 size-2 rounded-full bg-indigo-500" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <CRMAuthGuard>{children}</CRMAuthGuard>
        </main>
      </div>
    </div>
  );
}
