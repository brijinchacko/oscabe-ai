import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Recruitment Pricing | From £1,500 Flat Fee | OSCABE",
  description:
    "Flexible pricing: flat-fee shortlists from £1,500, subscriptions from £999/month, contingency 12-18%. Compare vs traditional recruiters.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
