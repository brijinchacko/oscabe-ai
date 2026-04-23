import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OSCABE | Chartered Engineer-Led Automation & AI Recruitment",
  description:
    "Founded by Joseph Brijin Chacko, CEng. 13+ years in industrial automation. Award-winning recruitment for automation and AI engineers.",
  keywords: [
    "about OSCABE",
    "Chartered Engineer recruitment",
    "automation recruitment founder",
    "AI recruitment agency about",
    "Joseph Brijin Chacko",
  ],
  alternates: {
    canonical: "https://oscabe.com/about",
  },
  openGraph: {
    title: "About OSCABE | Chartered Engineer-Led Automation & AI Recruitment",
    description:
      "Founded by Joseph Brijin Chacko, CEng. 13+ years in industrial automation. Award-winning recruitment for automation and AI engineers.",
    url: "https://oscabe.com/about",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
