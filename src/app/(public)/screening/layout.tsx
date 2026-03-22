import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technical Screening Service | Automation Engineer Assessment | OSCABE",
  description:
    "Chartered Engineer-led technical screening from £150. Assess PLC, SCADA, controls candidates on 20+ platforms. 48-hour reports.",
};

export default function ScreeningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
