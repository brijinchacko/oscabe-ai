import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn £200 | Automation Engineer Referral Programme | OSCABE",
  description:
    "Earn £200 for every successful automation engineer placement. Refer PLC, SCADA, controls talent. No limit on referrals.",
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
