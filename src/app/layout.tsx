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
  "@type": "Organization",
  name: "OSCABE",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: APP_DESCRIPTION,
  foundingDate: "2024",
  areaServed: "GB",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    areaServed: "GB",
    availableLanguage: "English",
  },
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
