"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type PaginationState,
} from "@/components/shared/data-table";

// ── Types ──────────────────────────────────────────────────────────────

interface Campaign {
  id: string;
  name: string;
  status: string;
  subject: string;
  recipientType: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  bounceCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  _count?: { logs: number };
}

// ── Status badge config ────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-blue-100 text-blue-800",
  SCHEDULED: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
  SENDING: "bg-orange-100 text-orange-800",
};

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PercentBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full bg-indigo-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{pct}%</span>
    </div>
  );
}

// ── Columns ────────────────────────────────────────────────────────────

const columns: ColumnDef<Campaign, unknown>[] = [
  {
    accessorKey: "name",
    header: "Campaign Name",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "recipients",
    header: "Recipients",
    cell: ({ row }) => (
      <span className="text-sm">{row.original._count?.logs ?? 0}</span>
    ),
  },
  {
    accessorKey: "sentCount",
    header: "Sent",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.sentCount}</span>
    ),
  },
  {
    id: "opened",
    header: "Opened",
    cell: ({ row }) => (
      <PercentBar
        value={row.original.openCount}
        total={row.original.sentCount}
      />
    ),
  },
  {
    id: "clicked",
    header: "Clicked",
    cell: ({ row }) => (
      <PercentBar
        value={row.original.clickCount}
        total={row.original.sentCount}
      />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];

// ── Main Page ──────────────────────────────────────────────────────────

export default function EmailsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/emails/campaign");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const list: Campaign[] = data.campaigns ?? [];
      setCampaigns(list);
      setPagination((prev) => ({ ...prev, total: list.length }));
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  function handlePageChange(page: number, pageSize: number) {
    setPagination((prev) => ({ ...prev, page, pageSize }));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Email Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and track email campaigns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/crm/emails/templates">
            <Button variant="outline" size="sm">
              <LayoutTemplate className="size-3.5" />
              Templates
            </Button>
          </Link>

          <Link href="/crm/emails/new">
            <Button size="sm">
              <Plus className="size-3.5" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-lg bg-white">
        <DataTable
          columns={columns}
          data={campaigns}
          pagination={pagination}
          onPaginationChange={handlePageChange}
          isLoading={isLoading}
          emptyMessage="No campaigns yet. Create your first email campaign to get started."
        />
      </div>
    </div>
  );
}
