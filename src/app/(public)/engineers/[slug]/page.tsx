import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Globe,
  MapPin,
  Briefcase,
  Cpu,
  Star,
} from "lucide-react";
import {
  getEngineerBySlug,
  getRelatedEngineers,
  getAllSlugs,
} from "@/lib/engineers-data";
import { EngineerCard } from "@/components/shared/engineer-card";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { AvailabilityBadge } from "@/components/shared/availability-badge";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const e = getEngineerBySlug(slug);
  if (!e) return { title: "Engineer Not Found | OSCABE" };
  const url = `https://oscabe.com/engineers/${e.slug}`;
  return {
    title: `${e.name} - ${e.title} | OSCABE`,
    description: `${e.title} based in ${e.location}, ${e.seniority} experience. ${e.platforms.slice(0, 3).join(", ")}. Available via OSCABE Remote Engineer Portal.`,
    openGraph: {
      title: `${e.name} - ${e.title}`,
      description: `${e.title} | ${e.location} | ${e.seniority} experience`,
      url,
      siteName: "OSCABE",
      locale: "en_GB",
      type: "profile",
    },
    alternates: { canonical: url },
  };
}

export default async function EngineerProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const e = getEngineerBySlug(slug);
  if (!e) notFound();

  const related = getRelatedEngineers(e, 3);

  return (
    <div className="bg-[#010118]">
      {/* Back link */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/engineers"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all engineers
        </Link>
      </div>

      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 h-[400px] w-[400px] rounded-full bg-[#4540DB]/15 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4540DB] to-[#00D4FF] text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl">
                {e.avatarInitials}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {e.name}
                </h1>
                <p className="mt-1 text-base text-gray-300 sm:text-lg">{e.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {e.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {e.seniority} experience
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {e.timezone}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {e.verified && <VerifiedBadge />}
                  <AvailabilityBadge availability={e.availability} />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="text-left lg:text-right">
                <p className="text-xs uppercase tracking-wider text-gray-500">Monthly rate</p>
                <p className="text-2xl font-bold text-white">
                  £{e.monthlyRateLow.toLocaleString()}-{e.monthlyRateHigh.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              </div>
              <Link
                href={`/contact?type=engineer-request&engineer=${e.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#4540DB] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#3733B0]"
              >
                Request This Engineer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - content */}
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            {e.bio && (
              <ProfileSection title="About">
                <p className="text-base leading-relaxed text-gray-300">{e.bio}</p>
              </ProfileSection>
            )}

            {/* Platforms */}
            <ProfileSection title="Technical Platforms" icon={Cpu}>
              <div className="space-y-3">
                {e.platformDetail.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <span className="font-medium text-white">{p.name}</span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-[#00D4FF]">{p.level}</span>
                      <span className="text-gray-500">{p.years} yrs</span>
                    </span>
                  </div>
                ))}
              </div>
            </ProfileSection>

            {/* Industries */}
            <ProfileSection title="Industry Experience" icon={Briefcase}>
              <div className="flex flex-wrap gap-2">
                {e.industryDetail.map((ind) => (
                  <span
                    key={ind.name}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-gray-300"
                  >
                    {ind.name}
                    <span className="ml-1.5 text-[11px] text-gray-500">{ind.years} yrs</span>
                  </span>
                ))}
              </div>
            </ProfileSection>

            {/* Portfolio */}
            <ProfileSection title="Work Portfolio" icon={Star}>
              <div className="grid gap-4 sm:grid-cols-2">
                {e.portfolio.map((p, i) => (
                  <article
                    key={i}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
                  >
                    <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-[#4540DB]/30 bg-[#4540DB]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#8A85F0]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-gray-400">{p.outcome}</p>
                  </article>
                ))}
              </div>
            </ProfileSection>
          </div>

          {/* Right column - sidebar */}
          <aside className="space-y-6">
            {/* Availability */}
            <SidebarCard title="Availability">
              <SidebarRow icon={Calendar} label="Available from" value={e.availableFrom} />
              <SidebarRow icon={Globe} label="Timezone" value={e.timezone} />
              <SidebarRow icon={Briefcase} label="UK overlap" value={e.ukOverlap} />
            </SidebarCard>

            {/* Rates */}
            <SidebarCard title="Engagement Options">
              <RateRow label="Short-term project" value={e.dailyRateShortTerm} />
              <RateRow label="Long-term retainer" value={e.monthlyRateLongTerm} />
              <RateRow label="Part-time (3 days)" value={e.monthlyRatePartTime} />
              <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
                All rates include OSCABE management, vetting, compliance and IR35 protection. No additional fees.
              </p>
            </SidebarCard>

            {/* CTA */}
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#4540DB]/10 to-[#00D4FF]/10 p-5">
              <h3 className="text-sm font-semibold text-white">Next steps</h3>
              <div className="mt-4 space-y-2">
                <Link
                  href={`/contact?type=engineer-request&engineer=${e.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4540DB] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#4540DB]/25 transition-all hover:bg-[#3733B0]"
                >
                  Request This Engineer
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/contact"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-gray-200 transition-all hover:border-white/30"
                >
                  Book a 20-min Call
                </Link>
              </div>
            </div>

            {/* Verification */}
            <SidebarCard title="OSCABE Verified">
              {[
                "Technical interview passed",
                "Live task completed",
                "Reference checked",
                "Platform certifications verified",
              ].map((label) => (
                <div key={label} className="flex items-start gap-2 py-1.5 text-sm text-gray-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{label}</span>
                </div>
              ))}
            </SidebarCard>
          </aside>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-white">Similar Engineers</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <EngineerCard key={r.slug} engineer={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProfileSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Cpu;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        {Icon && <Icon className="h-5 w-5 text-[#00D4FF]" />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-white">{value ?? "-"}</p>
      </div>
    </div>
  );
}

function RateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
