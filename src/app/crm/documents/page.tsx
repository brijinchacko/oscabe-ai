"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  Eye,
  Filter,
  Loader2,
  File,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentItem {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  category: string;
  clientId: string | null;
  candidateId: string | null;
  jobId: string | null;
  notes: string | null;
  createdAt: string;
  client?: { id: string; companyName: string } | null;
  candidate?: { id: string; firstName: string; lastName: string } | null;
  job?: { id: string; title: string } | null;
}

interface ClientOption { id: string; companyName: string; }
interface CandidateOption { id: string; firstName: string; lastName: string; }

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "GENERAL", label: "General" },
  { value: "CV", label: "CV" },
  { value: "CONTRACT", label: "Contract" },
  { value: "JD", label: "Job Description" },
  { value: "PROFILE", label: "Profile" },
  { value: "TERMS", label: "Terms & Conditions" },
  { value: "COVER_LETTER", label: "Cover Letter" },
  { value: "SCREENING", label: "Screening" },
  { value: "OTHER", label: "Other" },
];

const CATEGORY_DOT: Record<string, string> = {
  GENERAL: "bg-gray-400",
  CV: "bg-blue-500",
  CONTRACT: "bg-purple-500",
  JD: "bg-amber-500",
  PROFILE: "bg-green-500",
  TERMS: "bg-red-500",
  COVER_LETTER: "bg-pink-500",
  SCREENING: "bg-cyan-500",
  OTHER: "bg-gray-400",
};

const CATEGORY_BG: Record<string, string> = {
  GENERAL: "bg-gray-50 text-gray-600",
  CV: "bg-blue-50 text-blue-700",
  CONTRACT: "bg-purple-50 text-purple-700",
  JD: "bg-amber-50 text-amber-700",
  PROFILE: "bg-green-50 text-green-700",
  TERMS: "bg-red-50 text-red-700",
  COVER_LETTER: "bg-pink-50 text-pink-700",
  SCREENING: "bg-cyan-50 text-cyan-700",
  OTHER: "bg-gray-50 text-gray-600",
};

const FILE_TYPE_OPTIONS = [
  { value: "", label: "All Files" },
  { value: "pdf", label: "PDF" },
  { value: "docx", label: "DOCX" },
  { value: "xlsx", label: "XLSX" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];

function formatFileSize(bytes: number | null) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d";
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function getFileExt(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

// ---------------------------------------------------------------------------
// Upload Dialog
// ---------------------------------------------------------------------------

function UploadDialog({
  clients,
  candidates,
  onUploaded,
}: {
  clients: ClientOption[];
  candidates: CandidateOption[];
  onUploaded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [clientId, setClientId] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [notes, setNotes] = useState("");

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name || file.name);
      formData.append("category", category);
      if (clientId) formData.append("clientId", clientId);
      if (candidateId) formData.append("candidateId", candidateId);
      if (notes) formData.append("notes", notes);

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      if (res.ok) {
        setOpen(false);
        setFile(null);
        setName("");
        setCategory("GENERAL");
        setClientId("");
        setCandidateId("");
        setNotes("");
        onUploaded();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="h-7 text-xs px-2">
            <Upload className="size-3" />
            Upload
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">File</Label><Input type="file" className="h-8 text-xs" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); if (f && !name) setName(f.name.replace(/\.[^.]+$/, "")); }} /></div>
          <div><Label className="text-xs">Name</Label><Input className="h-8 text-xs" value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name" /></div>
          <div>
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.filter((c) => c.value).map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Client</Label>
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select client..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Candidate</Label>
            <Select value={candidateId} onValueChange={(v) => setCandidateId(v ?? "")}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select candidate..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {candidates.map((c) => (<SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs">Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} className="text-xs" /></div>
          <Button onClick={handleUpload} disabled={!file || uploading} size="sm" className="w-full">
            {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const activeFilterCount =
    (category ? 1 : 0) +
    (clientFilter ? 1 : 0) +
    (candidateFilter ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (fileTypeFilter ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "all") params.set("category", category);
      if (clientFilter && clientFilter !== "all") params.set("clientId", clientFilter);
      if (candidateFilter && candidateFilter !== "all") params.set("candidateId", candidateFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      if (fileTypeFilter) params.set("fileType", fileTypeFilter);
      if (sortBy) params.set("sortBy", sortBy);
      params.set("page", String(page));
      params.set("pageSize", "50");

      const res = await fetch(`/api/documents?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, clientFilter, candidateFilter, dateFrom, dateTo, fileTypeFilter, sortBy, page]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  useEffect(() => {
    fetch("/api/clients?pageSize=100").then((r) => r.json()).then((data) => setClients(data.clients || [])).catch(() => {});
    fetch("/api/candidates?pageSize=100").then((r) => r.json()).then((data) => setCandidates(data.candidates || [])).catch(() => {});
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) fetchDocuments();
    } catch (err) { console.error("Delete failed:", err); } finally { setDeleting(null); }
  }

  function clearAllFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setClientFilter("");
    setCandidateFilter("");
    setDateFrom("");
    setDateTo("");
    setFileTypeFilter("");
    setSortBy("newest");
    setPage(1);
  }

  const totalPages = Math.ceil(total / 50);

  // Client-side file type filter
  const filteredDocs = fileTypeFilter
    ? documents.filter((doc) => {
        const ext = getFileExt(doc.fileName);
        if (fileTypeFilter === "pdf") return ext === "pdf";
        if (fileTypeFilter === "docx") return ext === "docx" || ext === "doc";
        if (fileTypeFilter === "xlsx") return ext === "xlsx" || ext === "xls";
        return true;
      })
    : documents;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Documents</h1>
          <p className="text-[11px] text-gray-500">{total} total</p>
        </div>
        <UploadDialog clients={clients} candidates={candidates} onUploaded={fetchDocuments} />
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

          <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c.value || "all"} value={c.value || "all"}>{c.label}</SelectItem>))}</SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={(v) => { setClientFilter(!v || v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (<SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={candidateFilter} onValueChange={(v) => { setCandidateFilter(!v || v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Candidate" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              {candidates.map((c) => (<SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>))}
            </SelectContent>
          </Select>

          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-8 w-[120px] rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400" />

          <Select value={fileTypeFilter} onValueChange={(v) => { setFileTypeFilter(v === "all" ? "" : (v ?? "")); setPage(1); }}>
            <SelectTrigger className="h-8 w-[90px] text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>{FILE_TYPE_OPTIONS.map((ft) => (<SelectItem key={ft.value || "all"} value={ft.value || "all"}>{ft.label}</SelectItem>))}</SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v ?? "newest"); setPage(1); }}>
            <SelectTrigger className="h-8 w-[100px] text-xs"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>{SORT_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap">Clear All</button>
          )}
        </div>
      </div>

      {/* Document Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-5 animate-spin text-gray-400" /></div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            <FileText className="mx-auto size-8 text-gray-300 mb-1" />
            No documents found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sticky top-0 z-10 bg-white border-b border-gray-200">
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Document</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Category</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Client / Candidate</th>
                  <th className="px-3 py-1.5 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Size</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Date</th>
                  <th className="px-3 py-1.5 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`} style={{ height: "32px" }}>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <File className="size-3.5 shrink-0 text-gray-400" />
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate max-w-[200px]">{doc.name}</p>
                          <p className="text-[10px] text-gray-400">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_BG[doc.category] || "bg-gray-50 text-gray-600"}`}>
                        <span className={`size-1.5 rounded-full ${CATEGORY_DOT[doc.category] || "bg-gray-400"}`} />
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-xs text-gray-600">
                      {doc.client?.companyName && <span className="block">{doc.client.companyName}</span>}
                      {doc.candidate && <span className="block text-[10px]">{doc.candidate.firstName} {doc.candidate.lastName}</span>}
                      {!doc.client && !doc.candidate && <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-gray-500">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-3 py-1.5 text-xs text-gray-400">{formatDate(doc.createdAt)}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-0.5">
                        {doc.mimeType?.includes("pdf") && (
                          <button onClick={() => setPreviewUrl(doc.filePath)} title="Preview" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Eye className="size-3" /></button>
                        )}
                        <a href={doc.filePath} download={doc.fileName}>
                          <button title="Download" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Download className="size-3" /></button>
                        </a>
                        <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id} title="Delete" className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500">
                          {deleting === doc.id ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-3 py-2">
            <p className="text-[11px] text-gray-500">Page {page}/{totalPages} ({total})</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="rounded px-2 py-1 text-[11px] text-gray-600 hover:bg-gray-100 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) setPreviewUrl(null); }}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader><DialogTitle>Document Preview</DialogTitle></DialogHeader>
            <iframe src={previewUrl} className="w-full flex-1 rounded border" style={{ height: "calc(80vh - 80px)" }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
