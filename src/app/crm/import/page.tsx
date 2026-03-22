"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Briefcase,
  Award,
  UserCheck,
  MessageSquare,
  ArrowLeft,
  Download,
  Upload,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------ */
/*  Module definitions                                                  */
/* ------------------------------------------------------------------ */

interface ImportModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  templateModule: string;
  countEndpoint: string;
  order: number;
}

const MODULES: ImportModule[] = [
  {
    id: "clients",
    title: "Clients",
    description:
      "Import client companies from Zoho Recruit. Includes company name, industry, website, and location.",
    icon: Building2,
    href: "/crm/import/clients",
    templateModule: "clients",
    countEndpoint: "/api/import/counts?module=clients",
    order: 1,
  },
  {
    id: "contacts",
    title: "Contacts",
    description:
      "Import client contacts. Requires clients to be imported first so contacts can be linked.",
    icon: UserCheck,
    href: "/crm/import/contacts",
    templateModule: "contacts",
    countEndpoint: "/api/import/counts?module=contacts",
    order: 2,
  },
  {
    id: "candidates",
    title: "Candidates",
    description:
      "Import candidates with their skills, salary expectations, and contact details.",
    icon: Users,
    href: "/crm/candidates/import",
    templateModule: "candidates",
    countEndpoint: "/api/import/counts?module=candidates",
    order: 3,
  },
  {
    id: "jobs",
    title: "Jobs / Job Openings",
    description:
      "Import job openings with descriptions, salary ranges, skills, and client links.",
    icon: Briefcase,
    href: "/crm/import/jobs",
    templateModule: "jobs",
    countEndpoint: "/api/import/counts?module=jobs",
    order: 4,
  },
  {
    id: "placements",
    title: "Placements",
    description:
      "Import placement records linking candidates to jobs. Requires candidates and jobs first.",
    icon: Award,
    href: "/crm/import/placements",
    templateModule: "placements",
    countEndpoint: "/api/import/counts?module=placements",
    order: 5,
  },
  {
    id: "activities",
    title: "Activities / Notes",
    description:
      "Import activity logs and notes. Can link to candidates, clients, and jobs.",
    icon: MessageSquare,
    href: "/crm/import/activities",
    templateModule: "activities",
    countEndpoint: "/api/import/counts?module=activities",
    order: 6,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ImportHubPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/import/counts");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch {
        // Silently fail - counts are optional
      } finally {
        setLoadingCounts(false);
      }
    }
    fetchCounts();
  }, []);

  function handleDownloadTemplate(module: string) {
    window.open(`/api/import/template?module=${module}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/crm"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900">
          Data Import Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Migrate your data from Zoho Recruit or any CSV source into OSCABE CRM
        </p>
      </div>

      {/* Import Order Guidance */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">
              Recommended Import Order
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              Import in this order to ensure data links correctly:
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {[
                "1. Clients",
                "2. Contacts",
                "3. Candidates",
                "4. Jobs",
                "5. Placements",
                "6. Activities",
              ].map((step, idx) => (
                <span key={step} className="flex items-center gap-1">
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-100"
                  >
                    {step}
                  </Badge>
                  {idx < 5 && (
                    <span className="text-blue-400">&rarr;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const count = counts[mod.id];
          return (
            <div
              key={mod.id}
              className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Top: Icon + Order Badge */}
              <div className="flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="size-5 text-indigo-600" />
                </div>
                <Badge variant="outline" className="text-xs">
                  Step {mod.order}
                </Badge>
              </div>

              {/* Title + Description */}
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {mod.title}
              </h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">
                {mod.description}
              </p>

              {/* Record count */}
              <div className="mt-3 text-xs text-muted-foreground">
                {loadingCounts ? (
                  <span className="animate-pulse">Loading...</span>
                ) : count !== undefined ? (
                  <span>
                    <span className="font-medium text-gray-700">{count.toLocaleString()}</span>{" "}
                    records in database
                  </span>
                ) : (
                  <span>No records yet</span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Link href={mod.href} className="flex-1">
                  <Button className="w-full" size="sm">
                    <Upload className="size-3.5" />
                    Import CSV
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadTemplate(mod.templateModule)}
                  title="Download CSV template"
                >
                  <Download className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
