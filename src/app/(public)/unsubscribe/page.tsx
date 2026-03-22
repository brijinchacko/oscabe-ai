"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MailX, MailCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "unsubscribed" | "resubscribed" | "error">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!emailParam || !token) {
      setStatus("error");
      return;
    }

    try {
      const decoded = atob(emailParam.replace(/-/g, "+").replace(/_/g, "/"));
      setEmail(decoded);
    } catch {
      setStatus("error");
      return;
    }

    // Process unsubscribe
    fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailParam, token, action: "unsubscribe" }),
    })
      .then((res) => {
        if (res.ok) setStatus("unsubscribed");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [emailParam, token]);

  async function handleResubscribe() {
    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam, token, action: "resubscribe" }),
      });
      if (res.ok) setStatus("resubscribed");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto size-12 animate-spin text-[#4540DB]" />
            <p className="mt-4 text-gray-400">Processing your request...</p>
          </>
        )}

        {status === "unsubscribed" && (
          <>
            <MailX className="mx-auto size-16 text-gray-400" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              You&apos;ve Been Unsubscribed
            </h1>
            <p className="mt-3 text-gray-400">
              {email ? `${email} has` : "You have"} been removed from OSCABE
              marketing emails. You will no longer receive campaigns or
              promotional messages from us.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Changed your mind?
            </p>
            <Button
              variant="outline"
              className="mt-2 border-[#4540DB]/50 text-white hover:bg-[#4540DB]/10 hover:border-[#4540DB]"
              onClick={handleResubscribe}
            >
              <MailCheck className="mr-2 size-4" />
              Re-subscribe
            </Button>
          </>
        )}

        {status === "resubscribed" && (
          <>
            <MailCheck className="mx-auto size-16 text-emerald-400" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Welcome Back!
            </h1>
            <p className="mt-3 text-gray-400">
              You&apos;ve been re-subscribed to OSCABE emails. We&apos;re glad to have
              you back.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto size-16 text-red-400" />
            <h1 className="mt-6 text-2xl font-bold text-white">
              Something Went Wrong
            </h1>
            <p className="mt-3 text-gray-400">
              We couldn&apos;t process your request. The link may be invalid or
              expired. Please contact us at info@oscabe.com for assistance.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="bg-[#02012B] min-h-screen">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[#4540DB]" />
          </div>
        }
      >
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
