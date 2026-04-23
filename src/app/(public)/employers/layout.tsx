import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Automation & AI Engineers | OSCABE Recruitment",
  description:
    "Hire pre-screened PLC, SCADA, Robotics, and AI engineers in 72 hours. Engineer-verified candidates. No upfront fees.",
  keywords: [
    "hire automation engineers UK",
    "hire PLC engineers",
    "hire SCADA engineers",
    "hire AI engineers UK",
    "automation recruitment agency",
    "robotics recruitment UK",
    "machine learning recruitment",
  ],
  alternates: {
    canonical: "https://oscabe.com/employers",
  },
  openGraph: {
    title: "Hire Automation & AI Engineers | OSCABE Recruitment",
    description:
      "Hire pre-screened PLC, SCADA, Robotics, and AI engineers in 72 hours. Engineer-verified candidates. No upfront fees.",
    url: "https://oscabe.com/employers",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function EmployersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
