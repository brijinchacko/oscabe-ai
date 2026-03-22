import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automation Engineer Jobs UK | PLC, SCADA & Controls | OSCABE",
  description:
    "Browse automation engineering vacancies across the UK. Siemens, Rockwell, Schneider and 20+ platforms. Permanent and contract roles.",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
