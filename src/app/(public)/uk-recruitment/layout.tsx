import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UK Recruitment | Automation & AI Engineers | OSCABE",
  description:
    "UK-based recruitment for automation and AI roles that cannot go remote. Commissioning engineers, field service, panel wiring, on-site project leads. Pre-qualified UK candidates in 72 hours.",
  keywords: [
    "UK recruitment automation engineers",
    "commissioning engineer recruitment",
    "field service engineer recruitment",
    "panel wiring recruitment UK",
    "on-site automation engineer",
  ],
  alternates: {
    canonical: "https://oscabe.com/uk-recruitment",
  },
  openGraph: {
    title: "UK Recruitment | Automation & AI Engineers | OSCABE",
    description:
      "UK-based recruitment for automation and AI roles that cannot go remote. Pre-qualified UK candidates in 72 hours, no upfront fees.",
    url: "https://oscabe.com/uk-recruitment",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function UkRecruitmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
