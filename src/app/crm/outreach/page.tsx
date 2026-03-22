"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Plus,
  Send,
  Eye,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
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

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  segment: string | null;
  status: string;
  dailyLimit: number;
  startDate: string | null;
  endDate: string | null;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  totalBounced: number;
  openRate: number;
  replyRate: number;
  createdAt: string;
  updatedAt: string;
  _count: { templates: number; emails: number };
}

interface Stats {
  activeCampaigns: number;
  sentToday: number;
  overallOpenRate: number;
  overallReplyRate: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Campaign Card
// ---------------------------------------------------------------------------

function CampaignCard({
  campaign,
  onClick,
}: {
  campaign: Campaign;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {campaign.name}
          </h3>
          {campaign.segment && (
            <p className="mt-0.5 text-xs text-gray-500">{campaign.segment}</p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT}`}
        >
          {campaign.status}
        </span>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-4 gap-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-gray-400">
            <Send className="size-3" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {campaign.totalSent}
          </p>
          <p className="text-[10px] text-gray-500">Sent</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-gray-400">
            <Eye className="size-3" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {campaign.totalOpened}
          </p>
          <p className="text-[10px] text-gray-500">Opened</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-gray-400">
            <MessageSquare className="size-3" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {campaign.totalReplied}
          </p>
          <p className="text-[10px] text-gray-500">Replied</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-gray-400">
            <AlertTriangle className="size-3" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {campaign.totalBounced}
          </p>
          <p className="text-[10px] text-gray-500">Bounced</p>
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-4 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Open Rate</span>
            <span className="font-medium text-gray-700">
              {campaign.openRate}%
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${Math.min(campaign.openRate, 100)}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">Reply Rate</span>
            <span className="font-medium text-gray-700">
              {campaign.replyRate}%
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.min(campaign.replyRate * 2, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400">
        <span>{campaign._count.templates} steps</span>
        <span>
          {campaign.startDate
            ? `${formatDate(campaign.startDate)}${campaign.endDate ? ` - ${formatDate(campaign.endDate)}` : ""}`
            : formatDate(campaign.createdAt)}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function OutreachPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeCampaigns: 0,
    sentToday: 0,
    overallOpenRate: 0,
    overallReplyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchCampaigns = useCallback(async () => {
    try {
      const params = new URLSearchParams({ pageSize: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/outreach/campaigns?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCampaigns(data.campaigns);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchCampaigns();
  }, [fetchCampaigns]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="size-5 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">
            Outreach Campaigns
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : (v ?? ""))}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => router.push("/crm/outreach/inbox")}
          >
            <Inbox className="size-4" />
            Inbox
          </Button>

          <Button onClick={() => router.push("/crm/outreach/new")}>
            <Plus className="size-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Campaigns"
          value={stats.activeCampaigns}
          icon={Megaphone}
        />
        <StatCard
          label="Emails Sent Today"
          value={stats.sentToday}
          icon={Send}
        />
        <StatCard
          label="Open Rate"
          value={`${stats.overallOpenRate}%`}
          icon={Eye}
        />
        <StatCard
          label="Reply Rate"
          value={`${stats.overallReplyRate}%`}
          icon={MessageSquare}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-500" />
        </div>
      )}

      {/* Campaigns grid */}
      {!loading && campaigns.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Megaphone className="size-12 text-gray-300" />
          <h3 className="mt-4 text-sm font-medium text-gray-900">
            No campaigns yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first outreach campaign to start reaching prospects.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/crm/outreach/new")}
          >
            <Plus className="size-4" />
            New Campaign
          </Button>
        </div>
      )}

      {!loading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => router.push(`/crm/outreach/${campaign.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
