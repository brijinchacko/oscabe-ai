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
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  JOB_POSTED: "Job",
  CANDIDATE_REGISTERED: "Candidate",
  SCREENING_ORDER: "Screening",
  REFERRAL_SUBMITTED: "Referral",
};

const TYPE_DOT: Record<string, string> = {
  CONTACT_FORM: "bg-blue-500",
  JOB_POSTED: "bg-purple-500",
  CANDIDATE_REGISTERED: "bg-emerald-500",
  SCREENING_ORDER: "bg-amber-500",
  REFERRAL_SUBMITTED: "bg-pink-500",
};

const TYPE_BG: Record<string, string> = {
  CONTACT_FORM: "bg-blue-50 text-blue-700",
  JOB_POSTED: "bg-purple-50 text-purple-700",
  CANDIDATE_REGISTERED: "bg-emerald-50 text-emerald-700",
  SCREENING_ORDER: "bg-amber-50 text-amber-700",
  REFERRAL_SUBMITTED: "bg-pink-50 text-pink-700",
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CONTACT_FORM: Mail,
  JOB_POSTED: Briefcase,
  CANDIDATE_REGISTERED: Users,
  SCREENING_ORDER: Shield,
  REFERRAL_SUBMITTED: Gift,
};

const STATUS_BG: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  CONTACTED: "bg-yellow-50 text-yellow-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  ORDERED: "bg-amber-50 text-amber-700",
};

const STATUS_DOT: Record<string, string> = {
  NEW: "bg-blue-500",
  CONTACTED: "bg-yellow-500",
  CONVERTED: "bg-emerald-500",
  ORDERED: "bg-amber-500",
};

const FILTER_TYPES = [
  { value: "", label: "All Types" },
  { value: "CONTACT_FORM", label: "Contact" },
  { value: "JOB_POSTED", label: "Jobs" },
  { value: "CANDIDATE_REGISTERED", label: "Candidates" },
  { value: "SCREENING_ORDER", label: "Screening" },
  { value: "REFERRAL_SUBMITTED", label: "Referrals" },
];

const FILTER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CONVERTED", label: "Converted" },
];

function parseContent(content: string | null): ParsedContent {
  if (!content) return {};
  try { return JSON.parse(content); } catch { return { rawContent: content }; }
}

function getDisplayName(activity: Activity, parsed: ParsedContent): string {
  switch (activity.type) {
    case "CONTACT_FORM": return parsed.name || "Unknown";
    case "JOB_POSTED": return `${parsed.roleTitle || "Unknown"} at ${parsed.companyName || "Unknown"}`;
    case "CANDIDATE_REGISTERED": return `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() || "Unknown";
    case "SCREENING_ORDER": return parsed.candidateName || "Unknown";
    case "REFERRAL_SUBMITTED": return `${parsed.candidateName || "Unknown"} (by ${parsed.referrerName || "Unknown"})`;
    default: return activity.title;
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
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const activeFilterCount =
    (filterType ? 1 : 0) +
    (filterStatus ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("status", filterStatus);
      if (searchTerm) params.set("search", searchTerm);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

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
  }, [page, filterType, filterStatus, searchTerm, dateFrom, dateTo]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    const timer = setTimeout(() => { setSearchTerm(searchInput); setPage(1); }, 300);
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
    } catch { toast.error("Failed to update status"); } finally { setUpdating(null); }
  }

  function clearAllFilters() {
    setFilterType("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Leads & Submissions</h1>
        <p className="text-[11px] text-gray-500">{total} total</p>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Filter className="size-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold min-w-[18px] h-[18px] px-1">
                {activeFilterCount}
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="h-8 w-[140px] rounded-md border border-gray-200 bg-white pl-7 pr-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          </div>

          <Select value={filterType} onValueChange={(v) => { setFilterType(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              {FILTER_TYPES.map((ft) => (<SelectItem key={ft.value || "all"} value={ft.value || "all"}>{ft.label}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {FILTER_STATUSES.map((s) => (<SelectItem key={s.value || "all"} value={s.value || "all"}>{s.label}</SelectItem>))}
            </SelectContent>
          </Select>

          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v ?? "newest"); setPage(1); }}>
            <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">Clear All</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-gray-400" /></div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Inbox className="size-8 mb-1" />
            <p className="text-xs">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sticky top-0 z-10 bg-white border-b border-gray-200">
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Date</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Type</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Name / Company</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Email</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a, idx) => {
                  const parsed = parseContent(a.content);
                  const displayName = getDisplayName(a, parsed);
                  const displayEmail = getDisplayEmail(a, parsed);
                  const status = getStatus(parsed);

                  return (
                    <tr
                      key={a.id}
                      className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                      style={{ height: "32px" }}
                      onClick={() => setSelectedActivity(a)}
                    >
                      <td className="px-3 py-1.5 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_BG[a.type] || "bg-gray-50 text-gray-600"}`}>
                          <span className={`size-1.5 rounded-full ${TYPE_DOT[a.type] || "bg-gray-400"}`} />
                          {TYPE_LABELS[a.type] || a.type}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-xs font-medium text-gray-900 max-w-[180px] truncate">{displayName}</td>
                      <td className="px-3 py-1.5 text-xs text-gray-500 max-w-[160px] truncate">{displayEmail}</td>
                      <td className="px-3 py-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BG[status] || "bg-gray-50 text-gray-600"}`}>
                          <span className={`size-1.5 rounded-full ${STATUS_DOT[status] || "bg-gray-400"}`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                          {status !== "CONTACTED" && (
                            <button onClick={() => updateStatus(a.id, "CONTACTED")} disabled={updating === a.id} title="Mark as Contacted" className="rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50">
                              <Phone className="size-3" />
                            </button>
                          )}
                          {status !== "CONVERTED" && (
                            <button onClick={() => updateStatus(a.id, "CONVERTED")} disabled={updating === a.id} title="Mark as Converted" className="rounded p-1 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50">
                              <CheckCircle2 className="size-3" />
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
          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
            <p className="text-[11px] text-gray-500">Page {page}/{pages} ({total})</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page >= pages} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over panel */}
      {selectedActivity && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedActivity(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white shadow-xl">
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

  const detailRows: { label: string; value: string }[] = [];
  if (parsed.name) detailRows.push({ label: "Name", value: parsed.name });
  if (parsed.firstName || parsed.lastName) detailRows.push({ label: "Name", value: `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim() });
  if (parsed.companyName) detailRows.push({ label: "Company", value: parsed.companyName });
  if (parsed.contactName) detailRows.push({ label: "Contact", value: parsed.contactName });
  if (parsed.email) detailRows.push({ label: "Email", value: parsed.email });
  if (parsed.phone || parsed.candidatePhone) detailRows.push({ label: "Phone", value: (parsed.phone || parsed.candidatePhone) as string });
  if (parsed.roleTitle) detailRows.push({ label: "Role", value: parsed.roleTitle });
  if (parsed.enquiryType) detailRows.push({ label: "Enquiry", value: parsed.enquiryType });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${TYPE_BG[activity.type] || "bg-gray-50 text-gray-600"}`}>
            {TYPE_LABELS[activity.type] || activity.type}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_BG[status] || "bg-gray-50 text-gray-600"}`}>
            {status}
          </span>
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X className="size-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-0.5">{activity.title}</h2>
        <p className="text-[10px] text-gray-500 mb-4">
          {new Date(activity.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>

        <div className="rounded-md border border-gray-200 overflow-hidden mb-4">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-100">
              {detailRows.map((row, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 text-gray-500 font-medium w-1/3">{row.label}</td>
                  <td className="px-3 py-2 text-gray-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!!(parsed.message || parsed.description) && (
          <div className="mb-4">
            <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">{parsed.message ? "Message" : "Description"}</h3>
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">{String(parsed.message || parsed.description || "")}</div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {activity.candidateId && (
            <a href={`/crm/candidates/${activity.candidateId}`} className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800">
              <ArrowRightCircle className="size-3" /> View Candidate
            </a>
          )}
          {activity.jobId && (
            <a href={`/crm/jobs/${activity.jobId}`} className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800">
              <ArrowRightCircle className="size-3" /> View Job
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-3 flex gap-2">
        {status !== "CONTACTED" && (
          <button onClick={() => onUpdateStatus(activity.id, "CONTACTED")} disabled={updating === activity.id} className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
            <Phone className="size-3" /> Contacted
          </button>
        )}
        {status !== "CONVERTED" && (
          <button onClick={() => onUpdateStatus(activity.id, "CONVERTED")} disabled={updating === activity.id} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
            <CheckCircle2 className="size-3" /> Converted
          </button>
        )}
        <button onClick={onClose} className="ml-auto inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Close</button>
      </div>
    </div>
  );
}
