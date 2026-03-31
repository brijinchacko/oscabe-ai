"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Inbox,
  Search,
  Loader2,
  X,
  Mail,
  Briefcase,
  Users,
  Shield,
  Gift,
  ChevronLeft,
  ChevronRight,
  Phone,
  CheckCircle2,
  ArrowRightCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Activity {
  id: string;
  type: string;
  title: string;
  content: string | null;
  metadata: string | null;
  createdAt: string;
  candidateId: string | null;
  clientId: string | null;
  jobId: string | null;
}

interface ParsedContent {
  name?: string;
  firstName?: string;
  lastName?: string;
  candidateName?: string;
  referrerName?: string;
  companyName?: string;
  contactName?: string;
  email?: string;
  candidateEmail?: string;
  referrerEmail?: string;
  phone?: string;
  candidatePhone?: string;
  message?: string;
  description?: string;
  roleTitle?: string;
  enquiryType?: string;
  screeningType?: string;
  status?: string;
  [key: string]: unknown;
}

const TYPE_LABELS: Record<string, string> = {
  CONTACT_FORM: "Contact",
  JOB_POSTED: "Job Posted",
  CANDIDATE_REGISTERED: "Candidate",
  SCREENING_ORDER: "Screening",
  REFERRAL_SUBMITTED: "Referral",
};

const TYPE_COLORS: Record<string, string> = {
  CONTACT_FORM: "bg-blue-100 text-blue-700",
  JOB_POSTED: "bg-purple-100 text-purple-700",
  CANDIDATE_REGISTERED: "bg-emerald-100 text-emerald-700",
  SCREENING_ORDER: "bg-amber-100 text-amber-700",
  REFERRAL_SUBMITTED: "bg-pink-100 text-pink-700",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CONTACT_FORM: Mail,
  JOB_POSTED: Briefcase,
  CANDIDATE_REGISTERED: Users,
  SCREENING_ORDER: Shield,
  REFERRAL_SUBMITTED: Gift,
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-100 text-blue-700" },
  CONTACTED: { label: "Contacted", className: "bg-yellow-100 text-yellow-700" },
  CONVERTED: { label: "Converted", className: "bg-emerald-100 text-emerald-700" },
  ORDERED: { label: "Ordered", className: "bg-amber-100 text-amber-700" },
};

const FILTER_TYPES = [
  { value: "", label: "All Types" },
  { value: "CONTACT_FORM", label: "Contact Forms" },
  { value: "JOB_POSTED", label: "Jobs Posted" },
  { value: "CANDIDATE_REGISTERED", label: "Candidates" },
  { value: "SCREENING_ORDER", label: "Screening Orders" },
  { value: "REFERRAL_SUBMITTED", label: "Referrals" },
];

function parseContent(content: string | null): ParsedContent {
  if (!content) return {};
  try {
    return JSON.parse(content);
  } catch {
    return { rawContent: content };
  }
}

function getDisplayName(activity: Activity, parsed: ParsedContent): string {
  switch (activity.type) {
    case "CONTACT_FORM":
      return parsed.name || "Unknown";
    case "JOB_POSTED":
      return `${parsed.roleTitle || "Unknown"} at ${parsed.companyName || "Unknown"}`;
    case "CANDIDATE_REGISTERED":
      return `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || "Unknown";
    case "SCREENING_ORDER":
      return parsed.candidateName || "Unknown";
    case "REFERRAL_SUBMITTED":
      return `${parsed.candidateName || "Unknown"} (by ${parsed.referrerName || "Unknown"})`;
    default:
      return activity.title;
  }
}

function getDisplayEmail(activity: Activity, parsed: ParsedContent): string {
  return parsed.email || parsed.candidateEmail || parsed.referrerEmail || "";
}

function getStatus(parsed: ParsedContent): string {
  return (parsed.status as string) || "NEW";
}

export default function CRMLeadsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (filterType) params.set("type", filterType);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setActivities(data.activities);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, filterType, searchTerm]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Marked as ${status.toLowerCase()}`);
      fetchLeads();
      if (selectedActivity?.id === id) {
        const updated = await res.json();
        setSelectedActivity(updated.activity);
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads &amp; Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">
            All public form submissions across the website ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, details..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {FILTER_TYPES.map((ft) => (
            <button
              key={ft.value}
              onClick={() => { setFilterType(ft.value); setPage(1); }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterType === ft.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Inbox className="size-10 mb-2" />
            <p className="text-sm">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Name / Company</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((a) => {
                  const parsed = parseContent(a.content);
                  const displayName = getDisplayName(a, parsed);
                  const displayEmail = getDisplayEmail(a, parsed);
                  const status = getStatus(parsed);
                  const TypeIcon = TYPE_ICONS[a.type] || Inbox;
                  const statusConfig = STATUS_LABELS[status] || STATUS_LABELS.NEW;

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedActivity(a)}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type] || "bg-gray-100 text-gray-700"}`}>
                          <TypeIcon className="size-3" />
                          {TYPE_LABELS[a.type] || a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                        {displayName}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">
                        {displayEmail}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {status !== "CONTACTED" && (
                            <button
                              onClick={() => updateStatus(a.id, "CONTACTED")}
                              disabled={updating === a.id}
                              title="Mark as Contacted"
                              className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50"
                            >
                              <Phone className="size-4" />
                            </button>
                          )}
                          {status !== "CONVERTED" && (
                            <button
                              onClick={() => updateStatus(a.id, "CONVERTED")}
                              disabled={updating === a.id}
                              title="Mark as Converted"
                              className="rounded p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {pages} ({total} results)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="size-3.5" />
                Prev
              </button>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page >= pages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over panel */}
      {selectedActivity && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedActivity(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            <SlideOverContent
              activity={selectedActivity}
              onClose={() => setSelectedActivity(null)}
              onUpdateStatus={(id, status) => updateStatus(id, status)}
              updating={updating}
            />
          </div>
        </>
      )}
    </div>
  );
}

function SlideOverContent({
  activity,
  onClose,
  onUpdateStatus,
  updating,
}: {
  activity: Activity;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  updating: string | null;
}) {
  const parsed = parseContent(activity.content);
  const status = getStatus(parsed);
  const statusConfig = STATUS_LABELS[status] || STATUS_LABELS.NEW;
  const TypeIcon = TYPE_ICONS[activity.type] || Inbox;

  // Build detail rows from parsed content
  const detailRows: { label: string; value: string }[] = [];

  if (parsed.name) detailRows.push({ label: "Name", value: parsed.name });
  if (parsed.firstName || parsed.lastName)
    detailRows.push({ label: "Name", value: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() });
  if (parsed.companyName) detailRows.push({ label: "Company", value: parsed.companyName });
  if (parsed.contactName) detailRows.push({ label: "Contact", value: parsed.contactName });
  if (parsed.referrerName) detailRows.push({ label: "Referrer", value: `${parsed.referrerName} (${parsed.referrerEmail || ""})` });
  if (parsed.candidateName) detailRows.push({ label: "Candidate", value: parsed.candidateName });
  if (parsed.email) detailRows.push({ label: "Email", value: parsed.email });
  if (parsed.candidateEmail && parsed.candidateEmail !== parsed.email)
    detailRows.push({ label: "Candidate Email", value: parsed.candidateEmail });
  if (parsed.phone || parsed.candidatePhone)
    detailRows.push({ label: "Phone", value: (parsed.phone || parsed.candidatePhone) as string });
  if (parsed.enquiryType) detailRows.push({ label: "Enquiry Type", value: parsed.enquiryType });
  if (parsed.roleTitle) detailRows.push({ label: "Role", value: parsed.roleTitle });
  if (parsed.screeningType) detailRows.push({ label: "Screening Type", value: parsed.screeningType });
  if (parsed.location) detailRows.push({ label: "Location", value: parsed.location as string });
  if (parsed.contractType) detailRows.push({ label: "Contract Type", value: parsed.contractType as string });
  if (parsed.specialism) detailRows.push({ label: "Specialism", value: parsed.specialism as string });
  if (parsed.industry) detailRows.push({ label: "Industry", value: parsed.industry as string });
  if (parsed.headline) detailRows.push({ label: "Headline", value: parsed.headline as string });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[activity.type] || "bg-gray-100 text-gray-700"}`}>
            <TypeIcon className="size-3" />
            {TYPE_LABELS[activity.type] || activity.type}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{activity.title}</h2>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(activity.createdAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {/* Detail table */}
        <div className="rounded-lg border border-gray-200 overflow-hidden mb-6">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {detailRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-2.5 text-gray-500 font-medium w-1/3">{row.label}</td>
                  <td className="px-4 py-2.5 text-gray-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Message / Description */}
        {!!(parsed.message || parsed.description) && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              {parsed.message ? "Message" : "Description"}
            </h3>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {String(parsed.message || parsed.description || "")}
            </div>
          </div>
        )}

        {!!parsed.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
            <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
              {String(parsed.notes || "")}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col gap-2">
          {activity.candidateId && (
            <a
              href={`/crm/candidates/${activity.candidateId}`}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <ArrowRightCircle className="size-4" />
              View Candidate Record
            </a>
          )}
          {activity.jobId && (
            <a
              href={`/crm/jobs/${activity.jobId}`}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              <ArrowRightCircle className="size-4" />
              View Job Record
            </a>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
        {status !== "CONTACTED" && (
          <button
            onClick={() => onUpdateStatus(activity.id, "CONTACTED")}
            disabled={updating === activity.id}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Phone className="size-4" />
            Mark Contacted
          </button>
        )}
        {status !== "CONVERTED" && (
          <button
            onClick={() => onUpdateStatus(activity.id, "CONVERTED")}
            disabled={updating === activity.id}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" />
            Mark Converted
          </button>
        )}
        <button
          onClick={onClose}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
