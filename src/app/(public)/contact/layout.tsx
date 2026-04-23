import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact OSCABE | Automation & AI Recruitment Enquiries",
  description:
    "Get in touch with OSCABE for automation and AI recruitment enquiries. Milton Keynes, UK. Employers, candidates, and agency partners welcome.",
  alternates: {
    canonical: "https://oscabe.com/contact",
  },
  openGraph: {
    title: "Contact OSCABE | Automation & AI Recruitment Enquiries",
    description:
      "Get in touch with OSCABE for automation and AI recruitment enquiries. Milton Keynes, UK. Employers, candidates, and agency partners welcome.",
    url: "https://oscabe.com/contact",
    siteName: "OSCABE",
    locale: "en_GB",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
