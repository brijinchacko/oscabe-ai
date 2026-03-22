"use client";

import { PortalShell } from "@/components/layout/portal-shell";
import { LayoutDashboard, Briefcase, Settings, ShoppingCart, CreditCard, ShieldCheck, Package } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/portal/employer", icon: LayoutDashboard },
  { label: "My Jobs", href: "/portal/employer/jobs", icon: Briefcase },
  { label: "Screening", href: "/portal/employer/screening", icon: ShieldCheck },
  { label: "Candidate Packs", href: "/portal/employer/packs", icon: Package },
  { label: "Orders", href: "/portal/employer/orders", icon: ShoppingCart },
  { label: "Billing", href: "/portal/employer/billing", icon: CreditCard },
  { label: "Settings", href: "/portal/employer/settings", icon: Settings },
];

export default function EmployerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalShell
      portalName="Employer Portal"
      accentColor="#4540DB"
      navItems={NAV_ITEMS}
    >
      {children}
    </PortalShell>
  );
}
