"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Building2, Users, Handshake, ChevronDown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSiteMode, type SiteMode } from "@/components/providers/site-mode-provider";

const MODE_CONFIG: Record<SiteMode, {
  label: string;
  shortLabel: string;
  icon: typeof Building2;
  color: string;
  nav: Array<{ label: string; href: string }>;
  cta: { label: string; href: string };
}> = {
  employers: {
    label: "For Employers",
    shortLabel: "Employers",
    icon: Building2,
    color: "#4540DB",
    nav: [
      { label: "Home", href: "/" },
      { label: "How It Works", href: "/employers" },
      { label: "Post a Role", href: "/post-a-role" },
      { label: "Jobs", href: "/jobs" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "Post a Role", href: "/post-a-role" },
  },
  candidates: {
    label: "For Candidates",
    shortLabel: "Candidates",
    icon: Users,
    color: "#00D4FF",
    nav: [
      { label: "Home", href: "/" },
      { label: "Why OSCABE", href: "/candidates" },
      { label: "Browse Jobs", href: "/jobs" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "Browse Jobs", href: "/jobs" },
  },
  agencies: {
    label: "For Agencies",
    shortLabel: "Agencies",
    icon: Handshake,
    color: "#8B5CF6",
    nav: [
      { label: "Home", href: "/" },
      { label: "Partnership", href: "/agencies" },
      { label: "Jobs", href: "/jobs" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
    cta: { label: "Partner With Us", href: "/contact" },
  },
};

const MODES: SiteMode[] = ["employers", "candidates", "agencies"];

export function Navbar() {
  const pathname = usePathname();
  const { mode, setMode } = useSiteMode();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const config = MODE_CONFIG[mode];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mode menu on outside click
  useEffect(() => {
    if (!modeMenuOpen) return;
    const close = () => setModeMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [modeMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#02012B]/95 backdrop-blur-xl shadow-lg shadow-black/10"
          : "bg-[#02012B]"
      }`}
    >
      {/* Mode accent line */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${config.color}, transparent)` }} />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + mode selector */}
        <div className="flex shrink-0 items-center gap-4">
          <div className="flex flex-col">
            <Logo variant="light" size="md" linkTo="/" />
          </div>

          {/* Mode selector dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setModeMenuOpen(!modeMenuOpen); }}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all hover:bg-white/10"
              style={{
                borderColor: `${config.color}50`,
                color: config.color,
                background: `${config.color}10`,
              }}
            >
              <config.icon className="h-3 w-3" />
              {config.shortLabel}
              <ChevronDown className={`h-3 w-3 transition-transform ${modeMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {modeMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-[#02012B] p-1.5 shadow-2xl shadow-black/40">
                {MODES.map((m) => {
                  const Icon = MODE_CONFIG[m].icon;
                  const isSelected = mode === m;
                  const mColor = MODE_CONFIG[m].color;
                  return (
                    <button
                      key={m}
                      onClick={(e) => { e.stopPropagation(); setMode(m); setModeMenuOpen(false); }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: `${mColor}20` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: mColor }} />
                      </div>
                      <div className="text-left">
                        <div>{MODE_CONFIG[m].label}</div>
                        {isSelected && (
                          <div className="text-[10px] font-normal" style={{ color: mColor }}>Active</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          {config.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span
                  className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full"
                  style={{ background: config.color }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link href={config.cta.href}>
            <Button
              className="text-white shadow-lg transition-all hover:shadow-xl"
              style={{
                background: config.color,
                boxShadow: `0 4px 14px ${config.color}40`,
              }}
            >
              {config.cta.label}
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <SheetContent side="right" className="w-80 bg-[#02012B] border-white/10">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo variant="light" size="sm" linkTo="/" />
                </SheetTitle>
              </SheetHeader>

              {/* Mobile mode selector */}
              <div className="mt-6 flex gap-1 rounded-xl bg-white/5 p-1">
                {MODES.map((m) => {
                  const mColor = MODE_CONFIG[m].color;
                  return (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 rounded-lg px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
                        mode === m
                          ? "text-white shadow-md"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                      style={mode === m ? { background: mColor } : undefined}
                    >
                      {MODE_CONFIG[m].shortLabel}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col gap-1">
                {config.nav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-white/10 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-4 h-px bg-white/10" />
                <Link
                  href="/sign-in"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href={config.cta.href}
                  className="mt-2 block w-full rounded-lg px-3 py-3 text-center text-sm font-semibold text-white transition-all"
                  style={{ background: config.color }}
                  onClick={() => setOpen(false)}
                >
                  {config.cta.label}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
