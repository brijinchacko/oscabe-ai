"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/shared/logo";
import { Menu, X, LogOut, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface PortalShellProps {
  children: React.ReactNode;
  portalName: string;
  accentColor: string;
  navItems: NavItem[];
}

export function PortalShell({
  children,
  portalName,
  accentColor,
  navItems,
}: PortalShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  function isActive(href: string) {
    const portalRoot = navItems[0]?.href;
    if (href === portalRoot) return pathname === portalRoot;
    return pathname.startsWith(href);
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#0a0a2e] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-5">
        <Logo variant="light" size="sm" linkTo="/dashboard" />
      </div>

      {/* Portal name badge */}
      <div className="px-5 pb-4">
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          {portalName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
              style={active ? { borderLeft: `3px solid ${accentColor}` } : {}}
            >
              <Icon
                className="size-5 shrink-0"
                style={active ? { color: accentColor } : {}}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/10 p-4">
        {user && (
          <div className="mb-3 flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="size-9 rounded-full"
              />
            ) : (
              <div
                className="flex size-9 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {user.name?.[0] ?? "U"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name || "User"}
              </p>
              <p className="truncate text-xs text-gray-400">
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#02012B]">
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

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.08] bg-white/[0.02] px-4 sm:px-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-gray-400 hover:text-white lg:hidden"
          >
            <Menu className="size-5" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <button className="relative rounded-md p-1.5 text-gray-400 hover:text-white">
            <Bell className="size-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
