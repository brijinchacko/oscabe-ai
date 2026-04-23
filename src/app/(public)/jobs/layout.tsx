import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation & AI Engineer Jobs UK | Browse Roles | OSCABE",
  description:
    "Browse 40+ active automation and AI engineering jobs across the UK. PLC, SCADA, Robotics, ML, Data Science roles. Apply now.",
  keywords: [
    "automation engineer jobs UK",
    "AI engineer jobs",
    "PLC programmer vacancies",
    "SCADA engineer vacancies",
    "robotics jobs UK",
    "machine learning jobs UK",
    "data science jobs",
    "controls engineer vacancies",
  ],
  alternates: {
    canonical: "https://oscabe.com/jobs",
  },
  openGraph: {
    title: "Automation & AI Engineer Jobs UK | Browse Roles | OSCABE",
    description:
      "Browse 40+ active automation and AI engineering jobs across the UK. PLC, SCADA, Robotics, ML, Data Science roles. Apply now.",
    url: "https://oscabe.com/jobs",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
