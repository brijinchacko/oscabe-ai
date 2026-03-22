import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment Agency Partner Platform | Automation Talent | OSCABE",
  description:
    "Access pre-verified automation engineers. OSCABE Verify from £30/assessment. Split-fee network and Talent Radar market intelligence.",
};

export default function AgenciesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
