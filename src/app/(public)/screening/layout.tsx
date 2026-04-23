import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Screening for Automation & AI Engineers | OSCABE",
  description:
    "Engineer-led technical screening from £150. Assess PLC, SCADA, Robotics, ML, and AI candidates on 20+ platforms. 48-hour reports.",
  alternates: {
    canonical: "https://oscabe.com/screening",
  },
  openGraph: {
    title: "Technical Screening for Automation & AI Engineers | OSCABE",
    description:
      "Engineer-led technical screening from £150. Assess PLC, SCADA, Robotics, ML, and AI candidates on 20+ platforms. 48-hour reports.",
    url: "https://oscabe.com/screening",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
