"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CandidateSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your account preferences
        </p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Account Security
        </h2>
        <p className="mb-4 text-sm text-gray-400">
          Your account is managed through our secure authentication provider.
          Use the link below to change your password or update security settings.
        </p>
        <a
          href="https://accounts.clerk.dev/user"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="border-white/[0.1] text-gray-300 hover:bg-white/[0.05]"
          >
            <ExternalLink className="mr-2 size-4" />
            Manage Account Security
          </Button>
        </a>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Notification Preferences
        </h2>
        <p className="text-sm text-gray-400">
          Notification settings will be available soon. You will be able to
          configure email alerts for new job matches, application updates, and
          interview reminders.
        </p>
      </div>
    </div>
  );
}
