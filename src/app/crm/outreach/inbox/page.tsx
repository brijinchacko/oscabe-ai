"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  Sparkles,
  UserPlus,
  StickyNote,
  Reply,
  Building2,
  MapPin,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InboxReply {
  id: string;
  subject: string | null;
  body: string;
  receivedAt: string;
  sentiment: string | null;
  aiClassification: string | null;
  isRead: boolean;
  notes: string | null;
  prospect: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
    jobTitle: string | null;
  };
  email: {
    id: string;
    subject: string | null;
    campaignId: string;
    campaign: {
      id: string;
      name: string;
    };
  } | null;
}

interface ReplyDetail {
  reply: InboxReply & {
    prospect: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      company: string | null;
      jobTitle: string | null;
      industry: string | null;
      location: string | null;
      linkedIn: string | null;
      status: string;
    };
  };
  thread: {
    id: string;
    subject: string | null;
    body: string | null;
    sequenceStep: number;
    status: string;
    sentAt: string | null;
    openedAt: string | null;
    repliedAt: string | null;
  }[];
  prospectReplies: {
    id: string;
    subject: string | null;
    body: string;
    receivedAt: string;
    sentiment: string | null;
  }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SENTIMENT_COLORS: Record<string, string> = {
  INTERESTED: "bg-emerald-100 text-emerald-700",
  NOT_INTERESTED: "bg-red-100 text-red-700",
  OOO: "bg-gray-100 text-gray-700",
  WRONG_PERSON: "bg-orange-100 text-orange-700",
  MEETING_REQUEST: "bg-purple-100 text-purple-700",
};

const SENTIMENTS = [
  { value: "ALL", label: "All Sentiments" },
  { value: "INTERESTED", label: "Interested" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "OOO", label: "Out of Office" },
  { value: "WRONG_PERSON", label: "Wrong Person" },
  { value: "MEETING_REQUEST", label: "Meeting Request" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Reply List Item
// ---------------------------------------------------------------------------

function ReplyListItem({
  reply,
  isSelected,
  onClick,
}: {
  reply: InboxReply;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full border-b border-gray-100 px-4 py-3 text-left transition-colors ${
        isSelected
          ? "bg-indigo-50"
          : reply.isRead
            ? "bg-white hover:bg-gray-50"
            : "bg-blue-50/30 hover:bg-blue-50/50"
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Unread dot */}
        <div className="mt-1.5 shrink-0">
          {!reply.isRead && (
            <div className="size-2 rounded-full bg-indigo-500" />
          )}
          {reply.isRead && <div className="size-2" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`truncate text-sm ${
                reply.isRead
                  ? "text-gray-700"
                  : "font-semibold text-gray-900"
              }`}
            >
              {reply.prospect.firstName} {reply.prospect.lastName}
            </p>
            <span className="shrink-0 text-[10px] text-gray-400">
              {timeAgo(reply.receivedAt)}
            </span>
          </div>

          {reply.prospect.company && (
            <p className="truncate text-xs text-gray-500">
              {reply.prospect.company}
            </p>
          )}

          <p className="mt-0.5 truncate text-xs text-gray-400">
            {reply.subject || "(no subject)"}
          </p>

          <div className="mt-1.5 flex items-center gap-1.5">
            {reply.sentiment && (
              <span
                className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${SENTIMENT_COLORS[reply.sentiment] || ""}`}
              >
                {reply.sentiment.replace(/_/g, " ")}
              </span>
            )}
            {reply.email?.campaign && (
              <span className="truncate rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
                {reply.email.campaign.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Reply Detail Panel
// ---------------------------------------------------------------------------

function ReplyDetailPanel({
  detail,
  onRefresh,
}: {
  detail: ReplyDetail;
  onRefresh: () => void;
}) {
  const [classifying, setClassifying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(detail.reply.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  const prospect = detail.reply.prospect;

  async function markRead() {
    if (detail.reply.isRead) return;
    try {
      await fetch(`/api/outreach/inbox/${detail.reply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      onRefresh();
    } catch {
      // silent
    }
  }

  // Auto-mark read on view
  useEffect(() => {
    markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.reply.id]);

  async function classifyWithAI() {
    setClassifying(true);
    try {
      const res = await fetch("/api/outreach/inbox/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyId: detail.reply.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        `Classified as ${data.classification.sentiment.replace(/_/g, " ")}`
      );
      onRefresh();
    } catch {
      toast.error("Failed to classify reply");
    } finally {
      setClassifying(false);
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await fetch(`/api/outreach/inbox/${detail.reply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      toast.success("Notes saved");
      setShowNotes(false);
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  async function setSentiment(sentiment: string) {
    try {
      await fetch(`/api/outreach/inbox/${detail.reply.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentiment }),
      });
      toast.success("Sentiment updated");
      onRefresh();
    } catch {
      toast.error("Failed to update sentiment");
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-3">
        {!detail.reply.isRead && (
          <Button variant="outline" size="xs" onClick={markRead}>
            <MailOpen className="size-3" />
            Mark Read
          </Button>
        )}
        <Button
          variant="outline"
          size="xs"
          onClick={classifyWithAI}
          disabled={classifying}
        >
          {classifying ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          Classify with AI
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowNotes(!showNotes)}
        >
          <StickyNote className="size-3" />
          Add Note
        </Button>

        <div className="ml-auto">
          <Select
            value={detail.reply.sentiment || ""}
            onValueChange={(v) => setSentiment(v ?? "")}
          >
            <SelectTrigger className="h-7 w-40 text-xs">
              <SelectValue placeholder="Set sentiment" />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENTS.filter((s) => s.value !== "ALL").map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes area */}
      {showNotes && (
        <div className="border-b border-gray-200 bg-yellow-50 px-4 py-3">
          <Textarea
            className="bg-white"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Add notes about this reply..."
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowNotes(false)}
            >
              Cancel
            </Button>
            <Button size="xs" onClick={saveNotes} disabled={savingNotes}>
              {savingNotes && <Loader2 className="size-3 animate-spin" />}
              Save Notes
            </Button>
          </div>
        </div>
      )}

      {/* Reply body */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Prospect info card */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {prospect.firstName} {prospect.lastName}
              </p>
              <p className="text-xs text-gray-500">{prospect.email}</p>
            </div>
            {prospect.linkedIn && (
              <a
                href={prospect.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-600"
              >
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            {prospect.jobTitle && (
              <span className="flex items-center gap-1">
                <Briefcase className="size-3" />
                {prospect.jobTitle}
              </span>
            )}
            {prospect.company && (
              <span className="flex items-center gap-1">
                <Building2 className="size-3" />
                {prospect.company}
              </span>
            )}
            {prospect.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {prospect.location}
              </span>
            )}
          </div>
        </div>

        {/* The reply */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">
              {prospect.firstName} {prospect.lastName}
            </p>
            <span className="text-xs text-gray-400">
              {formatDateTime(detail.reply.receivedAt)}
            </span>
            {detail.reply.sentiment && (
              <span
                className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${SENTIMENT_COLORS[detail.reply.sentiment] || ""}`}
              >
                {detail.reply.sentiment.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {detail.reply.subject && (
            <p className="mt-1 text-sm font-medium text-gray-700">
              {detail.reply.subject}
            </p>
          )}
          <div className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
            {detail.reply.body}
          </div>
        </div>

        {/* Email thread */}
        {detail.thread.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Email Thread
            </h4>
            <div className="space-y-3">
              {detail.thread.map((email) => (
                <div
                  key={email.id}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                        {email.sequenceStep}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        Step {email.sequenceStep}
                      </span>
                      <span
                        className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                          email.status === "SENT"
                            ? "bg-blue-100 text-blue-700"
                            : email.status === "OPENED"
                              ? "bg-indigo-100 text-indigo-700"
                              : email.status === "REPLIED"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {email.status}
                      </span>
                    </div>
                    {email.sentAt && (
                      <span className="text-[10px] text-gray-400">
                        {formatDateTime(email.sentAt)}
                      </span>
                    )}
                  </div>
                  {email.subject && (
                    <p className="mt-1 text-xs font-medium text-gray-600">
                      {email.subject}
                    </p>
                  )}
                  {email.body && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-gray-500">
                      {email.body.length > 200
                        ? email.body.slice(0, 200) + "..."
                        : email.body}
                    </p>
                  )}
                </div>
              ))}

              {/* Show prospect replies inline */}
              {detail.prospectReplies.map((pr) => (
                <div
                  key={pr.id}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Reply className="size-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">
                        Reply from {prospect.firstName}
                      </span>
                      {pr.sentiment && (
                        <span
                          className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${SENTIMENT_COLORS[pr.sentiment] || ""}`}
                        >
                          {pr.sentiment.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {formatDateTime(pr.receivedAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-gray-600">
                    {pr.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function InboxPage() {
  const router = useRouter();
  const [replies, setReplies] = useState<InboxReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReplyDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filters
  const [readFilter, setReadFilter] = useState("ALL"); // ALL, UNREAD
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  const fetchReplies = useCallback(async () => {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (readFilter === "UNREAD") params.set("isRead", "false");
      if (sentimentFilter !== "ALL") params.set("sentiment", sentimentFilter);
      const res = await fetch(`/api/outreach/inbox?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReplies(data.replies);
      setUnreadCount(data.unreadCount);
    } catch {
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, [readFilter, sentimentFilter]);

  useEffect(() => {
    setLoading(true);
    fetchReplies();
  }, [fetchReplies]);

  async function selectReply(id: string) {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/outreach/inbox/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDetail(data);
    } catch {
      toast.error("Failed to load reply");
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleRefresh() {
    fetchReplies();
    if (selectedId) {
      selectReply(selectedId);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/crm/outreach")}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Inbox className="size-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">Unified Inbox</h1>
          {unreadCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Read filter */}
          <div className="flex rounded-lg border border-gray-200 bg-white">
            <button
              onClick={() => setReadFilter("ALL")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                readFilter === "ALL"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setReadFilter("UNREAD")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                readFilter === "UNREAD"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Unread
            </button>
          </div>

          {/* Sentiment filter */}
          <Select
            value={sentimentFilter}
            onValueChange={(v) => setSentimentFilter(v ?? "")}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Two-panel layout */}
      {!loading && (
        <div className="flex flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Left panel - reply list */}
          <div className="w-1/3 shrink-0 overflow-y-auto border-r border-gray-200">
            {replies.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <Mail className="size-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No replies yet.</p>
              </div>
            ) : (
              replies.map((reply) => (
                <ReplyListItem
                  key={reply.id}
                  reply={reply}
                  isSelected={selectedId === reply.id}
                  onClick={() => selectReply(reply.id)}
                />
              ))
            )}
          </div>

          {/* Right panel - detail */}
          <div className="flex-1 overflow-hidden">
            {loadingDetail && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-6 animate-spin text-indigo-500" />
              </div>
            )}

            {!loadingDetail && !detail && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Inbox className="size-12 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Select a reply to view details
                </p>
              </div>
            )}

            {!loadingDetail && detail && (
              <ReplyDetailPanel detail={detail} onRefresh={handleRefresh} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
