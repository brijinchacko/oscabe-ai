"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="size-10 text-red-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">
          Something Went Wrong
        </h1>
        <p className="mt-3 text-gray-400">
          An unexpected error occurred. Our team has been notified and is
          working on a fix.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4540DB]/90 transition-colors"
          >
            <RotateCcw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/[0.05] transition-colors"
          >
            <ArrowLeft className="size-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
