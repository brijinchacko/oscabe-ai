"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserInfo {
  id: string;
  role: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

const ALLOWED_ROLES = ["ADMIN", "RECRUITER"];

export function CRMAuthGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">(
    "loading"
  );

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch("/api/user/me");
        if (!res.ok) {
          setStatus("denied");
          return;
        }
        const data: UserInfo = await res.json();
        if (ALLOWED_ROLES.includes(data.role)) {
          setStatus("authorized");
        } else {
          setStatus("denied");
        }
      } catch {
        setStatus("denied");
      }
    }
    checkAccess();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-500 mb-6">
            You do not have permission to access the CRM. This area is restricted
            to authorised recruiters and administrators.
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
