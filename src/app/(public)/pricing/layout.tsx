import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | Automation & AI Recruitment Success | OSCABE",
  description:
    "See how OSCABE helps organisations hire automation and AI engineers fast. Real case studies across Manufacturing, Automotive, Energy, Pharma, and more.",
  alternates: {
    canonical: "https://oscabe.com/pricing",
  },
  openGraph: {
    title: "Case Studies | Automation & AI Recruitment Success | OSCABE",
    description:
      "See how OSCABE helps organisations hire automation and AI engineers fast. Real case studies across Manufacturing, Automotive, Energy, Pharma, and more.",
    url: "https://oscabe.com/pricing",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
