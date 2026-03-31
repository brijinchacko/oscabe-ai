import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | Recruitment Success Stories | OSCABE",
  description:
    "See how OSCABE helps organisations hire high-performing talent fast. Real case studies across engineering, technology, operations, and financial services.",
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
