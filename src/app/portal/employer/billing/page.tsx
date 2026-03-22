"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Download,
  Loader2,
  AlertCircle,
  Crown,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Subscription {
  tier: string;
  status: string;
  currentPeriodEnd: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}

export default function EmployerBillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchBilling() {
      try {
        const res = await fetch("/api/portal/employer/billing");
        if (!res.ok) throw new Error("Failed to fetch billing info");
        const data = await res.json();
        setSubscription(data.subscription ?? null);
        setInvoices(data.invoices ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchBilling();
  }, []);

  async function handleCancelSubscription() {
    setCancelling(true);
    try {
      // TODO: Wire up to real cancellation endpoint
      toast.success(
        "Subscription cancellation is not yet configured. Please contact support."
      );
      setCancelDialogOpen(false);
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency.toUpperCase() === "GBP" ? "\u00a3" : "$";
    return `${symbol}${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="size-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your subscription and view invoices
        </p>
      </div>

      {/* Subscription card */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#4540DB]/20 p-2.5">
            <Crown className="size-5 text-[#4540DB]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Subscription</h2>
        </div>

        {subscription ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-400">Current Plan</p>
                <p className="mt-0.5 text-lg font-semibold text-white">
                  {subscription.tier}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <span
                  className={`mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    subscription.status === "active"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-yellow-400/10 text-yellow-400"
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Renews</p>
                <p className="mt-0.5 text-sm text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-white/[0.08] pt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3632b0]"
              >
                <ExternalLink className="size-4" />
                Manage Subscription
              </Link>

              <Dialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
              >
                <DialogTrigger
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Cancel Subscription
                </DialogTrigger>
                <DialogContent className="border-white/10 bg-[#0a0a2e] text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Cancel Subscription
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Are you sure you want to cancel your subscription? You
                      will lose access to premium features at the end of your
                      current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose
                      className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      Keep Subscription
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                      className="gap-2"
                    >
                      {cancelling && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Yes, Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-sm text-gray-400">No active subscription</p>
            <p className="mt-1 text-xs text-gray-500">
              Upgrade to a plan to unlock premium features and shortlist
              packages.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3632b0]"
            >
              <CreditCard className="size-4" />
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Billing history */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#4540DB]/20 p-2.5">
            <Receipt className="size-5 text-[#4540DB]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Billing History</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="mt-5 py-8 text-center">
            <Receipt className="mx-auto size-10 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">No invoices yet</p>
            <p className="mt-1 text-xs text-gray-500">
              Invoices will appear here once you make a payment.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="py-3 pr-4 text-gray-300">
                      {new Date(invoice.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 pr-4 font-medium text-white">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : invoice.status === "open"
                              ? "bg-yellow-400/10 text-yellow-400"
                              : "bg-gray-400/10 text-gray-400"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      {invoice.pdfUrl ? (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#4540DB] transition-colors hover:text-[#6360e0]"
                        >
                          <Download className="size-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
