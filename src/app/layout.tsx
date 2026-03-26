import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import "./globals.css";

const APP_NAME = "OSCABE";
const APP_DESCRIPTION =
  "Connect with pre-screened PLC, SCADA, controls & robotics engineers. OSCABE uses AI to match verified automation talent with UK employers. 48-hour shortlists.";
const SITE_URL = "https://oscabe.com";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "OSCABE | AI-Powered Recruitment for Automation Engineers UK",
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "automation engineer recruitment UK",
    "PLC programmer jobs",
    "SCADA engineer recruitment",
    "controls engineer jobs UK",
    "robotics engineer hiring",
    "industrial automation recruitment",
    "EC&I engineer jobs",
    "commissioning engineer recruitment",
    "Siemens PLC programmer",
    "Rockwell automation jobs",
    "AI recruitment platform",
    "technical screening automation",
    "automation talent UK",
    "hire PLC engineers",
    "SCADA developer jobs",
  ],
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "OSCABE | AI-Powered Recruitment for Automation Engineers UK",
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "OSCABE - AI-Powered Automation Engineer Recruitment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSCABE | AI-Powered Recruitment for Automation Engineers UK",
    description: APP_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EmploymentAgency",
      "@id": `${SITE_URL}/#organization`,
      name: "OSCABE",
      alternateName: "Oscabe Ltd",
      url: SITE_URL,
      logo: `${SITE_URL}/logo-indigo.png`,
      image: `${SITE_URL}/og-image.png`,
      description: "The UK's first AI-native recruitment platform for industrial automation engineering. AI-powered matching of PLC, SCADA, Controls, Robotics, EC&I and Commissioning engineers with technically verified skill assessments.",
      foundingDate: "2024",
      legalName: "Oscabe Ltd",
      taxID: "15913493",
      areaServed: [
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Continent", name: "Europe" },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Unit 8, Lyon Road",
        addressLocality: "Milton Keynes",
        postalCode: "MK1 1EX",
        addressCountry: "GB",
      },
      sameAs: [
        "https://linkedin.com/company/oscabe",
        "https://www.youtube.com/channel/UCtWW7X94v6ji1BPTcUKqDLA",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "recruitment enquiries",
        email: "info@oscabe.com",
        areaServed: "GB",
        availableLanguage: "English",
      },
      knowsAbout: [
        "PLC Programming", "SCADA Systems", "Industrial Automation", "Controls Engineering",
        "Robotics Engineering", "EC&I Engineering", "Commissioning", "Siemens TIA Portal",
        "Allen-Bradley Studio 5000", "Rockwell Automation", "Schneider Electric",
        "Beckhoff TwinCAT", "ABB Robotics", "FANUC", "KUKA", "Functional Safety SIL",
        "DCS Systems", "MES/MIS", "BMS/BEMS", "Process Control",
      ],
      award: "National Manufacturing & Engineering Startup of the Year 2025",
      parentOrganization: {
        "@type": "Organization",
        name: "Wartens UK Ltd",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Recruitment Services",
        itemListElement: [
          { "@type": "Offer", name: "Contingency Recruitment", description: "12-18% of annual salary" },
          { "@type": "Offer", name: "Flat-Fee Shortlist Package", description: "From GBP 1,500 for 3 technically verified candidates" },
          { "@type": "Offer", name: "Employer Subscription", description: "From GBP 999 per month for ongoing access" },
          { "@type": "Offer", name: "Technical Screening", description: "GBP 150-250 per candidate assessment" },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "OSCABE",
      description: APP_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-GB",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="font-sans antialiased">
          <GoogleAnalytics />
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
