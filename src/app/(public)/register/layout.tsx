import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register as Automation or AI Engineer | OSCABE Talent Pool",
  description:
    "Join OSCABE's verified talent pool. Upload your CV, get skill-verified, and access premium PLC, SCADA, Robotics, ML, and AI engineering roles across the UK.",
  alternates: {
    canonical: "https://oscabe.com/register",
  },
  openGraph: {
    title: "Register as Automation or AI Engineer | OSCABE Talent Pool",
    description:
      "Join OSCABE's verified talent pool. Upload your CV, get skill-verified, and access premium PLC, SCADA, Robotics, ML, and AI engineering roles across the UK.",
    url: "https://oscabe.com/register",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
