"use client";

import Link from "next/link";
import { Linkedin, Instagram, Facebook, Youtube } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import {
  SOCIAL_LINKS,
} from "@/lib/constants";

const PLATFORM_LINKS = [
  { label: "Remote Engineers", href: "/remote-engineers" },
  { label: "How We Vet", href: "/how-we-vet" },
  { label: "How We Deliver", href: "/how-we-deliver" },
  { label: "Remote Pricing", href: "/remote-engineers/pricing" },
  { label: "UK Recruitment", href: "/uk-recruitment" },
  { label: "Post a Role", href: "/post-a-role" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Blog", href: "/blog" },
  { label: "AI Platform", href: "/ai-platform" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Modern Slavery", href: "/modern-slavery" },
  { label: "GDPR Rights", href: "/gdpr" },
];


const SOCIAL_ICONS = [
  { icon: Linkedin, href: SOCIAL_LINKS?.linkedin || "#", label: "LinkedIn" },
  { icon: Instagram, href: SOCIAL_LINKS?.instagram || "#", label: "Instagram" },
  { icon: Facebook, href: SOCIAL_LINKS?.facebook || "#", label: "Facebook" },
  { icon: Youtube, href: SOCIAL_LINKS?.youtube || "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-[#02012B] text-white">
      {/* Gradient divider line */}
      <div
        className="h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #4540DB, transparent)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="light" size="md" linkTo="/" />
            <p className="mt-4 max-w-xs text-sm text-gray-400">
              The specialist recruiter for industrial automation and AI. Remote engineers from India and UK recruitment, verified by Senior Engineers.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {SOCIAL_ICONS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-gray-400 transition-all duration-200 hover:scale-110 hover:text-[#4540DB]"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Platform
            </h3>
            <ul className="mt-4 space-y-3">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => {
                    document.cookie = "OSCABE_COOKIE_CONSENT=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.dispatchEvent(new Event("show-cookie-consent"));
                    window.location.reload();
                  }}
                  className="text-sm text-gray-400 transition-colors hover:text-white cursor-pointer"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="my-8 h-[1px] bg-white/[0.06]" />
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Oscabe Ltd. Company No. 15913493. Registered in England &amp; Wales. Unit 8, Lyon Road, Milton Keynes, MK1 1EX.
          </p>
        </div>
      </div>
    </footer>
  );
}
