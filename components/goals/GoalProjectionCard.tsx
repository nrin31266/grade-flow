"use client";

import type { GpaGoalProjection, GpaGoalStatus } from "@/lib/gpa-goals";
import { formatCredits, formatGpa } from "@/lib/number-format";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type GoalProjectionCardProps = {
  projection: GpaGoalProjection;
  onOpenGoalSettings: () => void;
};

const statusConfig: Record<
  GpaGoalStatus,
  { label: string; badgeClass: string }
> = {
  not_set: {
    label: "Chưa đặt",
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  },
  achieved: {
    label: "Đã đạt",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  possible: {
    label: "Khả thi",
    badgeClass:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
  },
  hard: {
    label: "Khó",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  },
  needs_improvement: {
    label: "Cần cải thiện thêm",
    badgeClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  },
  impossible: {
    label: "Không khả thi",
    badgeClass:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
  },
  no_remaining_credits: {
    label: "Hết tín chỉ còn lại",
    badgeClass:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
  },
};

function getPrimaryStatus(
  gpa4Status: GpaGoalStatus,
  gpa10Status: GpaGoalStatus,
  targetGpa4: number | null,
  targetGpa10: number | null,
): GpaGoalStatus {
  if (targetGpa4 !== null) return gpa4Status;
  if (targetGpa10 !== null) return gpa10Status;
  return "not_set";
}

export function GoalProjectionCard({
  projection,
  onOpenGoalSettings,
}: GoalProjectionCardProps) {
  const {
    targetGpa4,
    targetGpa10,
    currentGpa4,
    currentGpa10,
    currentGpaCredits,
    remainingCredits,
    requiredAverageGpa4,
    requiredAverageGpa10,
    gpa4Status,
    gpa10Status,
    explanation,
    targetGraduationCredits,
    improvementPlan,
  } = projection;

  const hasTarget = targetGpa4 !== null || targetGpa10 !== null;
  const primaryStatus = getPrimaryStatus(
    gpa4Status,
    gpa10Status,
    targetGpa4,
    targetGpa10,
  );
  const cfg = statusConfig[primaryStatus];

  // GPA4 progress toward target
  const gpa4ProgressPercent =
    targetGpa4 !== null && currentGpa4 !== null && targetGpa4 > 0
      ? Math.min(100, Math.max(0, (currentGpa4 / targetGpa4) * 100))
      : null;

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm dark:border-sky-900/50 dark:from-background dark:to-sky-950/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mục tiêu GPA
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ước tính điểm trung bình cần đạt ở phần tín chỉ còn lại.
          </p>
        </div>
        <Button size="sm" onClick={onOpenGoalSettings}>
          {hasTarget ? "Chỉnh mục tiêu" : "Đặt mục tiêu"}
        </Button>
      </div>

      {!hasTarget ? (
        /* ─── Empty state ─── */
        <div className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg dark:bg-sky-900/50">
            🎯
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Chưa đặt mục tiêu
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Đặt mục tiêu GPA để biết các tín chỉ còn lại cần trung bình bao
              nhiêu.
            </p>
          </div>
        </div>
      ) : (
        /* ─── Active goal ─── */
        <div className="mt-4 space-y-4">
          {/* 3-column: Target | Current | Required */}
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Target */}
            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Mục tiêu đặt ra
              </p>
              <div className="mt-1 space-y-0.5">
                {targetGpa4 !== null && (
                  <p className="text-sm font-bold text-foreground">
                    GPA 4: <span className="text-sky-600 dark:text-sky-400">{targetGpa4.toFixed(2)}</span>
                  </p>
                )}
                {targetGpa10 !== null && (
                  <p className="text-sm font-bold text-foreground">
                    GPA 10: <span className="text-sky-600 dark:text-sky-400">{targetGpa10.toFixed(2)}</span>
                  </p>
                )}
                {targetGraduationCredits !== null && (
                  <p className="text-xs text-muted-foreground">
                    {targetGraduationCredits} tín chỉ tốt nghiệp
                  </p>
                )}
              </div>
            </div>

            {/* Current */}
            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                GPA hiện tại
              </p>
              <div className="mt-1 space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  GPA 4: {formatGpa(currentGpa4)}
                </p>
                <p className="text-sm font-bold text-foreground">
                  GPA 10: {formatGpa(currentGpa10)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Trên {currentGpaCredits} tín chỉ đã tính GPA
                </p>
              </div>
            </div>

            {/* Required */}
            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Cần đạt trung bình
              </p>
              <div className="mt-1 space-y-0.5">
                {requiredAverageGpa4 !== null ? (
                  <p className="text-sm font-bold text-foreground">
                    GPA 4: <span className="font-bold text-amber-600 dark:text-amber-400">{requiredAverageGpa4.toFixed(2)}</span>
                  </p>
                ) : targetGpa4 !== null ? (
                  <p className="text-sm text-muted-foreground">GPA 4: —</p>
                ) : null}
                {requiredAverageGpa10 !== null ? (
                  <p className="text-sm font-bold text-foreground">
                    GPA 10: <span className="font-bold text-amber-600 dark:text-amber-400">{requiredAverageGpa10.toFixed(2)}</span>
                  </p>
                ) : targetGpa10 !== null ? (
                  <p className="text-sm text-muted-foreground">GPA 10: —</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {remainingCredits !== null
                    ? `Còn ${remainingCredits} tín chỉ phải học`
                    : "Chưa có tín chỉ mục tiêu"}
                </p>
              </div>
            </div>
          </div>

          {/* Status badge + GPA4 progress bar */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.badgeClass}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {cfg.label}
            </span>

            {gpa4ProgressPercent !== null && (
              <div className="flex flex-1 items-center gap-2">
                <span className="text-[11px] text-muted-foreground">
                  {currentGpa4?.toFixed(2)} / {targetGpa4?.toFixed(2)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${gpa4ProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Explanation */}
          {explanation.length > 0 && (
            <div className="space-y-1 rounded-lg border bg-background/40 px-3 py-2">
              {explanation.slice(0, 3).map((text, i) => (
                <p key={i} className="text-xs leading-relaxed text-muted-foreground">
                  {text}
                </p>
              ))}
              <details className="group mt-1">
                <summary className="cursor-pointer text-[11px] text-muted-foreground/50 hover:text-muted-foreground">
                  Xem công thức
                </summary>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/50">
                  Điểm cần đạt = (GPA mục tiêu × tổng tín chỉ mục tiêu − GPA
                  hiện tại × tín chỉ GPA hiện tại) / tín chỉ còn lại.
                </p>
              </details>
            </div>
          )}

          {/* ─── Improvement plan ─── */}
          {improvementPlan &&
            (gpa4Status === "needs_improvement" ||
              gpa10Status === "needs_improvement") &&
            (improvementPlan.suggestedCandidatesForGpa4.length > 0 ||
              improvementPlan.suggestedCandidatesForGpa10.length > 0) && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  Có thể cải thiện?
                </p>

                {gpa4Status === "needs_improvement" &&
                  improvementPlan.creditsNeededToMakeTargetPossibleGpa4 !==
                    null && (
                    <p className="mt-1.5 text-sm text-blue-800 dark:text-blue-300">
                      GradeFlow ước tính bạn cần cải thiện khoảng{" "}
                      <span className="font-semibold">
                        {improvementPlan.creditsNeededToMakeTargetPossibleGpa4}
                      </span>{" "}
                      tín chỉ điểm thấp để mục tiêu trở nên khả thi.
                    </p>
                  )}

                {/* Suggested courses */}
                <div className="mt-3 space-y-1.5">
                  {improvementPlan.suggestedCandidatesForGpa4
                    .slice(0, 3)
                    .map((candidate) => (
                      <div
                        key={candidate.enrollmentId}
                        className="flex items-center gap-3 rounded-md border border-blue-100 bg-white px-3 py-2 dark:border-blue-900 dark:bg-slate-900"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                          {candidate.name}
                        </span>
                        <span className="shrink-0 whitespace-nowrap rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {candidate.currentLetterGrade ?? candidate.currentGpa4?.toFixed(1) ?? "—"} · {formatCredits(candidate.credits)} TC
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          → A
                        </span>
                      </div>
                    ))}
                </div>

                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/transcript">Xem bảng điểm</Link>
                  </Button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
