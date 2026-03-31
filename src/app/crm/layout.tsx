"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CRMAuthGuard } from "@/components/crm/crm-auth-guard";
import { AttendanceHeader } from "@/components/crm/attendance-header";
import { AttendanceHeartbeat } from "@/components/crm/attendance-heartbeat";
import { NotificationBell } from "@/components/crm/notification-bell";
import {
  LayoutDashboard,
  Inbox,
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
  RefreshCw,
  Upload,
  FileText,
  FileSignature,
  Contact,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", href: "/crm", icon: LayoutDashboard },
      { label: "Leads", href: "/crm/leads", icon: Inbox },
    ],
  },
  {
    label: "RECRUITMENT",
    items: [
      { label: "Clients", href: "/crm/clients", icon: Building2 },
      { label: "Candidates", href: "/crm/candidates", icon: Users },
      { label: "Jobs", href: "/crm/jobs", icon: Briefcase },
      { label: "Interviews", href: "/crm/interviews", icon: CalendarCheck },
      { label: "Placements", href: "/crm/placements", icon: Award },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { label: "Emails", href: "/crm/emails", icon: Mail },
      { label: "Outreach", href: "/crm/outreach", icon: Megaphone },
    ],
  },
  {
    label: "DOCUMENTS",
    items: [
      { label: "Documents", href: "/crm/documents", icon: FileText },
      { label: "Contracts", href: "/crm/contracts", icon: FileSignature },
    ],
  },
  {
    label: "DATA",
    items: [
      { label: "Import", href: "/crm/import", icon: Upload },
      { label: "Zoho Sync", href: "/crm/zoho-sync", icon: RefreshCw },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { label: "Reports", href: "/crm/reports", icon: BarChart3 },
      { label: "Compliance", href: "/crm/compliance", icon: Shield },
    ],
  },
  {
    label: "TEAM",
    items: [
      { label: "Attendance", href: "/crm/attendance", icon: Clock },
      { label: "Referrals", href: "/crm/referrals", icon: Gift },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Settings", href: "/crm/settings", icon: Settings },
      { label: "Admin", href: "/crm/admin", icon: ShieldCheck },
    ],
  },
];

interface SearchResults {
  candidates: { id: string; name: string; email: string; headline: string | null }[];
  clients: { id: string; companyName: string; industry: string | null }[];
  jobs: { id: string; title: string; location: string | null; status: string }[];
  contacts: { id: string; name: string; email: string | null; company: string | null }[];
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
        if (res.ok) {
          const data: SearchResults = await res.json();
          setSearchResults(data);
          setSearchOpen(true);
        }
      } catch {
        // silently fail
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
    }
  }, []);

  const hasResults = searchResults && (
    searchResults.candidates.length > 0 ||
    searchResults.clients.length > 0 ||
    searchResults.jobs.length > 0 ||
    searchResults.contacts.length > 0
  );

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
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.label}>
            {groupIdx > 0 && (
              <div className="mx-2 my-2 border-t border-white/10" />
            )}
            <p className="mb-1 px-3 pt-1 text-[10px] font-semibold tracking-widest text-gray-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
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
            </div>
          </div>
        ))}
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
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400 z-10" />
            <Input
              placeholder="Search candidates, clients, jobs..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults) setSearchOpen(true); }}
              onKeyDown={handleSearchKeyDown}
            />
            {searchOpen && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {searchLoading && (
                  <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
                )}
                {!searchLoading && !hasResults && (
                  <div className="px-4 py-3 text-sm text-gray-400">No results found</div>
                )}
                {!searchLoading && hasResults && (
                  <>
                    {searchResults!.candidates.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          <Users className="size-3.5" />
                          Candidates
                        </div>
                        {searchResults!.candidates.map((c) => (
                          <Link
                            key={c.id}
                            href={`/crm/candidates/${c.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex flex-col px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                            <span className="text-xs text-gray-500">{c.headline || c.email}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults!.clients.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          <Building2 className="size-3.5" />
                          Clients
                        </div>
                        {searchResults!.clients.map((c) => (
                          <Link
                            key={c.id}
                            href={`/crm/clients/${c.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex flex-col px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">{c.companyName}</span>
                            <span className="text-xs text-gray-500">{c.industry || "No industry"}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults!.jobs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          <Briefcase className="size-3.5" />
                          Jobs
                        </div>
                        {searchResults!.jobs.map((j) => (
                          <Link
                            key={j.id}
                            href={`/crm/jobs/${j.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex flex-col px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">{j.title}</span>
                            <span className="text-xs text-gray-500">{j.location || j.status}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults!.contacts.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                          <Contact className="size-3.5" />
                          Contacts
                        </div>
                        {searchResults!.contacts.map((c) => (
                          <Link
                            key={c.id}
                            href={`/crm/contacts/${c.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex flex-col px-3 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-sm font-medium text-gray-900">{c.name}</span>
                            <span className="text-xs text-gray-500">{c.company || c.email || "Contact"}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
          <NotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <CRMAuthGuard>{children}</CRMAuthGuard>
        </main>
      </div>
    </div>
  );
}
