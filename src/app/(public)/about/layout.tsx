import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OSCABE | Chartered Engineer-Led AI Recruitment | UK",
  description:
    "13+ years in automation recruitment. Chartered Engineer verification. National Manufacturing Startup of the Year 2025. Powered by 3BOX AI.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
