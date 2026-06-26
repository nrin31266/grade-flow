"use client";

import type { OverallGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";
import { getGpa4Classification } from "@/lib/gpa-classification";
import type { RetakeSettings, UserProfile } from "@/types/profile";

type DashboardHeroSummaryProps = {
  profile: UserProfile;
  overallSummary: OverallGpaSummary;
  graduationCredits?: number;
  retakeSettings: RetakeSettings;
};

export function DashboardHeroSummary({
  profile,
  overallSummary,
  graduationCredits,
  retakeSettings,
}: DashboardHeroSummaryProps) {
  const { cumulativeGpa4, cumulativeGpa10, earnedGraduationCredits, gpaCredits } =
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
            GPA tích lũy
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
          <p className="mt-1 text-[11px] text-muted-foreground/60">
            Dựa trên {gpaCredits} lượt học được tính GPA
          </p>
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
          Cấu hình đang dùng: {profile.schoolShortName} · {policyLabel} khi có học lại/cải thiện
        </p>
      </div>
    </div>
  );
}
