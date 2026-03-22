"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  Loader2,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";

interface Order {
  id: string;
  packageName: string;
  status: "PENDING" | "PROCESSING" | "DELIVERED";
  requirements: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; icon: typeof Clock; color: string; bg: string }
> = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
  },
  PROCESSING: {
    label: "Processing",
    icon: Loader2,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
};

export default function EmployerOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="size-6 animate-spin text-gray-400" /></div>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/portal/employer/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track your shortlist package orders
          </p>
        </div>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3632b0]"
        >
          <ShoppingCart className="size-4" />
          Order New Shortlist
        </Link>
      </div>

      {/* Success banner */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-300">
            Your order has been placed successfully! We will begin processing it
            shortly.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="size-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-12 text-center backdrop-blur-sm">
          <Package className="mx-auto size-12 text-gray-500" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            No orders yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
            You haven&apos;t placed any shortlist package orders yet. Browse our
            packages to get started.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3632b0]"
          >
            <ShoppingCart className="size-4" />
            Browse Packages
          </Link>
        </div>
      )}

      {/* Order cards */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = config.icon;
            const formattedDate = new Date(order.createdAt).toLocaleDateString(
              "en-GB",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              }
            );

            return (
              <div
                key={order.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-[#4540DB]/20 p-2.5">
                      <Truck className="size-5 text-[#4540DB]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white">
                        {order.packageName}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formattedDate}
                      </p>
                      {order.requirements && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                          {order.requirements}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}
                  >
                    <StatusIcon className="size-3.5" />
                    {config.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
