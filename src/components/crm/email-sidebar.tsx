"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Inbox,
  ArrowLeft,
  RefreshCw,
  Loader2,
  X,
  Search,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ─── Types ─────────────────────────────────────────────────────────────

interface EmailAddress {
  emailAddress: { name: string; address: string };
}

interface Email {
  id: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  date: string;
  bodyPreview: string;
  isRead: boolean;
  conversationId?: string;
}

interface ThreadMessage {
  id: string;
  subject: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: { emailAddress: { name: string; address: string } }[];
  receivedDateTime: string;
  bodyPreview: string;
  body?: { content: string; contentType: string };
  isRead: boolean;
}

type View = "list" | "compose" | "thread";

// ─── Email Sidebar ─────────────────────────────────────────────────────

export function EmailSidebar({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>("list");
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  // Compose state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendVia, setSendVia] = useState<"resend" | "outlook">("outlook");
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [microsoftEmail, setMicrosoftEmail] = useState<string | null>(null);

  // Fetch Microsoft connection status
  useEffect(() => {
    async function fetchMicrosoftStatus() {
      try {
        const res = await fetch("/api/user/me");
        if (res.ok) {
          const data = await res.json();
          setMicrosoftConnected(data.microsoftConnected ?? false);
          setMicrosoftEmail(data.microsoftEmail ?? null);
          // Default to outlook if connected, otherwise resend
          if (!data.microsoftConnected) setSendVia("resend");
        }
      } catch {
        setSendVia("resend");
      }
    }
    fetchMicrosoftStatus();
  }, []);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ top: "10" });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/microsoft/emails?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  async function openThread(email: Email) {
    setSelectedEmail(email);
    setView("thread");
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/microsoft/emails?search=${encodeURIComponent(email.subject)}&top=20`);
      if (res.ok) {
        const data = await res.json();
        setThread(
          (data.emails || []).map((e: Email) => ({
            id: e.id,
            subject: e.subject,
            from: e.from,
            toRecipients: e.to,
            receivedDateTime: e.date,
            bodyPreview: e.bodyPreview,
            isRead: e.isRead,
          }))
        );
      }
    } catch {
      toast.error("Failed to load thread");
    } finally {
      setThreadLoading(false);
    }
  }

  async function handleSend() {
    if (!composeTo || !composeSubject || !composeBody) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      // Use the unified send endpoint with sendVia
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          sendVia,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Send failed");
      }
      const viaLabel = sendVia === "outlook" ? " via Outlook" : "";
      toast.success(`Email sent${viaLabel}`);
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      setView("list");
      fetchEmails();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60 * 60 * 1000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 px-3">
        {view === "list" && (
          <>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-900">Outlook</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setView("compose")}
                title="Compose"
              >
                <Send className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={fetchEmails}
                title="Refresh"
              >
                <RefreshCw className="size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={onClose} title="Close">
                <X className="size-3.5" />
              </Button>
            </div>
          </>
        )}
        {view === "compose" && (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setView("list")}
              >
                <ArrowLeft className="size-3.5" />
              </Button>
              <span className="text-sm font-semibold text-gray-900">
                New Email
              </span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-3.5" />
            </Button>
          </>
        )}
        {view === "thread" && (
          <>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setView("list");
                  setSelectedEmail(null);
                }}
              >
                <ArrowLeft className="size-3.5" />
              </Button>
              <span className="truncate text-sm font-semibold text-gray-900 max-w-[200px]">
                {selectedEmail?.subject || "Thread"}
              </span>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Email List View */}
        {view === "list" && (
          <div>
            {/* Search */}
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search emails..."
                  className="h-7 pl-7 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Inbox className="size-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400">No emails found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => openThread(email)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors ${
                      !email.isRead ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!email.isRead && (
                        <Circle className="mt-1.5 size-2 shrink-0 fill-blue-500 text-blue-500" />
                      )}
                      <div className={`flex-1 min-w-0 ${email.isRead ? "ml-4" : ""}`}>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`truncate text-xs ${!email.isRead ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                            {email.from?.emailAddress?.name || email.from?.emailAddress?.address || "Unknown"}
                          </span>
                          <span className="shrink-0 text-[10px] text-gray-400">
                            {formatDate(email.date)}
                          </span>
                        </div>
                        <p className={`truncate text-xs mt-0.5 ${!email.isRead ? "font-medium text-gray-800" : "text-gray-600"}`}>
                          {email.subject || "(No Subject)"}
                        </p>
                        <p className="truncate text-[10px] text-gray-400 mt-0.5">
                          {email.bodyPreview}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Compose View */}
        {view === "compose" && (
          <div className="p-3 space-y-3">
            {/* Send from selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Send from</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSendVia("resend")}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors ${
                    sendVia === "resend"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  OSCABE
                </button>
                <button
                  type="button"
                  onClick={() => microsoftConnected && setSendVia("outlook")}
                  disabled={!microsoftConnected}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] font-medium transition-colors ${
                    sendVia === "outlook"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : microsoftConnected
                        ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                  }`}
                  title={microsoftConnected ? (microsoftEmail || "Outlook") : "Connect Microsoft account in Settings"}
                >
                  Outlook {microsoftEmail ? `(${microsoftEmail.split("@")[0]})` : ""}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                placeholder="recipient@example.com"
                className="h-8 text-xs"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
              <Input
                placeholder="Email subject"
                className="h-8 text-xs"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message</Label>
              <Textarea
                placeholder="Write your email..."
                className="min-h-[150px] text-xs"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send Email
            </Button>
          </div>
        )}

        {/* Thread View */}
        {view === "thread" && (
          <div>
            {threadLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {thread.map((msg) => (
                  <div key={msg.id} className="px-3 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">
                        {msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || "Unknown"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(msg.receivedDateTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-[10px] text-gray-400">To:</span>
                      {(msg.toRecipients || []).map((r, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1 py-0">
                          {r.emailAddress?.name || r.emailAddress?.address}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {msg.body?.content || msg.bodyPreview}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
