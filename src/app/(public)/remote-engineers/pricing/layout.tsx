import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remote Engineer Pricing | OSCABE",
  description:
    "Transparent pricing for remote automation and AI engineers from India. Save 31-47% vs UK salary costs. Monthly billing, no lock-in.",
  keywords: [
    "remote engineer pricing",
    "offshore automation engineer cost",
    "remote PLC engineer India",
    "remote AI engineer cost",
    "engineering outsourcing pricing",
  ],
  alternates: {
    canonical: "https://oscabe.com/remote-engineers/pricing",
  },
  openGraph: {
    title: "Remote Engineer Pricing | OSCABE",
    description:
      "Transparent pricing for remote automation and AI engineers from India. Save 31-47% vs UK salary costs.",
    url: "https://oscabe.com/remote-engineers/pricing",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function RemotePricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
