import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries We Serve | Automation & AI Recruitment | OSCABE",
  description:
    "Specialist automation and AI recruitment across Manufacturing, Automotive, Energy, Pharma, Food & Beverage, Defence, and more.",
  keywords: [
    "automation recruitment manufacturing",
    "AI recruitment automotive",
    "pharma automation engineers",
    "energy sector recruitment",
    "food beverage automation",
    "defence automation recruitment",
    "Industry 4.0 recruitment",
  ],
  alternates: {
    canonical: "https://oscabe.com/industries",
  },
  openGraph: {
    title: "Industries We Serve | Automation & AI Recruitment | OSCABE",
    description:
      "Specialist automation and AI recruitment across Manufacturing, Automotive, Energy, Pharma, Food & Beverage, Defence, and more.",
    url: "https://oscabe.com/industries",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
