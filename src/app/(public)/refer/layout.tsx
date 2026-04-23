import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn £200 | OSCABE Automation & AI Referrals",
  description:
    "Earn £200 for every successful automation or AI engineer placement. Refer PLC, SCADA, Robotics, ML, Computer Vision talent. No limit on referrals.",
  alternates: {
    canonical: "https://oscabe.com/refer",
  },
  openGraph: {
    title: "Refer & Earn £200 | OSCABE Automation & AI Referrals",
    description:
      "Earn £200 for every successful automation or AI engineer placement. Refer PLC, SCADA, Robotics, ML, Computer Vision talent. No limit on referrals.",
    url: "https://oscabe.com/refer",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function ReferLayout({ children }: { children: React.ReactNode }) {
  return children;
}
