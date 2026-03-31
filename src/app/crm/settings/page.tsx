"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Settings,
  Users,
  Wrench,
  Mail,
  Plug,
  Database,
  Save,
  Plus,
  Search,
  Pencil,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Brain,
  CreditCard,
  Shield,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────────────────────────────

interface GeneralSettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  defaultFeePercent: number;
  paymentTerms: string;
}

interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  updatedAt: string;
}

interface SkillRow {
  id: string;
  name: string;
  shortName: string;
  category: string;
  platform: string | null;
  parentId: string | null;
  parentName: string | null;
  createdAt: string;
}

interface Integrations {
  openrouter: boolean;
  resend: boolean;
  stripe: boolean;
  microsoft: boolean;
  microsoftConfigured: boolean;
  microsoftEmail: string | null;
}

const ROLES = ["ADMIN", "SALES", "RECRUITER", "CANDIDATE"] as const;

const SKILL_CATEGORIES = [
  "ALL",
  "PLC",
  "SCADA",
  "ROBOTICS",
  "SAFETY",
  "PROTOCOLS",
  "INDUSTRY",
  "GENERAL",
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  PLC: "bg-blue-100 text-blue-700",
  SCADA: "bg-purple-100 text-purple-700",
  ROBOTICS: "bg-orange-100 text-orange-700",
  SAFETY: "bg-red-100 text-red-700",
  PROTOCOLS: "bg-green-100 text-green-700",
  INDUSTRY: "bg-amber-100 text-amber-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

// ─── General Tab ────────────────────────────────────────────────────────

function GeneralTab() {
  const [settings, setSettings] = useState<GeneralSettings>({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    defaultFeePercent: 15,
    paymentTerms: "30 days",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load settings");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={settings.companyName}
            onChange={(e) =>
              setSettings({ ...settings, companyName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) =>
              setSettings({ ...settings, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={settings.address}
            onChange={(e) =>
              setSettings({ ...settings, address: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={settings.phone}
            onChange={(e) =>
              setSettings({ ...settings, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fee">Default Fee %</Label>
          <Input
            id="fee"
            type="number"
            min={0}
            max={100}
            value={settings.defaultFeePercent}
            onChange={(e) =>
              setSettings({
                ...settings,
                defaultFeePercent: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Payment Terms</Label>
          <Input
            id="terms"
            value={settings.paymentTerms}
            onChange={(e) =>
              setSettings({ ...settings, paymentTerms: e.target.value })
            }
          />
        </div>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Save Settings
      </Button>

      {/* Meeting Booking Link */}
      <BookingLinkSection />
    </div>
  );
}

// ─── Booking Link Section ──────────────────────────────────────────────

function BookingLinkSection() {
  const [bookingLink, setBookingLink] = useState("");
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/user/booking")
      .then((r) => r.json())
      .then((data) => {
        setBookingLink(data.bookingLink || "");
        setBookingEnabled(data.bookingEnabled);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  async function handleSaveBooking() {
    setSaving(true);
    try {
      const res = await fetch("/api/user/booking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingLink, bookingEnabled }),
      });
      if (!res.ok) throw new Error();
      toast.success("Booking settings saved");
    } catch {
      toast.error("Failed to save booking settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <div className="mt-8 border-t pt-6 space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">
          Meeting Booking Link
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Set your Calendly, Cal.com, or other booking link. When enabled, it will be available as a {"{booking_link}"} token in email templates and auto-included in positive response follow-ups.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bookingLink">Booking URL</Label>
          <Input
            id="bookingLink"
            type="url"
            value={bookingLink}
            onChange={(e) => setBookingLink(e.target.value)}
            placeholder="https://calendly.com/your-name"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch
            checked={bookingEnabled}
            onCheckedChange={setBookingEnabled}
          />
          <Label className="text-sm">
            {bookingEnabled ? "Booking link enabled" : "Booking link disabled"}
          </Label>
        </div>
      </div>
      <Button variant="outline" onClick={handleSaveBooking} disabled={saving}>
        {saving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        Save Booking Settings
      </Button>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateUser(id: string, field: string, value: unknown) {
    try {
      const res = await fetch("/api/settings/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Manage user roles and access. Changes take effect immediately.
      </p>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName ?? ""} {user.lastName ?? ""}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => {
                        if (v) updateUser(user.id, "role", v);
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={(checked) =>
                        updateUser(user.id, "isActive", checked)
                      }
                      size="sm"
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Skills Tab ─────────────────────────────────────────────────────────

const emptySkillForm = {
  name: "",
  shortName: "",
  category: "GENERAL",
  platform: "",
  parentId: "",
};

function SkillsTab() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [skillForm, setSkillForm] = useState(emptySkillForm);
  const [editingSkill, setEditingSkill] = useState<SkillRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null);
  const [parentSearch, setParentSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.set("search", search);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      const res = await fetch(`/api/settings/skills?${params}`);
      const data = await res.json();
      setSkills(data.skills);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  function openAddDialog() {
    setEditingSkill(null);
    setSkillForm(emptySkillForm);
    setParentSearch("");
    setDialogOpen(true);
  }

  function openEditDialog(skill: SkillRow) {
    setEditingSkill(skill);
    setSkillForm({
      name: skill.name,
      shortName: skill.shortName,
      category: skill.category,
      platform: skill.platform ?? "",
      parentId: skill.parentId ?? "",
    });
    setParentSearch(skill.parentName ?? "");
    setDialogOpen(true);
  }

  async function handleSaveSkill() {
    if (!skillForm.name || !skillForm.shortName || !skillForm.category) {
      toast.error("Name, short name, and category are required");
      return;
    }
    setSaving(true);
    try {
      const method = editingSkill ? "PUT" : "POST";
      const body = editingSkill
        ? { id: editingSkill.id, ...skillForm }
        : skillForm;
      const res = await fetch("/api/settings/skills", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success(editingSkill ? "Skill updated" : "Skill created");
      setDialogOpen(false);
      fetchSkills();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save skill"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSkill() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(
        `/api/settings/skills?id=${deleteTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("Skill deleted");
      setDeleteTarget(null);
      fetchSkills();
    } catch {
      toast.error("Failed to delete skill");
    }
  }

  const filteredParents = parentSearch
    ? skills.filter(
        (s) =>
          s.name.toLowerCase().includes(parentSearch.toLowerCase()) &&
          s.id !== editingSkill?.id
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1">
        {SKILL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategoryFilter(cat);
              setPage(1);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search and add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button onClick={openAddDialog}>
                <Plus className="size-4" />
                Add Skill
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add Skill"}
              </DialogTitle>
              <DialogDescription>
                {editingSkill
                  ? "Update the skill details below."
                  : "Fill in the details for the new skill."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={skillForm.name}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, name: e.target.value })
                  }
                  placeholder="e.g. Siemens S7-1500"
                />
              </div>
              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input
                  value={skillForm.shortName}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, shortName: e.target.value })
                  }
                  placeholder="e.g. S7-1500"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={skillForm.category}
                  onValueChange={(v) =>
                    setSkillForm({
                      ...skillForm,
                      category: v ?? skillForm.category,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Platform</Label>
                <Input
                  value={skillForm.platform}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, platform: e.target.value })
                  }
                  placeholder="e.g. Siemens"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Skill</Label>
                <Input
                  value={parentSearch}
                  onChange={(e) => {
                    setParentSearch(e.target.value);
                    if (!e.target.value)
                      setSkillForm({ ...skillForm, parentId: "" });
                  }}
                  placeholder="Search for parent skill..."
                />
                {filteredParents.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded border bg-white">
                    {filteredParents.slice(0, 8).map((s) => (
                      <button
                        key={s.id}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                          setSkillForm({ ...skillForm, parentId: s.id });
                          setParentSearch(s.name);
                        }}
                      >
                        {s.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({s.category})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleSaveSkill} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {editingSkill ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Skills table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Parent Skill</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : skills.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No skills found
                </TableCell>
              </TableRow>
            ) : (
              skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.name}</TableCell>
                  <TableCell>{skill.shortName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[skill.category] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {skill.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {skill.platform ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {skill.parentName ?? "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEditDialog(skill)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(skill)}
                      >
                        <Trash2 className="size-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {total} skills total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSkill}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Email Tab ──────────────────────────────────────────────────────────

function EmailTab() {
  const [integrations, setIntegrations] = useState<Integrations | null>(null);

  useEffect(() => {
    fetch("/api/settings/integrations")
      .then((r) => r.json())
      .then(setIntegrations)
      .catch(() => toast.error("Failed to check integrations"));
  }, []);

  function handleTestEmail() {
    toast.success("Test email functionality coming soon");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Email Configuration
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Resend API Key</p>
              <p className="text-xs text-muted-foreground">
                Used for sending transactional emails
              </p>
            </div>
            {integrations === null ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : integrations.resend ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle2 className="mr-1 size-3" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                <XCircle className="mr-1 size-3" />
                Not configured
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">From Email Address</p>
              <p className="text-xs text-muted-foreground">
                noreply@oscabe.com
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle2 className="mr-1 size-3" />
              Configured
            </Badge>
          </div>
        </div>
      </div>
      <Button variant="outline" onClick={handleTestEmail}>
        <Mail className="size-4" />
        Send Test Email
      </Button>
    </div>
  );
}

// ─── Integrations Tab ───────────────────────────────────────────────────

function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchIntegrations = useCallback(() => {
    fetch("/api/settings/integrations")
      .then((r) => r.json())
      .then(setIntegrations)
      .catch(() => toast.error("Failed to check integrations"));
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  // Check for connection success from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "microsoft") {
      toast.success("Microsoft 365 connected successfully!");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname + "?tab=integrations");
      fetchIntegrations();
    }
    if (params.get("error")) {
      toast.error(`Connection failed: ${params.get("error")}`);
      window.history.replaceState({}, "", window.location.pathname + "?tab=integrations");
    }
  }, [fetchIntegrations]);

  async function handleMicrosoftSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/microsoft/emails/sync", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Synced ${data.syncCount} emails`);
    } catch {
      toast.error("Email sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleMicrosoftDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/microsoft/disconnect", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Microsoft 365 disconnected");
      fetchIntegrations();
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  const cards = [
    {
      name: "OpenRouter AI",
      key: "openrouter" as const,
      icon: Brain,
      description:
        "AI-powered candidate matching, CV parsing, and job description analysis.",
    },
    {
      name: "Resend",
      key: "resend" as const,
      icon: Mail,
      description:
        "Transactional email delivery for campaigns, notifications, and alerts.",
    },
    {
      name: "Stripe",
      key: "stripe" as const,
      icon: CreditCard,
      description:
        "Payment processing for invoices and placement fee collection.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Microsoft 365 Integration Card */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Microsoft 365
        </h3>
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50">
              <svg className="size-7" viewBox="0 0 23 23" fill="none">
                <rect width="11" height="11" fill="#f25022" />
                <rect x="12" width="11" height="11" fill="#7fba00" />
                <rect y="12" width="11" height="11" fill="#00a4ef" />
                <rect x="12" y="12" width="11" height="11" fill="#ffb900" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold">Microsoft 365</h4>
                {integrations === null ? (
                  <Loader2 className="size-3 animate-spin text-muted-foreground" />
                ) : integrations.microsoft ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle2 className="mr-1 size-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500">
                    Not connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Connect your Outlook email, Teams presence, and calendar for seamless CRM integration.
                Sync emails with candidates and clients automatically.
              </p>

              {integrations?.microsoft ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail className="size-3.5" />
                    <span>Connected as <strong>{integrations.microsoftEmail}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMicrosoftSync}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Mail className="size-3.5" />
                      )}
                      Sync Emails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMicrosoftDisconnect}
                      disabled={disconnecting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {disconnecting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <XCircle className="size-3.5" />
                      )}
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = "/api/microsoft/connect";
                  }}
                >
                  <Plug className="size-3.5" />
                  Connect Microsoft 365
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Other Integrations */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Other Integrations
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const configured = integrations?.[card.key] ?? false;
            return (
              <Card key={card.key} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="size-5 text-gray-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{card.name}</h4>
                      {integrations === null ? (
                        <Loader2 className="size-3 animate-spin text-muted-foreground" />
                      ) : configured ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700"
                        >
                          Connected
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-500"
                        >
                          Not configured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Data Tab ───────────────────────────────────────────────────────────

function DataTab() {
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleExport(type: string) {
    setDownloading(type);
    try {
      const res = await fetch(`/api/settings/export?type=${type}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} exported`);
    } catch {
      toast.error(`Failed to export ${type}`);
    } finally {
      setDownloading(null);
    }
  }

  const exports = [
    { type: "candidates", label: "Export Candidates CSV" },
    { type: "clients", label: "Export Clients CSV" },
    { type: "jobs", label: "Export Jobs CSV" },
    { type: "placements", label: "Export Placements CSV" },
  ];

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Data Export</h3>
        <p className="text-sm text-muted-foreground">
          Download your CRM data as CSV files for external analysis or backup.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {exports.map((exp) => (
            <Button
              key={exp.type}
              variant="outline"
              className="justify-start"
              disabled={downloading === exp.type}
              onClick={() => handleExport(exp.type)}
            >
              {downloading === exp.type ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {exp.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">
            GDPR Data Management
          </h3>
        </div>
        <p className="text-sm text-amber-800">
          Under GDPR, individuals have the right to request access to their
          personal data, rectification of inaccurate data, and erasure of their
          data (&quot;right to be forgotten&quot;). To process a data deletion
          request, please contact your system administrator or email
          privacy@oscabe.com with the subject&apos;s details.
        </p>
        <p className="text-xs text-amber-700">
          All data deletion requests must be processed within 30 days in
          accordance with GDPR Article 17 requirements.
        </p>
      </div>
    </div>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────

export default function SettingsPage() {
  const [defaultTab, setDefaultTab] = useState("general");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["general", "users", "skills", "email", "integrations", "data"].includes(tab)) {
      setDefaultTab(tab);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your CRM configuration, users, skills, and integrations.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} key={defaultTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Settings className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Wrench className="size-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="size-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="size-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="size-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
          <SkillsTab />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <EmailTab />
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <IntegrationsTab />
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <DataTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
