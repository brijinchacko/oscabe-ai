import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const APP_NAME = "OSCABE";
const APP_DESCRIPTION = "AI-matched, technically verified automation engineers. PLC, SCADA, Controls, Robotics, EC&I, Commissioning, Maintenance. Powered by 3BOX AI.";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | The AI Recruiter for Industrial Automation`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: `${APP_NAME} | The AI Recruiter for Industrial Automation`,
    description: APP_DESCRIPTION,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: APP_NAME,
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="font-sans antialiased">
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
