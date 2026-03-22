"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Award,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (mirrors ParsedCV from lib/ai/cv-parser)
// ---------------------------------------------------------------------------

interface ParsedSkill {
  name: string;
  category: string;
  platform: string | null;
  yearsExp: number | null;
  proficiency: number;
}

interface ParsedExperience {
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
}

interface ParsedCV {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string;
  summary: string;
  skills: ParsedSkill[];
  experience: ParsedExperience[];
  certifications: string[];
  salaryExpectation: number | null;
  noticePeriod: string | null;
  rightToWork: boolean | null;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AICVParserProps {
  candidateId: string;
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function proficiencyColor(p: number): string {
  if (p > 70) return "bg-green-500";
  if (p >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

function proficiencyTextColor(p: number): string {
  if (p > 70) return "text-green-700 dark:text-green-400";
  if (p >= 40) return "text-yellow-700 dark:text-yellow-400";
  return "text-red-700 dark:text-red-400";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AICVParser({ candidateId, onComplete }: AICVParserProps) {
  const [open, setOpen] = useState(false);
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCV | null>(null);
  const [applying, setApplying] = useState(false);

  const handleParse = async () => {
    if (!cvText.trim()) return;
    setLoading(true);
    setError(null);
    setParsed(null);

    try {
      const res = await fetch("/api/ai/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, candidateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse CV");
      }

      setParsed(data.parsed);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      toast.success("CV data applied to candidate profile");
      onComplete?.();
      setOpen(false);
      // Reset state for next use
      setCvText("");
      setParsed(null);
      setError(null);
    } finally {
      setApplying(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Reset on close
      setCvText("");
      setParsed(null);
      setError(null);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <FileText className="size-4" />
        Parse CV with AI
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI CV Parser
          </DialogTitle>
        </DialogHeader>

        {/* Error alert */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input phase */}
        {!parsed && !loading && (
          <div className="flex flex-col gap-4">
            <Textarea
              placeholder="Paste the candidate's CV text here..."
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              className="min-h-[200px]"
              rows={10}
            />
            <Button
              onClick={handleParse}
              disabled={!cvText.trim()}
            >
              <Sparkles className="size-4" />
              Parse
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              OSCABE AI is analysing this CV...
            </p>
          </div>
        )}

        {/* Results review panel */}
        {parsed && !loading && (
          <div className="flex flex-col gap-5">
            {/* Profile card */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                Extracted Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">
                    {parsed.firstName} {parsed.lastName}
                  </span>
                </div>
                {parsed.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span>{parsed.email}</span>
                  </div>
                )}
                {parsed.location && (
                  <div>
                    <span className="text-muted-foreground">Location:</span>{" "}
                    <span>{parsed.location}</span>
                  </div>
                )}
                {parsed.phone && (
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    <span>{parsed.phone}</span>
                  </div>
                )}
              </div>
              {parsed.headline && (
                <p className="mt-2 text-sm font-medium text-foreground">
                  {parsed.headline}
                </p>
              )}
              {parsed.summary && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {parsed.summary}
                </p>
              )}
            </div>

            {/* Skills grid */}
            {parsed.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Skills ({parsed.skills.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {parsed.skills.map((skill, i) => (
                    <div
                      key={`${skill.name}-${i}`}
                      className="flex items-center gap-2 rounded-lg border bg-background p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">
                            {skill.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {skill.category}
                          </Badge>
                          {skill.platform && (
                            <span className="text-[10px] text-muted-foreground">
                              {skill.platform}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-xs font-semibold ${proficiencyTextColor(skill.proficiency)}`}
                        >
                          {skill.proficiency}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${proficiencyColor(skill.proficiency)}`}
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience timeline */}
            {parsed.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Experience
                </h3>
                <div className="space-y-3">
                  {parsed.experience.map((exp, i) => (
                    <div
                      key={`${exp.company}-${i}`}
                      className="relative pl-4 border-l-2 border-muted"
                    >
                      <div className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />
                      <div className="text-sm font-medium">{exp.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {exp.company}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {exp.startDate || "?"} - {exp.endDate || "Present"}
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {parsed.certifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Award className="size-4" />
                  Certifications
                </h3>
                <ul className="space-y-1">
                  {parsed.certifications.map((cert, i) => (
                    <li
                      key={`${cert}-${i}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="size-3 text-green-600 shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Apply button */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParsed(null);
                  setCvText("");
                }}
              >
                Parse Another
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Apply to Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
