import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Platform | 7 AI Agents for Recruitment | OSCABE",
  description:
    "OSCABE's AI platform: 7 purpose-built AI agents powering sourcing, screening, matching, compliance, and engagement for automation and AI recruitment.",
  keywords: [
    "AI recruitment platform",
    "AI-powered recruitment",
    "automated candidate sourcing",
    "AI candidate screening",
    "recruitment AI agents",
  ],
  alternates: {
    canonical: "https://oscabe.com/ai-platform",
  },
  openGraph: {
    title: "AI Platform | 7 AI Agents for Recruitment | OSCABE",
    description:
      "OSCABE's AI platform: 7 purpose-built AI agents powering sourcing, screening, matching, compliance, and engagement.",
    url: "https://oscabe.com/ai-platform",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function AiPlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
