"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Loader2,
  MessageSquare,
  Clock,
  ExternalLink,
  Reply,
  BookmarkPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────

interface TimelineItem {
  id: string;
  kind: "email" | "activity";
  date: string;
  subject?: string;
  fromEmail?: string | null;
  fromName?: string | null;
  toEmail?: string;
  toName?: string | null;
  bodyPreview?: string | null;
  direction?: string;
  microsoftMessageId?: string | null;
  type?: string;
  title?: string;
  content?: string | null;
  user?: { firstName: string | null; lastName: string | null; email: string } | null;
}

interface EmailHistoryProps {
  candidateId?: string;
  clientId?: string;
  contactEmail?: string;
  onComposeReply?: (to: string, subject: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ──────────────────────────────────────────────────────────

export function EmailHistory({
  candidateId,
  clientId,
  contactEmail,
  onComposeReply,
}: EmailHistoryProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [viewEmail, setViewEmail] = useState<TimelineItem | null>(null);
  const [loggingId, setLoggingId] = useState<string | null>(null);

  const entityType = candidateId ? "candidates" : "clients";
  const entityId = candidateId || clientId;

  const fetchEmails = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/${entityType}/${entityId}/emails`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
        setEmailCount(data.emailCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Auto-sync on mount
  useEffect(() => {
    if (!entityId) return;
    let cancelled = false;

    async function autoSync() {
      setSyncing(true);
      try {
        await fetch("/api/microsoft/emails/sync", { method: "POST" });
        if (!cancelled) {
          await fetchEmails();
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }

    autoSync();
    return () => {
      cancelled = true;
    };
  }, [entityId, fetchEmails]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/microsoft/emails/sync", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          `Synced ${data.synced} emails (${data.linked.candidates} candidates, ${data.linked.clients} clients linked)`
        );
        await fetchEmails();
      } else {
        toast.error("Sync failed");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleLogAsActivity(item: TimelineItem) {
    if (!entityId || item.kind !== "email") return;
    setLoggingId(item.id);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EMAIL_LOGGED",
          title: `Email logged: ${item.subject || "(No Subject)"}`,
          content: `${item.direction === "sent" ? "To" : "From"}: ${item.fromName || item.fromEmail || "Unknown"}\n${item.bodyPreview || ""}`,
          candidateId: candidateId || undefined,
          clientId: clientId || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Email logged as activity");
        await fetchEmails();
      } else {
        toast.error("Failed to log activity");
      }
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setLoggingId(null);
    }
  }

  function handleReply(item: TimelineItem) {
    if (!item.fromEmail) return;
    const replyTo =
      item.direction === "sent" ? item.toEmail || "" : item.fromEmail;
    const replySubject = item.subject?.startsWith("Re:")
      ? item.subject
      : `Re: ${item.subject || ""}`;

    if (onComposeReply) {
      onComposeReply(replyTo, replySubject);
    } else {
      // Fallback: open mailto
      window.location.href = `mailto:${replyTo}?subject=${encodeURIComponent(replySubject)}`;
    }
  }

  // ── Empty state ──────────────────────────────────────────────────────

  if (loading && timeline.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">
            Email History
          </h3>
          {emailCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {emailCount} emails
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Sync Now
        </Button>
      </div>

      {/* Syncing indicator */}
      {syncing && timeline.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
          <Loader2 className="size-3 animate-spin" />
          Syncing emails...
        </div>
      )}

      {/* Empty state */}
      {timeline.length === 0 && !loading && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <Mail className="mx-auto size-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            No email history. Connect Microsoft 365 to sync.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {contactEmail
              ? `Looking for emails matching ${contactEmail}`
              : "Emails will appear here after syncing"}
          </p>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="space-y-0">
          {timeline.map((item, idx) => (
            <div key={item.id} className="flex gap-2.5">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${
                    item.kind === "email"
                      ? item.direction === "sent"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                      : "border-purple-200 bg-purple-50"
                  }`}
                >
                  {item.kind === "email" ? (
                    item.direction === "sent" ? (
                      <ArrowUpRight className="size-3.5 text-blue-600" />
                    ) : (
                      <ArrowDownLeft className="size-3.5 text-gray-600" />
                    )
                  ) : (
                    <MessageSquare className="size-3.5 text-purple-600" />
                  )}
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-px flex-1 bg-gray-200" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-4">
                {item.kind === "email" ? (
                  <div
                    className={`rounded-md border p-2.5 ${
                      item.direction === "sent"
                        ? "border-blue-100 bg-blue-50/50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-900">
                          {item.subject || "(No Subject)"}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {item.direction === "sent" ? (
                            <>
                              <span className="font-medium text-blue-600">Sent</span>
                              {" to "}
                              {item.toName || item.toEmail || "Unknown"}
                            </>
                          ) : (
                            <>
                              <span className="font-medium text-gray-700">From</span>
                              {" "}
                              {item.fromName || item.fromEmail || "Unknown"}
                            </>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {formatDateShort(item.date)}
                      </span>
                    </div>

                    {item.bodyPreview && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-gray-500 leading-relaxed">
                        {item.bodyPreview}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-2 flex items-center gap-1">
                      <button
                        onClick={() => handleReply(item)}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Reply className="size-3" />
                        Reply
                      </button>
                      <button
                        onClick={() => handleLogAsActivity(item)}
                        disabled={loggingId === item.id}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                      >
                        {loggingId === item.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <BookmarkPlus className="size-3" />
                        )}
                        Log as Activity
                      </button>
                      <button
                        onClick={() => setViewEmail(item)}
                        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <ExternalLink className="size-3" />
                        View Full
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-0.5">
                    <p className="text-xs font-medium text-gray-700">
                      {item.title}
                    </p>
                    {item.content && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.content}
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Clock className="size-2.5" />
                      {formatDate(item.date)}
                      {item.user && (
                        <>
                          {" - "}
                          {item.user.firstName} {item.user.lastName}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Full Email Dialog */}
      <Dialog open={!!viewEmail} onOpenChange={(open) => !open && setViewEmail(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {viewEmail?.subject || "(No Subject)"}
            </DialogTitle>
          </DialogHeader>
          {viewEmail && (
            <div className="space-y-3">
              <div className="grid gap-1.5 text-xs">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-12">From:</span>
                  <span className="text-gray-900">
                    {viewEmail.fromName
                      ? `${viewEmail.fromName} <${viewEmail.fromEmail}>`
                      : viewEmail.fromEmail || "Unknown"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-12">To:</span>
                  <span className="text-gray-900">
                    {viewEmail.toName
                      ? `${viewEmail.toName} <${viewEmail.toEmail}>`
                      : viewEmail.toEmail || "Unknown"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-12">Date:</span>
                  <span className="text-gray-900">{formatDate(viewEmail.date)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-12">Dir:</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      viewEmail.direction === "sent"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {viewEmail.direction === "sent" ? "Sent" : "Received"}
                  </Badge>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {viewEmail.bodyPreview || "No preview available."}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleReply(viewEmail);
                    setViewEmail(null);
                  }}
                >
                  <Reply className="size-3.5" />
                  Reply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewEmail(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
