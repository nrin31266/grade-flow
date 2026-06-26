"use client";

import type { OverallGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";
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
  const { cumulativeGpa4, cumulativeGpa10, earnedGraduationCredits } =
    overallSummary;

  const hasGraduationTarget =
    graduationCredits !== undefined && graduationCredits > 0;
  const progressPercent = hasGraduationTarget
    ? Math.min(
        100,
        Math.max(0, (earnedGraduationCredits / graduationCredits) * 100),
      )
    : null;

  const policyLabel =
    retakeSettings.policy === "highest"
      ? "lấy điểm cao nhất"
      : retakeSettings.policy === "latest"
        ? "lấy lượt mới nhất"
        : "tự chọn thủ công";

  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Hồ sơ học tập
          </p>
          <h2 className="text-xl font-bold tracking-tight">
            Xin chào, {profile.displayName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {profile.schoolName}
            {graduationCredits
              ? ` · ${graduationCredits} tín chỉ tốt nghiệp`
              : ""}
          </p>
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <p>{profile.schoolShortName}</p>
          <p className="italic">{policyLabel}</p>
        </div>
      </div>

      {/* GPA */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            GPA tích lũy
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            {cumulativeGpa4 !== null ? (
              <>
                <span className="text-4xl font-bold tracking-tight text-primary">
                  {formatGpa(cumulativeGpa4)}
                </span>
                <span className="text-lg text-muted-foreground">
                  / 4
                </span>
                <span className="text-xl font-semibold text-muted-foreground/70">
                  {formatGpa(cumulativeGpa10)}
                </span>
                <span className="text-sm text-muted-foreground/50">
                  / 10
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold tracking-tight text-muted-foreground">
                —
              </span>
            )}
          </div>
          {cumulativeGpa4 !== null && (
            <p className="mt-1 text-xs text-muted-foreground">
              {cumulativeGpa4 >= 3.6
                ? "Xếp loại: Xuất sắc"
                : cumulativeGpa4 >= 3.2
                  ? "Xếp loại: Giỏi"
                  : cumulativeGpa4 >= 2.5
                    ? "Xếp loại: Khá"
                    : cumulativeGpa4 >= 2.0
                      ? "Xếp loại: Trung bình"
                      : "Xếp loại: Yếu"}
            </p>
          )}
        </div>

        {/* Credits */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Tín chỉ đã đạt
          </p>
          <div className="mt-1">
            {hasGraduationTarget ? (
              <>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCredits(earnedGraduationCredits)} /{" "}
                  {formatCredits(graduationCredits)}
                </p>
                <div className="mt-2 h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-sky-100 dark:bg-sky-950/50">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
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
          <p className="mt-1 text-xs text-muted-foreground">
            Không cộng trùng môn học lại/cải thiện
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Luật tính: {policyLabel}</span>
        <span className="text-muted-foreground/30">·</span>
        <span>Dùng để chọn lượt học hiệu lực khi có học lại/cải thiện</span>
      </div>
    </div>
  );
}
