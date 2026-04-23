import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Insights & Resources",
  description:
    "Expert perspectives on industrial automation and AI recruitment. Career guides, salary data, skills advice, and industry trends from OSCABE's Chartered Engineer-led team.",
  keywords: [
    "automation recruitment blog",
    "PLC engineer career advice",
    "SCADA engineer blog",
    "AI recruitment insights",
    "industrial automation careers",
    "controls engineer guide",
    "robotics engineer blog UK",
    "Industry 4.0 careers",
  ],
  openGraph: {
    title: "Blog | Insights & Resources | OSCABE",
    description:
      "Expert perspectives on industrial automation and AI recruitment. Career guides, salary data, and industry trends.",
    type: "website",
    url: "https://oscabe.com/blog",
    siteName: "OSCABE",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Insights & Resources | OSCABE",
    description:
      "Expert perspectives on industrial automation and AI recruitment.",
  },
  alternates: {
    canonical: "https://oscabe.com/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
