"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Users,
  Building2,
  Briefcase,
  UserCircle,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StatusData {
  configured: boolean;
  localCounts: Record<string, number>;
  zohoCounts: Record<string, number | null>;
}

interface SyncResult {
  module: string;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  duration: number;
}

interface PreviewRecord {
  [key: string]: unknown;
}

interface SyncHistoryItem {
  module: string;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  duration: number;
  status: "success" | "error";
  timestamp: string;
}

const MODULES = [
  { key: "candidates", label: "Candidates", icon: Users, zohoModule: "Candidates", color: "bg-blue-50 text-blue-700" },
  { key: "clients", label: "Clients", icon: Building2, zohoModule: "Clients", color: "bg-emerald-50 text-emerald-700" },
  { key: "contacts", label: "Contacts", icon: UserCircle, zohoModule: "Contacts", color: "bg-purple-50 text-purple-700" },
  { key: "jobs", label: "Jobs", icon: Briefcase, zohoModule: "JobOpenings", color: "bg-amber-50 text-amber-700" },
] as const;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function ZohoSyncPage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [syncAll, setSyncAll] = useState(false);
  const [fullSync, setFullSync] = useState<Record<string, boolean>>({});
  const [previews, setPreviews] = useState<Record<string, PreviewRecord[]>>({});
  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});
  const [previewLoading, setPreviewLoading] = useState<Record<string, boolean>>({});
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);

  /* ---------------------------------------------------------------- */
  /*  Fetch status                                                     */
  /* ---------------------------------------------------------------- */

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/zoho/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      toast.error("Failed to fetch Zoho status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  /* ---------------------------------------------------------------- */
  /*  Preview                                                          */
  /* ---------------------------------------------------------------- */

  async function handlePreview(moduleKey: string) {
    if (previewOpen[moduleKey]) {
      setPreviewOpen((prev) => ({ ...prev, [moduleKey]: false }));
      return;
    }

    setPreviewLoading((prev) => ({ ...prev, [moduleKey]: true }));
    try {
      const res = await fetch(`/api/zoho/sync/${moduleKey}`);
      if (!res.ok) throw new Error("Failed to fetch preview");
      const data = await res.json();
      setPreviews((prev) => ({ ...prev, [moduleKey]: data.records }));
      setPreviewOpen((prev) => ({ ...prev, [moduleKey]: true }));
    } catch {
      toast.error(`Failed to preview ${moduleKey}`);
    } finally {
      setPreviewLoading((prev) => ({ ...prev, [moduleKey]: false }));
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Sync single module                                               */
  /* ---------------------------------------------------------------- */

  async function handleSync(moduleKey: string) {
    setSyncing((prev) => ({ ...prev, [moduleKey]: true }));
    const startTime = new Date().toISOString();

    try {
      const res = await fetch("/api/zoho/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: moduleKey, fullSync: !!fullSync[moduleKey] }),
      });

      if (!res.ok) throw new Error("Sync request failed");

      const data = await res.json();
      const result: SyncResult = data.results[0];

      setSyncHistory((prev) => [
        {
          module: moduleKey,
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
          errors: result.errors.length,
          duration: result.duration,
          status: result.errors.length > 0 ? "error" : "success",
          timestamp: startTime,
        },
        ...prev,
      ]);

      toast.success(
        `${moduleKey}: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
      );

      // Refresh status counts
      fetchStatus();
    } catch {
      toast.error(`Failed to sync ${moduleKey}`);
      setSyncHistory((prev) => [
        {
          module: moduleKey,
          created: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
          duration: 0,
          status: "error",
          timestamp: startTime,
        },
        ...prev,
      ]);
    } finally {
      setSyncing((prev) => ({ ...prev, [moduleKey]: false }));
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Sync all modules                                                 */
  /* ---------------------------------------------------------------- */

  async function handleSyncAll() {
    setSyncAll(true);
    const startTime = new Date().toISOString();

    try {
      const res = await fetch("/api/zoho/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ module: "all", fullSync: false }),
      });

      if (!res.ok) throw new Error("Sync all failed");

      const data = await res.json();
      const results: SyncResult[] = data.results;

      let totalCreated = 0;
      let totalUpdated = 0;

      for (const result of results) {
        totalCreated += result.created;
        totalUpdated += result.updated;

        setSyncHistory((prev) => [
          {
            module: result.module,
            created: result.created,
            updated: result.updated,
            skipped: result.skipped,
            errors: result.errors.length,
            duration: result.duration,
            status: result.errors.length > 0 ? "error" : "success",
            timestamp: startTime,
          },
          ...prev,
        ]);
      }

      toast.success(`Sync complete: ${totalCreated} created, ${totalUpdated} updated`);
      fetchStatus();
    } catch {
      toast.error("Failed to sync all modules");
    } finally {
      setSyncAll(false);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isAnySyncing = Object.values(syncing).some(Boolean) || syncAll;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Zoho Recruit Sync</h1>
          <p className="text-sm text-gray-500">
            Import and synchronize records from Zoho Recruit into OSCABE
          </p>
        </div>
        <Button
          onClick={handleSyncAll}
          disabled={isAnySyncing || !status?.configured}
          className="gap-2"
        >
          {syncAll ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync All Modules
        </Button>
      </div>

      {/* Connection status card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          {status?.configured ? (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-green-50">
                <Wifi className="size-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Zoho Recruit Connected</p>
                <p className="text-sm text-gray-500">
                  API credentials configured. Ready to sync records.
                </p>
              </div>
              <Badge className="ml-auto bg-green-50 text-green-700 hover:bg-green-50">Connected</Badge>
            </>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-50">
                <WifiOff className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Zoho Recruit Not Configured</p>
                <p className="text-sm text-gray-500">
                  Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN environment
                  variables. Using mock data for preview.
                </p>
              </div>
              <Badge className="ml-auto bg-amber-50 text-amber-700 hover:bg-amber-50">Mock Mode</Badge>
            </>
          )}
        </div>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {MODULES.map((mod) => {
          const isSyncing = !!syncing[mod.key];
          const Icon = mod.icon;

          return (
            <div key={mod.key} className="rounded-lg border border-gray-200 bg-white p-5">
              {/* Module header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex size-10 items-center justify-center rounded-lg ${mod.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{mod.label}</h3>
                  <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                    <span>
                      OSCABE: <strong>{status?.localCounts[mod.key] ?? 0}</strong>
                    </span>
                    {status?.zohoCounts[mod.key] !== null && (
                      <span>
                        Zoho: <strong>{status?.zohoCounts[mod.key]}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full sync toggle */}
              <div className="flex items-center justify-between mb-4 rounded-md bg-gray-50 px-3 py-2">
                <span className="text-xs text-gray-600">Full sync (update existing)</span>
                <Switch
                  checked={!!fullSync[mod.key]}
                  onCheckedChange={(v) =>
                    setFullSync((prev) => ({ ...prev, [mod.key]: v }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handlePreview(mod.key)}
                  disabled={previewLoading[mod.key]}
                >
                  {previewLoading[mod.key] ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : previewOpen[mod.key] ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <Eye className="size-3.5" />
                  )}
                  {previewOpen[mod.key] ? "Hide" : "Preview"}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => handleSync(mod.key)}
                  disabled={isSyncing || isAnySyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )}
                  Sync Now
                </Button>
              </div>

              {/* Preview table */}
              {previewOpen[mod.key] && previews[mod.key] && (
                <div className="mt-4 max-h-60 overflow-auto rounded-md border border-gray-100">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-gray-500">
                        {Object.keys(previews[mod.key][0] || {}).map((key) => (
                          <th key={key} className="px-2 py-1.5 font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previews[mod.key].map((record, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          {Object.values(record).map((val, j) => (
                            <td key={j} className="px-2 py-1.5 text-gray-700 max-w-[150px] truncate">
                              {String(val ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previews[mod.key].length === 0 && (
                    <p className="p-4 text-center text-xs text-gray-400">No records found</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sync history */}
      {syncHistory.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
            <RotateCcw className="size-4 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Sync History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                  <th className="px-4 py-2 font-medium">Module</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium">Updated</th>
                  <th className="px-4 py-2 font-medium">Skipped</th>
                  <th className="px-4 py-2 font-medium">Errors</th>
                  <th className="px-4 py-2 font-medium">Duration</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2 font-medium capitalize text-gray-900">
                      {item.module}
                    </td>
                    <td className="px-4 py-2 text-green-600">+{item.created}</td>
                    <td className="px-4 py-2 text-blue-600">{item.updated}</td>
                    <td className="px-4 py-2 text-gray-400">{item.skipped}</td>
                    <td className="px-4 py-2">
                      {item.errors > 0 ? (
                        <span className="text-red-600">{item.errors}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {item.duration > 1000
                        ? `${(item.duration / 1000).toFixed(1)}s`
                        : `${item.duration}ms`}
                    </td>
                    <td className="px-4 py-2">
                      {item.status === "success" ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="size-3.5" />
                          <span className="text-xs">OK</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertCircle className="size-3.5" />
                          <span className="text-xs">Error</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
