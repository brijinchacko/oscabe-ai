"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import {
  LayoutDashboard,
  UserCircle,
  FileText,
  Briefcase,
  Gift,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/candidate", icon: LayoutDashboard },
  { label: "My Profile", href: "/portal/candidate/profile", icon: UserCircle },
  {
    label: "Applications",
    href: "/portal/candidate/applications",
    icon: FileText,
  },
  { label: "Browse Jobs", href: "/portal/candidate/jobs", icon: Briefcase },
  { label: "Referrals", href: "/portal/candidate/referrals", icon: Gift },
  { label: "Settings", href: "/portal/candidate/settings", icon: Settings },
];

export default function CandidatePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalName="Candidate Portal"
      accentColor="#00D4FF"
      navItems={NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
