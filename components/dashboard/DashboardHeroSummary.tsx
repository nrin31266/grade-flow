"use client";

import type { OverallGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";
import { getGpa4Classification } from "@/lib/gpa-classification";
import type { RetakeSettings, UserProfile } from "@/types/profile";

export type RetakeImprovementHeroSummary = {
  effectiveCredits: number;
  retakeCredits: number;
  retakePercent: number | null;
  retakeWarningLevel: "normal" | "warning" | "danger";
  improvementCredits: number;
  improvementPercent: number | null;
  improvementWarningLevel: "normal" | "warning" | "danger";
  uncertainCredits: number;
  uncertainPercent: number | null;
};

function formatPercent(value: number): string {
  return `${Number(value.toFixed(2))}%`;
}

type DashboardHeroSummaryProps = {
  profile: UserProfile;
  overallSummary: OverallGpaSummary;
  graduationCredits?: number;
  retakeSettings: RetakeSettings;
  retakeImprovementSummary: RetakeImprovementHeroSummary;
};

export function DashboardHeroSummary({
  profile,
  overallSummary,
  graduationCredits,
  retakeSettings,
  retakeImprovementSummary,
}: DashboardHeroSummaryProps) {
  const { cumulativeGpa4, cumulativeGpa10, earnedGraduationCredits } =
    overallSummary;

  const targetCredits = graduationCredits ?? profile.graduationCredits;
  const hasGraduationTarget = targetCredits !== undefined && targetCredits > 0;
  const progressPercent = hasGraduationTarget
    ? Math.min(100, Math.max(0, (earnedGraduationCredits / targetCredits) * 100))
    : null;
  const remainingCredits =
    hasGraduationTarget ? Math.max(targetCredits - earnedGraduationCredits, 0) : null;

  const classification = getGpa4Classification(cumulativeGpa4);

  const policyLabel =
    retakeSettings.policy === "highest"
      ? "lấy điểm cao nhất"
      : retakeSettings.policy === "latest"
        ? "lấy lượt mới nhất"
        : "tự chọn thủ công";

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm dark:border-sky-900/50 dark:from-background dark:to-sky-950/10">
      {/* 3-column grid */}
      <div className="grid gap-5 sm:grid-cols-[1.2fr_1fr_1fr]">
        {/* ─── Cột trái: Hồ sơ ─── */}
        <div className="flex flex-col justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Hồ sơ học tập
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              Xin chào, {profile.displayName}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {profile.schoolName}
            </p>
            {hasGraduationTarget && (
              <p className="mt-1 text-sm text-muted-foreground">
                Mục tiêu tốt nghiệp: {targetCredits} tín chỉ
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {profile.schoolShortName && (
              <span className="inline-flex rounded border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
                {profile.schoolShortName}
              </span>
            )}
            <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400">
              Local-first
            </span>
          </div>

        </div>

        {/* ─── Cột giữa: GPA ─── */}
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            GPA hiệu lực
          </p>
          <div className="mt-1">
            {cumulativeGpa4 !== null ? (
              <>
                <div className="flex items-baseline gap-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {formatGpa(cumulativeGpa4)}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 4</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold tracking-tight text-foreground">
                      {formatGpa(cumulativeGpa10)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 10</span>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-3xl font-bold tracking-tight text-muted-foreground">
                —
              </span>
            )}
          </div>
          <span
            className={`mt-1.5 inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-semibold ${classification.className}`}
          >
            {classification.label}
          </span>
          <div
            title="TC hiệu lực là tín chỉ sau khi xử lý học lại/cải thiện. Tỷ lệ học lại/cải thiện được tính trên tổng tín chỉ tốt nghiệp."
            className="mt-2 flex flex-wrap items-center gap-1.5 text-xs"
          >
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {formatCredits(retakeImprovementSummary.effectiveCredits)} TC hiệu lực
            </span>
            <span
              className={`rounded-md border px-1.5 py-0.5 font-medium ${
                retakeImprovementSummary.retakeWarningLevel === "danger"
                  ? "border-orange-300/70 bg-orange-500/5 text-orange-700/90 dark:border-orange-800/70 dark:bg-orange-950/20 dark:text-orange-300/90"
                  : retakeImprovementSummary.retakeWarningLevel === "warning"
                    ? "border-amber-300/70 bg-amber-500/5 text-amber-700/90 dark:border-amber-800/70 dark:bg-amber-950/20 dark:text-amber-300/90"
                    : "border-rose-200/60 bg-rose-500/5 text-rose-700/80 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-300/80"
              }`}
            >
              Học lại {formatCredits(retakeImprovementSummary.retakeCredits)} TC
              {retakeImprovementSummary.retakePercent !== null
                ? ` (${formatPercent(retakeImprovementSummary.retakePercent)})`
                : ""}
            </span>
            <span
              className={`rounded-md border px-1.5 py-0.5 font-medium ${
                retakeImprovementSummary.improvementWarningLevel === "danger"
                  ? "border-orange-300/70 bg-orange-500/5 text-orange-700/90 dark:border-orange-800/70 dark:bg-orange-950/20 dark:text-orange-300/90"
                  : retakeImprovementSummary.improvementWarningLevel === "warning"
                    ? "border-amber-300/70 bg-amber-500/5 text-amber-700/90 dark:border-amber-800/70 dark:bg-amber-950/20 dark:text-amber-300/90"
                    : "border-violet-200/60 bg-violet-500/5 text-violet-700/80 dark:border-violet-900/60 dark:bg-violet-950/20 dark:text-violet-300/80"
              }`}
            >
              Cải thiện {formatCredits(retakeImprovementSummary.improvementCredits)} TC
              {retakeImprovementSummary.improvementPercent !== null
                ? ` (${formatPercent(retakeImprovementSummary.improvementPercent)})`
                : ""}
            </span>
            {retakeImprovementSummary.uncertainCredits > 0 && (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-300">
                Học lại/cải thiện {formatCredits(retakeImprovementSummary.uncertainCredits)} TC
                {retakeImprovementSummary.uncertainPercent !== null
                  ? ` (${formatPercent(retakeImprovementSummary.uncertainPercent)})`
                  : ""}
              </span>
            )}
          </div>
        </div>

        {/* ─── Cột phải: Tín chỉ ─── */}
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tiến độ tốt nghiệp
          </p>
          <div className="mt-1">
            {hasGraduationTarget ? (
              <>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCredits(earnedGraduationCredits)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {targetCredits}
                  </span>
                </p>
                <div className="mt-1.5 h-2 w-full max-w-[180px] overflow-hidden rounded-full border border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                  {progressPercent?.toFixed(1)}%
                </p>
                {remainingCredits !== null && remainingCredits > 0 && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Còn thiếu {remainingCredits} tín chỉ
                  </p>
                )}
              </>
            ) : (
              <p className="text-2xl font-bold tracking-tight">
                {formatCredits(earnedGraduationCredits)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  tín chỉ
                </span>
              </p>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground/60">
            Không cộng trùng môn học lại/cải thiện
          </p>
        </div>
      </div>

      {/* ─── Strip cấu hình ─── */}
      <div className="mt-4 border-t border-sky-100 pt-2 dark:border-sky-900/50">
        <p className="text-[11px] text-muted-foreground/60">
          Cấu hình đang dùng: {profile.schoolShortName}, {policyLabel} khi có học lại/cải thiện
        </p>
      </div>
    </div>
  );
}
