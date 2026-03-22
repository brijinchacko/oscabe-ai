"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  ArrowLeft,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
import { AVAILABLE_TOKENS } from "@/lib/email-tokens";

// ── Types ──────────────────────────────────────────────────────────────

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "job_alert", label: "Job Alert" },
  { value: "nurture", label: "Nurture" },
  { value: "client_outreach", label: "Client Outreach" },
  { value: "re_engagement", label: "Re-engagement" },
  { value: "submission", label: "Submission" },
  { value: "general", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  job_alert: "bg-blue-100 text-blue-800",
  nurture: "bg-green-100 text-green-800",
  client_outreach: "bg-purple-100 text-purple-800",
  re_engagement: "bg-orange-100 text-orange-800",
  submission: "bg-yellow-100 text-yellow-800",
  general: "bg-gray-100 text-gray-800",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Template Editor ────────────────────────────────────────────────────

interface TemplateEditorProps {
  template?: EmailTemplate | null;
  onSave: () => void;
  onClose: () => void;
}

function TemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [category, setCategory] = useState(template?.category ?? "general");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = template
        ? `/api/emails/templates/${template.id}`
        : "/api/emails/templates";
      const method = template ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body, category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save template");
      }

      toast.success(template ? "Template updated" : "Template created");
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  function copyToken(token: string) {
    navigator.clipboard.writeText(token);
    toast.success(`Copied ${token}`);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tmpl-name">Template Name *</Label>
              <Input
                id="tmpl-name"
                required
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="e.g. PLC Engineer - Job Alert"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tmpl-subject">Subject *</Label>
            <Input
              id="tmpl-subject"
              required
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSubject(e.target.value)
              }
              placeholder="e.g. {{firstName}}, we have a new role for you!"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tmpl-body">Body *</Label>
            <Textarea
              id="tmpl-body"
              required
              value={body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setBody(e.target.value)
              }
              rows={16}
              placeholder="Write your email body here. Use tokens like {{firstName}} for personalisation."
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : template
                  ? "Update Template"
                  : "Create Template"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Token reference sidebar */}
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Available Tokens
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a token to copy it to your clipboard.
          </p>
          <Separator className="my-3" />
          <div className="space-y-1.5">
            {Object.entries(AVAILABLE_TOKENS).map(([token, desc]) => (
              <button
                key={token}
                type="button"
                onClick={() => copyToken(token)}
                className="flex w-full items-start gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-gray-100"
              >
                <code className="shrink-0 rounded bg-white px-1.5 py-0.5 text-xs font-medium text-indigo-600 border">
                  {token}
                </code>
                <span className="text-xs text-muted-foreground">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EmailTemplate | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emails/templates");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function handleEdit(template: EmailTemplate) {
    setEditingTemplate(template);
    setEditorOpen(true);
  }

  function handleNew() {
    setEditingTemplate(null);
    setEditorOpen(true);
  }

  async function handleDuplicate(template: EmailTemplate) {
    try {
      const res = await fetch("/api/emails/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body: template.body,
          category: template.category,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      toast.success("Template duplicated");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to duplicate template");
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/emails/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Template deleted");
      setDeleteDialogId(null);
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
    }
  }

  if (editorOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setEditorOpen(false)}>
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {editingTemplate ? "Edit Template" : "New Template"}
          </h1>
        </div>

        <TemplateEditor
          template={editingTemplate}
          onSave={fetchTemplates}
          onClose={() => setEditorOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/crm/emails">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-3.5" />
              Campaigns
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Email Templates
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reusable email templates for campaigns and outreach
            </p>
          </div>
        </div>

        <Button size="sm" onClick={handleNew}>
          <Plus className="size-3.5" />
          New Template
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-white p-5">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-1/3 rounded bg-gray-100" />
              <div className="mt-4 h-3 w-full rounded bg-gray-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && templates.length === 0 && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border bg-white text-center">
          <Clipboard className="size-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No templates yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create reusable email templates for your campaigns and outreach.
          </p>
          <Button className="mt-4" size="sm" onClick={handleNew}>
            <Plus className="size-3.5" />
            Create your first template
          </Button>
        </div>
      )}

      {/* Template grid */}
      {!isLoading && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tmpl) => {
            const catColor =
              CATEGORY_COLORS[tmpl.category ?? ""] ?? "bg-gray-100 text-gray-800";
            return (
              <div
                key={tmpl.id}
                className="group rounded-lg border bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {tmpl.name}
                  </h3>
                  {tmpl.category && (
                    <span
                      className={`shrink-0 ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}
                    >
                      {CATEGORIES.find((c) => c.value === tmpl.category)
                        ?.label ?? tmpl.category}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
                  <span className="font-medium text-gray-600">Subject:</span>{" "}
                  {tmpl.subject}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Updated {formatDate(tmpl.updatedAt)}
                </p>

                <Separator className="my-3" />

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tmpl)}
                  >
                    <Pencil className="size-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(tmpl)}
                  >
                    <Copy className="size-3" />
                    Duplicate
                  </Button>

                  <Dialog
                    open={deleteDialogId === tmpl.id}
                    onOpenChange={(open) =>
                      setDeleteDialogId(open ? tmpl.id : null)
                    }
                  >
                    <DialogTrigger
                      render={
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      }
                    />
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete &ldquo;{tmpl.name}
                        &rdquo;? This action cannot be undone.
                      </p>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteDialogId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(tmpl.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
