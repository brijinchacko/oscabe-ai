"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileSignature,
  Send,
  Search,
  Loader2,
  CheckCircle,
  Clock,
  X,
  Building2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  content: string | null;
  createdAt: string;
  client?: { id: string; companyName: string } | null;
  user?: { id: string; firstName: string | null; lastName: string | null } | null;
}

interface ClientOption {
  id: string;
  companyName: string;
}

const CONTRACT_TYPES = [
  { value: "TERMS_CONDITIONS", label: "Terms & Conditions" },
  { value: "SERVICE_AGREEMENT", label: "Service Agreement" },
  { value: "NDA", label: "Non-Disclosure Agreement" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Send Contract Dialog
// ---------------------------------------------------------------------------

function SendContractDialog({
  clients,
  onSent,
}: {
  clients: ClientOption[];
  onSent: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [contractType, setContractType] = useState("");
  const [clientId, setClientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function reset() {
    setContractType("");
    setClientId("");
    setRecipientEmail("");
    setRecipientName("");
    setErrorMsg("");
    setSuccess(false);
  }

  async function handleSend() {
    setErrorMsg("");
    if (!contractType || !clientId || !recipientEmail || !recipientName) {
      setErrorMsg("All fields are required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contracts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractType, clientId, recipientEmail, recipientName }),
      });

      if (res.ok) {
        setSuccess(true);
        onSent();
        setTimeout(() => {
          setOpen(false);
          reset();
        }, 2000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to send");
      }
    } catch {
      setErrorMsg("Network error");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Send className="mr-2 size-4" />
            Send Contract
          </Button>
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Contract</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="size-12 text-green-500" />
            <p className="text-lg font-medium text-green-700">Contract Sent!</p>
            <p className="text-sm text-gray-500">The contract email has been sent to {recipientEmail}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Contract Template</Label>
              <Select value={contractType} onValueChange={(v) => setContractType(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Client</Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Recipient Name</Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. John Smith"
              />
            </div>
            <div>
              <Label>Recipient Email</Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. john@company.com"
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}

            <Button onClick={handleSend} disabled={sending} className="w-full">
              {sending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
              {sending ? "Sending..." : "Send Contract"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ContractsPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [search, setSearch] = useState("");

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activities?type=CONTRACT_SENT&pageSize=100");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Failed to fetch contracts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetch("/api/clients?pageSize=100")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {});
  }, [fetchContracts]);

  const filtered = search
    ? activities.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.content?.toLowerCase().includes(search.toLowerCase()) ||
          a.client?.companyName.toLowerCase().includes(search.toLowerCase())
      )
    : activities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Send and track contracts with clients
          </p>
        </div>
        <SendContractDialog clients={clients} onSent={fetchContracts} />
      </div>

      {/* Search */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search sent contracts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-sm text-gray-500">Total Sent</p>
          <p className="text-2xl font-bold">{activities.length}</p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-sm text-gray-500">T&C Sent</p>
          <p className="text-2xl font-bold">
            {activities.filter((a) => a.content?.includes("TERMS_CONDITIONS")).length}
          </p>
        </div>
        <div className="rounded-lg border bg-white px-4 py-3">
          <p className="text-sm text-gray-500">NDAs Sent</p>
          <p className="text-2xl font-bold">
            {activities.filter((a) => a.content?.includes("NDA")).length}
          </p>
        </div>
      </div>

      {/* Contract History */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold text-gray-900">Sent Contracts</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileSignature className="mx-auto size-12 text-gray-300" />
            <p className="mt-3 font-medium">No contracts sent yet</p>
            <p className="text-sm">Use the &ldquo;Send Contract&rdquo; button to send your first contract</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((activity) => {
              // Parse contract details from content
              const lines = (activity.content || "").split("\n");
              const contractType = lines.find((l) => l.startsWith("Contract type:"))?.replace("Contract type: ", "") || "";
              const recipient = lines.find((l) => l.startsWith("Recipient:"))?.replace("Recipient: ", "") || "";

              return (
                <div key={activity.id} className="flex items-center gap-4 px-4 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <FileSignature className="size-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      {activity.client && (
                        <span className="flex items-center gap-1">
                          <Building2 className="size-3" />
                          {activity.client.companyName}
                        </span>
                      )}
                      {recipient && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {recipient}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="mr-1 size-3" />
                      Sent
                    </Badge>
                    <span className="text-xs text-gray-400">{formatDate(activity.createdAt)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
