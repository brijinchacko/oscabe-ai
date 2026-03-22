"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AgencySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    agencyName: "",
    website: "",
  });

  useEffect(() => {
    fetch("/api/portal/agency/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.agency) {
          setForm({
            agencyName: data.agency.agencyName ?? "",
            website: data.agency.website ?? "",
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portal/agency/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your agency profile
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
      >
        <div className="space-y-2">
          <Label className="text-gray-300">Agency Name</Label>
          <Input
            value={form.agencyName}
            onChange={(e) =>
              setForm((p) => ({ ...p, agencyName: e.target.value }))
            }
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-300">Website</Label>
          <Input
            value={form.website}
            onChange={(e) =>
              setForm((p) => ({ ...p, website: e.target.value }))
            }
            placeholder="https://youragency.com"
            className="border-white/[0.1] bg-white/[0.05] text-white placeholder:text-gray-500"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-[#8B5CF6] text-white hover:bg-[#7c4de6]"
        >
          {saving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
