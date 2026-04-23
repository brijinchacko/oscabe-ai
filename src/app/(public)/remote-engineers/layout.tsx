import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Automation & AI Engineers | Save 30% | OSCABE",
  description:
    "Hire pre-screened Indian automation and AI engineers who work remotely for UK employers. Chartered Engineer verified. PLC, SCADA, ML, Data Science. 30% salary savings. Minimum 3-month contract.",
  keywords: [
    "remote automation engineers",
    "remote PLC engineers",
    "offshore SCADA engineers UK",
    "remote AI engineers India",
    "save on engineering costs",
  ],
  openGraph: {
    title: "Remote Automation & AI Engineers | Save 30% | OSCABE",
    description:
      "Hire pre-screened Indian automation and AI engineers who work remotely for UK employers. Chartered Engineer verified. 30% salary savings. Minimum 3-month contract.",
    type: "website",
  },
};

export default function RemoteEngineersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
