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
import { Badge } from "@/components/ui/badge";
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

interface ClientOption {
  id: string;
  companyName: string;
}

interface CandidateOption {
  id: string;
  firstName: string;
  lastName: string;
}

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

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  CV: "bg-blue-100 text-blue-700",
  CONTRACT: "bg-purple-100 text-purple-700",
  JD: "bg-amber-100 text-amber-700",
  PROFILE: "bg-green-100 text-green-700",
  TERMS: "bg-red-100 text-red-700",
  COVER_LETTER: "bg-pink-100 text-pink-700",
  SCREENING: "bg-cyan-100 text-cyan-700",
  OTHER: "bg-gray-100 text-gray-700",
};

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
          <Button>
            <Upload className="mr-2 size-4" />
            Upload Document
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>File</Label>
            <Input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
              }}
            />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Document name" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c.value).map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Client (optional)</Label>
            <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select client..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Candidate (optional)</Label>
            <Select value={candidateId} onValueChange={(v) => setCandidateId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select candidate..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {candidates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
            />
          </div>
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
            {uploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [candidateFilter, setCandidateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (clientFilter) params.set("clientId", clientFilter);
      if (candidateFilter) params.set("candidateId", candidateFilter);
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
  }, [search, category, clientFilter, candidateFilter, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Load clients and candidates for filters
  useEffect(() => {
    fetch("/api/clients?pageSize=100")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {});
    fetch("/api/candidates?pageSize=100")
      .then((r) => r.json())
      .then((data) => setCandidates(data.candidates || []))
      .catch(() => {});
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this document? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all documents, CVs, contracts, and job descriptions
          </p>
        </div>
        <UploadDialog clients={clients} candidates={candidates} onUploaded={fetchDocuments} />
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by filename..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v ?? ""); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value || "all"} value={c.value || "all"}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={clientFilter} onValueChange={(v) => { setClientFilter(!v || v === "all" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(search || category || clientFilter || candidateFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategory("");
                setClientFilter("");
                setCandidateFilter("");
                setPage(1);
              }}
            >
              <X className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-sm text-gray-500">Total Documents</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      {/* Document List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="mx-auto size-12 text-gray-300" />
            <p className="mt-3 font-medium">No documents found</p>
            <p className="text-sm">Upload documents or run the data import</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-gray-600">
                  <th className="px-4 py-3 font-medium">Document</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Client / Candidate</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <File className="size-5 shrink-0 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className={CATEGORY_COLORS[doc.category] || ""}>
                        {doc.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {doc.client?.companyName && (
                        <span className="block">{doc.client.companyName}</span>
                      )}
                      {doc.candidate && (
                        <span className="block text-xs">
                          {doc.candidate.firstName} {doc.candidate.lastName}
                        </span>
                      )}
                      {doc.job && (
                        <span className="block text-xs text-gray-400">{doc.job.title}</span>
                      )}
                      {!doc.client && !doc.candidate && !doc.job && (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatFileSize(doc.fileSize)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {doc.mimeType?.includes("pdf") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewUrl(doc.filePath)}
                            title="Preview"
                          >
                            <Eye className="size-4" />
                          </Button>
                        )}
                        <a href={doc.filePath} download={doc.fileName}>
                          <Button variant="ghost" size="sm" title="Download">
                            <Download className="size-4" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deleting === doc.id}
                          title="Delete"
                        >
                          {deleting === doc.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4 text-red-500" />
                          )}
                        </Button>
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
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} documents)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) setPreviewUrl(null); }}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            <iframe src={previewUrl} className="w-full flex-1 rounded border" style={{ height: "calc(80vh - 80px)" }} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
