import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries We Support | Recruitment Across All Sectors",
  description: "OSCABE provides recruitment services across insurance, financial services, professional services, technology, engineering, healthcare, logistics, and energy sectors. Pre-qualified candidates delivered in 72 hours.",
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
