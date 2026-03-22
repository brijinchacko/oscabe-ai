import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#02012B] px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#4540DB]/10 border border-[#4540DB]/20">
          <Search className="size-10 text-[#4540DB]" />
        </div>
        <h1 className="mt-6 text-4xl font-bold text-white">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-gray-300">
          Page Not Found
        </h2>
        <p className="mt-3 text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-[#4540DB] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#4540DB]/90 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/[0.05] transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  );
}
