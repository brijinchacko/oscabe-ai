import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Deliver | Remote Engineering Operations | OSCABE",
  description:
    "Our operational model for remote engineers: daily standups, weekly check-ins, fortnightly reviews, monthly business reviews. 30-day replacement guarantee.",
  keywords: [
    "remote engineer delivery model",
    "offshore engineering management",
    "remote team operations",
    "engineering delivery guarantee",
    "Wartens India Bangalore",
  ],
  alternates: {
    canonical: "https://oscabe.com/how-we-deliver",
  },
  openGraph: {
    title: "How We Deliver | Remote Engineering Operations | OSCABE",
    description:
      "Our operational model for remote engineers: daily standups, weekly check-ins, fortnightly reviews, monthly business reviews.",
    url: "https://oscabe.com/how-we-deliver",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function HowWeDeliverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
