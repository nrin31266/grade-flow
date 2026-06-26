import type { OverallGpaSummary } from "@/lib/gpa";
import type { TranscriptInsights } from "@/lib/transcript-insights";
import { formatCredits, formatGpa } from "@/lib/number-format";

type TranscriptOverviewPanelProps = {
  overallSummary: OverallGpaSummary;
  insights: TranscriptInsights;
  graduationCredits?: number;
};

export function TranscriptOverviewPanel({
  overallSummary,
  insights,
  graduationCredits,
}: TranscriptOverviewPanelProps) {
  const {
    cumulativeGpa4,
    cumulativeGpa10,
    earnedGraduationCredits,
    remainingGraduationCredits,
    pendingEnrollmentCount,
    failedEnrollmentCount,
    repeatedCourseCount,
  } = overallSummary;

  const hasGraduationTarget =
    graduationCredits !== undefined && graduationCredits > 0;
  const progressPercent = hasGraduationTarget
    ? Math.min(
        100,
        Math.max(0, (earnedGraduationCredits / graduationCredits) * 100),
      )
    : null;

  const hasWarnings =
    pendingEnrollmentCount > 0 ||
    failedEnrollmentCount > 0 ||
    repeatedCourseCount > 0;

  const hasInsights =
    insights.bestTerm !== undefined || insights.weakestTerm !== undefined;

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm dark:border-sky-900/50 dark:from-background dark:to-sky-950/10">
      {/* 3-column layout: GPA | Credits | Warnings */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* ─── GPA tích lũy ─── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            GPA tích lũy
          </p>

          {cumulativeGpa4 !== null ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-primary">
                  {formatGpa(cumulativeGpa4)}
                </span>
                <span className="text-sm text-muted-foreground">/ 4</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-muted-foreground/80">
                  {formatGpa(cumulativeGpa10)}
                </span>
                <span className="text-xs text-muted-foreground/60">/ 10</span>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-4xl font-bold tracking-tight text-muted-foreground">
              —
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Tính từ các lượt học hiệu lực
          </p>
        </div>

        {/* ─── Tiến độ tốt nghiệp ─── */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tiến độ tốt nghiệp
          </p>

          <div className="mt-2">
            {hasGraduationTarget ? (
              <>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCredits(earnedGraduationCredits)} /{" "}
                  {formatCredits(graduationCredits)}
                </p>
                {/* Progress bar */}
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-sky-100 dark:bg-sky-950/50">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Còn thiếu {formatCredits(remainingGraduationCredits)} tín chỉ
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold tracking-tight">
                {formatCredits(earnedGraduationCredits)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  tín chỉ đã đạt
                </span>
              </p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Không cộng trùng môn học lại/cải thiện
          </p>
        </div>

        {/* ─── Cần chú ý ─── */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cần chú ý
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {hasWarnings ? (
              <>
                {pendingEnrollmentCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Chờ điểm: {pendingEnrollmentCount}
                  </span>
                )}
                {failedEnrollmentCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    Chưa đạt: {failedEnrollmentCount}
                  </span>
                )}
                {repeatedCourseCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Học lại/cải thiện: {repeatedCourseCount}
                  </span>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Không có cảnh báo lớn
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Insight phụ ─── */}
      {hasInsights && (
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-sky-100 pt-3 dark:border-sky-900/30">
          {insights.bestTerm && (
            <span className="text-xs text-muted-foreground">
              Kỳ tốt nhất:{" "}
              <span className="font-medium text-foreground">
                {insights.bestTerm.actualTermName}
              </span>{" "}
              · GPA 4{" "}
              <span className="font-medium text-foreground">
                {formatGpa(insights.bestTerm.gpa4)}
              </span>
            </span>
          )}
          {insights.weakestTerm && (
            <span className="text-xs text-muted-foreground">
              Kỳ cần chú ý:{" "}
              <span className="font-medium text-foreground">
                {insights.weakestTerm.actualTermName}
              </span>{" "}
              · GPA 4{" "}
              <span className="font-medium text-foreground">
                {formatGpa(insights.weakestTerm.gpa4)}
              </span>
            </span>
          )}
          {insights.topScoreCount > 0 && (
            <span className="text-xs text-muted-foreground">
              Điểm A:{" "}
              <span className="font-medium text-foreground">
                {insights.topScoreCount}
              </span>{" "}
              lượt học
            </span>
          )}
        </div>
      )}

      {/* ─── Footer help text ─── */}
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/60">
        GPA tích lũy dùng các lượt học hiệu lực theo cấu hình học vụ. Tín chỉ
        đã đạt không cộng trùng các môn học lại/cải thiện.
      </p>
    </div>
  );
}
