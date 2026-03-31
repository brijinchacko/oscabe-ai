"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";

interface BreakdownItem {
  type: string;
  label: string;
  count: number;
  points: number;
}

interface TargetItem {
  key: string;
  label: string;
  current: number;
  target: number;
}

export function ProductivityWidget() {
  const [collapsed, setCollapsed] = useState(true);
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([]);
  const [targets, setTargets] = useState<TargetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, targetRes] = await Promise.all([
        fetch("/api/attendance/productivity"),
        fetch("/api/attendance/targets"),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setScore(data.score || 0);
        setPercentage(data.percentage || 0);
        setBreakdown(
          (data.breakdown || []).filter((b: BreakdownItem) => b.count > 0 || b.points > 0)
        );
      }

      if (targetRes.ok) {
        const data = await targetRes.json();
        const userTargets = data.userTargets || {};
        // Map targets to display items
        const targetMap: Record<string, string> = {
          candidatesSourced: "Candidates",
          emailsSent: "Emails",
          callsMade: "Calls",
          applicationsSubmitted: "Applications",
          interviewsScheduled: "Interviews",
          dataEntries: "Data Entries",
          screenings: "Screenings",
          clientsContacted: "Clients",
          proposalsSent: "Proposals",
        };

        const items: TargetItem[] = Object.entries(userTargets).map(
          ([key, target]) => ({
            key,
            label: targetMap[key] || key,
            current: 0, // Will be populated from productivity data
            target: target as number,
          })
        );
        setTargets(items);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Match targets with breakdown counts
  useEffect(() => {
    if (breakdown.length === 0 || targets.length === 0) return;
    const countMap: Record<string, number> = {};
    for (const b of breakdown) {
      if (b.type === "CANDIDATE_ADDED") countMap["candidatesSourced"] = b.count;
      if (b.type === "EMAIL_SENT") countMap["emailsSent"] = b.count;
      if (b.type === "CALL") countMap["callsMade"] = b.count;
      if (b.type === "APPLICATION") countMap["applicationsSubmitted"] = b.count;
      if (b.type === "INTERVIEW_SCHEDULED") countMap["interviewsScheduled"] = b.count;
      if (b.type === "CLIENT_CONTACT") countMap["clientsContacted"] = b.count;
      if (b.type === "NOTE") countMap["dataEntries"] = b.count;
    }
    setTargets((prev) =>
      prev.map((t) => ({ ...t, current: countMap[t.key] || 0 }))
    );
  }, [breakdown, targets.length]);

  const color =
    percentage >= 80
      ? "#22C55E"
      : percentage >= 50
        ? "#F59E0B"
        : "#EF4444";

  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[200px]">
      <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
        {/* Header - always visible */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-between px-3 py-2"
        >
          <div className="flex items-center gap-1.5">
            <Zap className="size-3 text-yellow-500" />
            <span className="text-xs font-semibold text-gray-700">
              Productivity
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-bold"
              style={{ color }}
            >
              {percentage}%
            </span>
            {collapsed ? (
              <ChevronUp className="size-3 text-gray-400" />
            ) : (
              <ChevronDown className="size-3 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {!collapsed && (
          <div className="border-t border-gray-100 px-3 py-2">
            {/* Circular progress */}
            <div className="flex justify-center mb-2">
              <div className="relative">
                <svg width="64" height="64" className="-rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="4"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {percentage}%
                  </span>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-400 mb-2">
              {score} pts today
            </p>

            {/* Target bars */}
            {targets.length > 0 && (
              <div className="space-y-1.5">
                {targets.map((t) => {
                  const pct = t.target > 0 ? Math.min(100, Math.round((t.current / t.target) * 100)) : 0;
                  const barColor =
                    pct >= 80
                      ? "#22C55E"
                      : pct >= 50
                        ? "#F59E0B"
                        : "#EF4444";
                  return (
                    <div key={t.key}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">
                          {t.label}
                        </span>
                        <span className="text-[10px] font-medium text-gray-700">
                          {t.current}/{t.target}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-gray-100">
                        <div
                          className="h-1 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: barColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Breakdown */}
            {breakdown.length > 0 && (
              <div className="mt-2 border-t border-gray-100 pt-2">
                <p className="text-[10px] font-medium text-gray-400 mb-1">
                  Activity
                </p>
                {breakdown.map((b) => (
                  <div
                    key={b.type}
                    className="flex items-center justify-between text-[10px]"
                  >
                    <span className="text-gray-500">{b.label}</span>
                    <span className="font-medium text-gray-700">
                      {b.count} (+{b.points}pts)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
