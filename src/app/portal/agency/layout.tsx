"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { LayoutDashboard, Briefcase, BadgeCheck, Settings } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/agency", icon: LayoutDashboard },
  { label: "Shared Roles", href: "/portal/agency/roles", icon: Briefcase },
  { label: "Verify", href: "/portal/agency/verify", icon: BadgeCheck },
  { label: "Settings", href: "/portal/agency/settings", icon: Settings },
];

export default function AgencyPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalName="Agency Portal"
      accentColor="#8B5CF6"
      navItems={NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
