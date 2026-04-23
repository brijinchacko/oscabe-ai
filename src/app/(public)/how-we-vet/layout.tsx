import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How We Vet Engineers | 5-Step Process | OSCABE",
  description:
    "Our 5-step Chartered Engineer-led vetting process ensures every remote engineer meets the highest technical and communication standards.",
  keywords: [
    "engineer vetting process",
    "chartered engineer screening",
    "technical interview automation",
    "PLC engineer assessment",
    "remote engineer quality",
  ],
  alternates: {
    canonical: "https://oscabe.com/how-we-vet",
  },
  openGraph: {
    title: "How We Vet Engineers | 5-Step Process | OSCABE",
    description:
      "Our 5-step Chartered Engineer-led vetting process ensures every remote engineer meets the highest technical and communication standards.",
    url: "https://oscabe.com/how-we-vet",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function HowWeVetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
