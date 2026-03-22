"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  UserPlus,
  MapPin,
  Clock,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (mirrors MatchResult from lib/ai/matcher + API response extras)
// ---------------------------------------------------------------------------

interface MatchedSkill {
  skill: string;
  candidateScore: number;
  required: boolean;
  gap: "none" | "minor" | "major";
}

interface MissingSkill {
  skill: string;
  importance: "critical" | "preferred" | "nice-to-have";
  timeToLearn: string;
  trainingRecommendation: string;
}

type Recommendation =
  | "STRONG_MATCH"
  | "GOOD_WITH_TRAINING"
  | "PARTIAL_MATCH"
  | "WEAK_MATCH";

interface MatchCandidate {
  candidateId: string;
  candidateName: string;
  email: string;
  location: string | null;
  matchScore: number;
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  summary: string;
  timeToReady: string;
  recommendation: Recommendation;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface AIMatchResultsProps {
  jobId: string;
  onAddCandidate?: (candidateId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function scoreRingColor(score: number): string {
  if (score >= 70) return "border-green-500";
  if (score >= 50) return "border-yellow-500";
  return "border-red-500";
}

function recommendationStyle(rec: Recommendation): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (rec) {
    case "STRONG_MATCH":
      return {
        label: "Strong Match",
        variant: "default",
        className: "bg-green-600 text-white",
      };
    case "GOOD_WITH_TRAINING":
      return {
        label: "Good with Training",
        variant: "default",
        className: "bg-blue-600 text-white",
      };
    case "PARTIAL_MATCH":
      return {
        label: "Partial Match",
        variant: "default",
        className: "bg-yellow-500 text-white",
      };
    case "WEAK_MATCH":
      return {
        label: "Weak Match",
        variant: "destructive",
        className: "",
      };
  }
}

// ---------------------------------------------------------------------------
// Candidate Card
// ---------------------------------------------------------------------------

function CandidateCard({
  candidate,
  onAdd,
}: {
  candidate: MatchCandidate;
  onAdd?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  const [adding, setAdding] = useState(false);

  const recStyle = recommendationStyle(candidate.recommendation);

  const handleAdd = async () => {
    setAdding(true);
    try {
      onAdd?.(candidate.candidateId);
      toast.success(`${candidate.candidateName} added to pipeline`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-lg border bg-background p-4">
      {/* Top row: score + name + recommendation */}
      <div className="flex items-start gap-3">
        {/* Circular score */}
        <div
          className={`flex items-center justify-center shrink-0 size-14 rounded-full border-3 ${scoreRingColor(candidate.matchScore)}`}
        >
          <span
            className={`text-lg font-bold ${scoreColor(candidate.matchScore)}`}
          >
            {candidate.matchScore}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">
              {candidate.candidateName}
            </span>
            <Badge
              className={recStyle.className}
              variant={recStyle.variant}
            >
              {recStyle.label}
            </Badge>
          </div>

          {candidate.location && (
            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {candidate.location}
            </div>
          )}

          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {candidate.timeToReady}
          </div>
        </div>

        {/* Add to pipeline */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <UserPlus className="size-3.5" />
          )}
          Add to Pipeline
        </Button>
      </div>

      {/* Summary */}
      <p className="mt-3 text-sm text-muted-foreground">{candidate.summary}</p>

      {/* Matched skills */}
      {candidate.matchedSkills.length > 0 && (
        <div className="mt-3">
          <span className="text-xs font-medium text-muted-foreground">
            Matched Skills
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {candidate.matchedSkills.map((ms) => (
              <span
                key={ms.skill}
                className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400"
              >
                <CheckCircle className="size-3" />
                {ms.skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills - collapsible */}
      {candidate.missingSkills.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowMissing(!showMissing)}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showMissing ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
            Missing Skills ({candidate.missingSkills.length})
          </button>
          {showMissing && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {candidate.missingSkills.map((ms) => (
                <span
                  key={ms.skill}
                  className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-400"
                >
                  <X className="size-3" />
                  {ms.skill}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Expandable gap analysis */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
          {expanded ? "Hide" : "Show"} Gap Analysis
        </button>
        {expanded && (
          <div className="mt-2 space-y-2">
            {candidate.missingSkills.map((ms) => (
              <div
                key={ms.skill}
                className="rounded-md border bg-muted/30 p-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ms.skill}</span>
                  <Badge
                    variant={
                      ms.importance === "critical"
                        ? "destructive"
                        : ms.importance === "preferred"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {ms.importance}
                  </Badge>
                </div>
                <div className="mt-1 text-muted-foreground">
                  Time to learn: {ms.timeToLearn}
                </div>
                {ms.trainingRecommendation && (
                  <div className="text-muted-foreground">
                    Training: {ms.trainingRecommendation}
                  </div>
                )}
              </div>
            ))}
            {candidate.missingSkills.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No skill gaps identified.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AIMatchResults({ jobId, onAddCandidate }: AIMatchResultsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MatchCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFind = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setResults([]);
    setHasSearched(true);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to find matches");
      }

      setResults(data.results || []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Keep results in memory so re-opening shows them
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleFind}>
        <Sparkles className="size-4" />
        Find Matching Candidates
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              AI Candidate Matching
            </DialogTitle>
          </DialogHeader>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
              <X className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                OSCABE AI is finding matches...
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && hasSearched && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No matching candidates found. Try adding more candidates with
                parsed CVs or broadening the job requirements.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-muted-foreground">
                {results.length} candidate{results.length !== 1 ? "s" : ""}{" "}
                ranked by match score
              </p>
              {results.map((candidate, i) => (
                <div key={candidate.candidateId}>
                  {i > 0 && <Separator className="my-1" />}
                  <CandidateCard
                    candidate={candidate}
                    onAdd={onAddCandidate}
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
