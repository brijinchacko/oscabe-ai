"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Users,
  Mail,
  Bell,
  ClipboardCheck,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

interface Step {
  id?: string;
  dayDelay: number;
  action: string;
  subject: string;
  body: string;
  stepOrder: number;
}

interface Enrollment {
  id: string;
  contactEmail: string;
  currentStep: number;
  status: string;
  lastActionAt: string | null;
  nextActionAt: string | null;
  createdAt: string;
}

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdBy: string | null;
  steps: Step[];
  enrollments?: Enrollment[];
  activeEnrollments: number;
  _count: { steps: number; enrollments: number };
  createdAt: string;
  updatedAt: string;
}

// ─── Default Sequences ──────────────────────────────────────────────────

const DEFAULT_SEQUENCES = [
  {
    name: "Client No Response",
    description: "Follow up with clients who haven't responded",
    steps: [
      { dayDelay: 2, action: "EMAIL", subject: "Quick follow-up", body: "Just checking in on my previous email. Would love to connect when you have a moment." },
      { dayDelay: 5, action: "EMAIL", subject: "Thought you might find this useful", body: "I wanted to share some insights about the current market trends that might be relevant to your team." },
      { dayDelay: 10, action: "EMAIL", subject: "Final follow-up", body: "I understand timing might not be right. I'll leave the door open - feel free to reach out whenever you're ready." },
    ],
  },
  {
    name: "Candidate Nurture",
    description: "Keep candidates engaged with relevant content",
    steps: [
      { dayDelay: 3, action: "EMAIL", subject: "New job opportunities", body: "We have some exciting new roles that match your profile. Take a look!" },
      { dayDelay: 7, action: "EMAIL", subject: "Career tips & market insights", body: "Here are some tips and insights to help you in your job search." },
      { dayDelay: 14, action: "NOTIFICATION", subject: "Check-in reminder", body: "Time to check in with this candidate and see how their search is going." },
    ],
  },
  {
    name: "Post-Meeting Follow-Up",
    description: "Structured follow-up after client meetings",
    steps: [
      { dayDelay: 1, action: "EMAIL", subject: "Great meeting today!", body: "Thank you for taking the time to meet. Here's a summary of what we discussed." },
      { dayDelay: 3, action: "TASK", subject: "Send proposal", body: "Prepare and send the proposal discussed in the meeting." },
      { dayDelay: 7, action: "EMAIL", subject: "Following up on our proposal", body: "Wanted to check if you've had a chance to review the proposal. Happy to answer any questions." },
    ],
  },
];

// ─── Action Icon Helper ─────────────────────────────────────────────────

function ActionIcon({ action }: { action: string }) {
  switch (action) {
    case "EMAIL":
      return <Mail className="size-3.5 text-blue-600" />;
    case "TASK":
      return <ClipboardCheck className="size-3.5 text-amber-600" />;
    case "NOTIFICATION":
      return <Bell className="size-3.5 text-purple-600" />;
    default:
      return <Mail className="size-3.5 text-gray-400" />;
  }
}

function actionColor(action: string) {
  switch (action) {
    case "EMAIL":
      return "bg-blue-100 text-blue-700";
    case "TASK":
      return "bg-amber-100 text-amber-700";
    case "NOTIFICATION":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-700";
    case "COMPLETED":
      return "bg-blue-100 text-blue-700";
    case "REPLIED":
      return "bg-indigo-100 text-indigo-700";
    case "CONVERTED":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ─── Page Component ─────────────────────────────────────────────────────

export default function SequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedEnrollments, setExpandedEnrollments] = useState<Enrollment[]>(
    []
  );
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSteps, setFormSteps] = useState<
    { dayDelay: number; action: string; subject: string; body: string }[]
  >([{ dayDelay: 1, action: "EMAIL", subject: "", body: "" }]);
  const [saving, setSaving] = useState(false);

  // Enroll dialog state
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollSequenceId, setEnrollSequenceId] = useState("");
  const [enrollEmail, setEnrollEmail] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const fetchSequences = useCallback(async () => {
    try {
      const res = await fetch("/api/sequences");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSequences(data);
    } catch {
      toast.error("Failed to load sequences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  async function fetchEnrollments(seqId: string) {
    setEnrollmentsLoading(true);
    try {
      const res = await fetch(`/api/sequences/${seqId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setExpandedEnrollments(data.enrollments || []);
    } catch {
      toast.error("Failed to load enrollments");
    } finally {
      setEnrollmentsLoading(false);
    }
  }

  function toggleExpand(seqId: string) {
    if (expandedId === seqId) {
      setExpandedId(null);
      setExpandedEnrollments([]);
    } else {
      setExpandedId(seqId);
      fetchEnrollments(seqId);
    }
  }

  async function handleCreate() {
    if (!formName.trim()) {
      toast.error("Sequence name is required");
      return;
    }
    if (formSteps.length === 0) {
      toast.error("At least one step is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription || null,
          steps: formSteps,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sequence created");
      setCreateOpen(false);
      resetForm();
      fetchSequences();
    } catch {
      toast.error("Failed to create sequence");
    } finally {
      setSaving(false);
    }
  }

  async function handleSeedDefault(idx: number) {
    const def = DEFAULT_SEQUENCES[idx];
    setSaving(true);
    try {
      const res = await fetch("/api/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(def),
      });
      if (!res.ok) throw new Error();
      toast.success(`"${def.name}" sequence created`);
      fetchSequences();
    } catch {
      toast.error("Failed to create sequence");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(seq: Sequence) {
    try {
      const res = await fetch(`/api/sequences/${seq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !seq.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(seq.isActive ? "Sequence paused" : "Sequence activated");
      fetchSequences();
    } catch {
      toast.error("Failed to update sequence");
    }
  }

  async function handleDelete(seqId: string) {
    try {
      const res = await fetch(`/api/sequences/${seqId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Sequence deleted");
      if (expandedId === seqId) {
        setExpandedId(null);
        setExpandedEnrollments([]);
      }
      fetchSequences();
    } catch {
      toast.error("Failed to delete sequence");
    }
  }

  async function handleEnroll() {
    if (!enrollSequenceId || !enrollEmail.trim()) {
      toast.error("Sequence and email are required");
      return;
    }
    setEnrolling(true);
    try {
      const res = await fetch("/api/sequences/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequenceId: enrollSequenceId,
          contactEmail: enrollEmail,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      toast.success("Contact enrolled in sequence");
      setEnrollOpen(false);
      setEnrollEmail("");
      setEnrollSequenceId("");
      fetchSequences();
      if (expandedId === enrollSequenceId) {
        fetchEnrollments(enrollSequenceId);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to enroll contact"
      );
    } finally {
      setEnrolling(false);
    }
  }

  async function handleProcess() {
    setProcessing(true);
    try {
      const res = await fetch("/api/sequences/process", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        `Processed ${data.processed} actions, ${data.completed} completed`
      );
      fetchSequences();
    } catch {
      toast.error("Failed to process sequences");
    } finally {
      setProcessing(false);
    }
  }

  function resetForm() {
    setFormName("");
    setFormDescription("");
    setFormSteps([{ dayDelay: 1, action: "EMAIL", subject: "", body: "" }]);
  }

  function addStep() {
    setFormSteps([
      ...formSteps,
      { dayDelay: 3, action: "EMAIL", subject: "", body: "" },
    ]);
  }

  function removeStep(idx: number) {
    setFormSteps(formSteps.filter((_, i) => i !== idx));
  }

  function updateStep(
    idx: number,
    field: string,
    value: string | number
  ) {
    setFormSteps(
      formSteps.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Follow-Up Sequences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automate your follow-up emails and tasks with multi-step sequences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleProcess}
            disabled={processing}
          >
            {processing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Process Due
          </Button>
          <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
            <DialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Users className="size-4" />
                  Enroll Contact
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Enroll Contact</DialogTitle>
                <DialogDescription>
                  Add a contact to a follow-up sequence.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label>Sequence</Label>
                  <Select
                    value={enrollSequenceId}
                    onValueChange={(v) => setEnrollSequenceId(v ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sequence..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sequences
                        .filter((s) => s.isActive)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={enrollEmail}
                    onChange={(e) => setEnrollEmail(e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button onClick={handleEnroll} disabled={enrolling}>
                  {enrolling && <Loader2 className="size-4 animate-spin" />}
                  Enroll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button onClick={() => { resetForm(); setCreateOpen(true); }}>
                  <Plus className="size-4" />
                  New Sequence
                </Button>
              }
            />
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Sequence</DialogTitle>
                <DialogDescription>
                  Build a multi-step follow-up sequence with emails, tasks, and
                  notifications.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Client No Response"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Optional description"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Steps</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addStep}
                      type="button"
                    >
                      <Plus className="size-3" />
                      Add Step
                    </Button>
                  </div>
                  {formSteps.map((step, idx) => (
                    <Card key={idx} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500">
                          Step {idx + 1}
                        </span>
                        {formSteps.length > 1 && (
                          <button
                            onClick={() => removeStep(idx)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Day Delay</Label>
                          <Input
                            type="number"
                            min={1}
                            value={step.dayDelay}
                            onChange={(e) =>
                              updateStep(
                                idx,
                                "dayDelay",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Action</Label>
                          <Select
                            value={step.action}
                            onValueChange={(v) =>
                              updateStep(idx, "action", v ?? "EMAIL")
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EMAIL">Email</SelectItem>
                              <SelectItem value="TASK">Task</SelectItem>
                              <SelectItem value="NOTIFICATION">
                                Notification
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Subject</Label>
                          <Input
                            value={step.subject}
                            onChange={(e) =>
                              updateStep(idx, "subject", e.target.value)
                            }
                            placeholder="Subject line"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Body / Description</Label>
                        <textarea
                          className="w-full rounded-md border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          rows={2}
                          value={step.body}
                          onChange={(e) =>
                            updateStep(idx, "body", e.target.value)
                          }
                          placeholder="Email body or task description..."
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose
                  render={<Button variant="outline">Cancel</Button>}
                />
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Create Sequence
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick-start templates */}
      {sequences.length === 0 && (
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Quick Start Templates
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Get started with pre-built follow-up sequences.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {DEFAULT_SEQUENCES.map((def, idx) => (
              <button
                key={idx}
                onClick={() => handleSeedDefault(idx)}
                disabled={saving}
                className="rounded-lg border border-dashed border-gray-300 p-4 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50/50"
              >
                <p className="text-sm font-medium text-gray-900">
                  {def.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {def.description}
                </p>
                <p className="mt-2 text-xs text-indigo-600">
                  {def.steps.length} steps
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Sequences List */}
      <div className="space-y-3">
        {sequences.map((seq) => (
          <Card key={seq.id} className="overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => toggleExpand(seq.id)}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50">
                <Repeat className="size-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {seq.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={
                      seq.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }
                  >
                    {seq.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
                {seq.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {seq.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{seq._count.steps} steps</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {seq.activeEnrollments} active
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleActive(seq);
                  }}
                  title={seq.isActive ? "Pause sequence" : "Activate sequence"}
                >
                  {seq.isActive ? (
                    <Pause className="size-3.5 text-amber-600" />
                  ) : (
                    <Play className="size-3.5 text-green-600" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnrollSequenceId(seq.id);
                    setEnrollOpen(true);
                  }}
                  title="Enroll contact"
                >
                  <Plus className="size-3.5 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(seq.id);
                  }}
                  title="Delete sequence"
                >
                  <Trash2 className="size-3.5 text-red-500" />
                </Button>
                {expandedId === seq.id ? (
                  <ChevronDown className="size-4 text-gray-400" />
                ) : (
                  <ChevronRight className="size-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Expanded: Steps + Enrollments */}
            {expandedId === seq.id && (
              <div className="border-t bg-gray-50/50 px-4 py-3 space-y-4">
                {/* Steps timeline */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Steps
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {seq.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        {idx > 0 && (
                          <div className="h-px w-6 bg-gray-300" />
                        )}
                        <div className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1">
                          <ActionIcon action={step.action} />
                          <span className="text-xs text-gray-700">
                            Day {step.dayDelay}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] ${actionColor(step.action)}`}
                          >
                            {step.action}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enrollments */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">
                    Active Enrollments
                  </h4>
                  {enrollmentsLoading ? (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Loading...
                      </span>
                    </div>
                  ) : expandedEnrollments.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">
                      No active enrollments. Click + to enroll a contact.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {expandedEnrollments.map((e) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-gray-900">
                              {e.contactEmail}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] ${statusColor(e.status)}`}
                            >
                              {e.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>
                              Step {e.currentStep + 1}/{seq.steps.length}
                            </span>
                            {e.nextActionAt && (
                              <span>
                                Next:{" "}
                                {new Date(e.nextActionAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {sequences.length === 0 && (
        <div className="text-center py-12">
          <Repeat className="mx-auto size-12 text-gray-300" />
          <h3 className="mt-3 text-sm font-semibold text-gray-900">
            No sequences yet
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first follow-up sequence or use a template above.
          </p>
        </div>
      )}
    </div>
  );
}
