import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation & AI Engineering Jobs UK | OSCABE Careers",
  description:
    "Find your next role in industrial automation or AI. PLC, SCADA, ML, Computer Vision jobs. Free registration. 6,000+ verified engineers.",
  keywords: [
    "automation engineer jobs UK",
    "PLC programmer jobs",
    "SCADA engineer jobs",
    "AI engineer jobs UK",
    "machine learning jobs",
    "computer vision jobs UK",
    "controls engineer careers",
    "robotics engineer jobs",
  ],
  alternates: {
    canonical: "https://oscabe.com/candidates",
  },
  openGraph: {
    title: "Automation & AI Engineering Jobs UK | OSCABE Careers",
    description:
      "Find your next role in industrial automation or AI. PLC, SCADA, ML, Computer Vision jobs. Free registration. 6,000+ verified engineers.",
    url: "https://oscabe.com/candidates",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function CandidatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
