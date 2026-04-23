import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics } from "@/components/shared/google-analytics";
import "./globals.css";

const APP_NAME = "OSCABE";
const APP_DESCRIPTION =
  "The UK's specialist recruitment agency for industrial automation and AI talent. We place PLC, SCADA, Robotics, ML, Computer Vision engineers. Technically verified. 72-hour shortlists.";
const SITE_URL = "https://oscabe.com";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "OSCABE | Industrial Automation & AI Recruitment Agency UK",
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "automation recruitment agency UK",
    "AI recruitment agency",
    "PLC engineer recruitment",
    "SCADA engineer jobs",
    "robotics recruitment",
    "machine learning recruitment",
    "controls engineer jobs UK",
    "industrial automation jobs",
    "AI engineer jobs UK",
    "automation engineer recruitment UK",
    "PLC programmer jobs",
    "SCADA engineer recruitment",
    "robotics engineer hiring",
    "computer vision recruitment",
    "EC&I engineer jobs",
    "commissioning engineer recruitment",
    "Siemens PLC programmer",
    "Rockwell automation jobs",
    "AI recruitment platform",
    "technical screening automation",
    "automation talent UK",
    "hire PLC engineers",
    "SCADA developer jobs",
    "data science recruitment UK",
    "industrial automation recruitment agency",
  ],
  icons: { icon: "/favicon.svg" },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "OSCABE | Industrial Automation & AI Recruitment Agency UK",
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/logo-indigo.png`,
        width: 1200,
        height: 630,
        alt: "OSCABE - Industrial Automation & AI Recruitment Agency UK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OSCABE | Industrial Automation & AI Recruitment Agency UK",
    description: APP_DESCRIPTION,
    images: [`${SITE_URL}/logo-indigo.png`],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["EmploymentAgency", "Organization"],
      "@id": `${SITE_URL}/#organization`,
      name: "OSCABE",
      alternateName: ["Oscabe Ltd", "OSCABE AI", "Oscabe Recruitment"],
      url: SITE_URL,
      logo: `${SITE_URL}/logo-indigo.png`,
      image: `${SITE_URL}/logo-indigo.png`,
      description: "The UK's specialist recruitment agency for industrial automation and AI engineering talent. Expert-led technical screening with 72-hour shortlists. We place PLC, SCADA, Controls, Robotics, Machine Learning, Computer Vision, and Data Science engineers.",
      slogan: "The Specialist Recruiter for Industrial Automation & AI",
      foundingDate: "2024",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 60 },
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
        "Industrial Automation Recruitment", "AI Engineer Recruitment", "PLC Programmer Recruitment UK",
        "SCADA Engineer Recruitment", "Robotics Engineer Recruitment", "Machine Learning Recruitment",
        "Computer Vision Recruitment", "Controls Engineer Recruitment UK", "Automation Recruitment Agency",
        "AI Recruitment Agency UK", "Engineering Recruitment UK",
        "PLC Programming", "SCADA Systems", "Industrial Automation", "Controls Engineering",
        "Robotics Engineering", "EC&I Engineering", "Commissioning", "Siemens TIA Portal",
        "Allen-Bradley Studio 5000", "Rockwell Automation", "Schneider Electric",
        "Beckhoff TwinCAT", "ABB Robotics", "FANUC", "KUKA", "Functional Safety SIL",
        "DCS Systems", "MES/MIS", "BMS/BEMS", "Process Control",
        "TensorFlow", "PyTorch", "Computer Vision", "NLP", "Data Science",
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
          { "@type": "Offer", name: "PLC Engineer Recruitment", description: "Siemens, Allen-Bradley, Schneider PLC programmers" },
          { "@type": "Offer", name: "SCADA Engineer Recruitment", description: "WinCC, FactoryTalk, Ignition, AVEVA specialists" },
          { "@type": "Offer", name: "AI/ML Engineer Recruitment", description: "TensorFlow, PyTorch, Computer Vision, NLP engineers" },
          { "@type": "Offer", name: "Robotics Engineer Recruitment", description: "FANUC, ABB, KUKA, Universal Robots programmers" },
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
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/jobs?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
