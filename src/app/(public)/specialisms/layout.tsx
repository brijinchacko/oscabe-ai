import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Specialisms | Automation & AI Recruitment by Industry | OSCABE",
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
    canonical: "https://oscabe.com/specialisms",
  },
  openGraph: {
    title: "Specialisms | Automation & AI Recruitment by Industry | OSCABE",
    description:
      "Specialist automation and AI recruitment across Manufacturing, Automotive, Energy, Pharma, Food & Beverage, Defence, and more.",
    url: "https://oscabe.com/specialisms",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function SpecialismsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
