"use client";

import type { GpaGoalProjection, GpaGoalStatus } from "@/lib/gpa-goals";
import { formatCredits, formatGpa } from "@/lib/number-format";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type GoalProjectionCardProps = {
  projection: GpaGoalProjection;
  onOpenGoalSettings: () => void;
};

const statusBadge: Record<
  GpaGoalStatus,
  { label: string; className: string }
> = {
  not_set: {
    label: "Chưa đặt",
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  },
  achieved: {
    label: "Đã đạt",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  possible: {
    label: "Khả thi",
    className:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
  },
  hard: {
    label: "Khá căng",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
  },
  needs_improvement: {
    label: "Cần cải thiện thêm",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  },
  impossible: {
    label: "Chưa khả thi",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
  },
  no_remaining_credits: {
    label: "Hết tín chỉ còn lại",
    className:
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

function getConclusion(
  status: GpaGoalStatus,
  targetGpa4: number | null,
  targetGpa10: number | null,
  requiredAverageGpa4: number | null,
  requiredAverageGpa10: number | null,
  remainingCredits: number | null,
): string {
  if (status === "not_set" || status === "no_remaining_credits") return "";
  if (status === "achieved")
    return "Bạn đã đạt mục tiêu hiện tại, chỉ cần duy trì kết quả ở các tín chỉ còn lại.";
  if (status === "possible")
    return "Mục tiêu này vẫn trong tầm với nếu bạn giữ đúng mức điểm cần thiết.";
  if (status === "hard") {
    const parts: string[] = [];
    if (targetGpa4 !== null && requiredAverageGpa4 !== null)
      parts.push(`hệ 4 cần trung bình ${requiredAverageGpa4.toFixed(2)}`);
    if (targetGpa10 !== null && requiredAverageGpa10 !== null)
      parts.push(`hệ 10 cần trung bình ${requiredAverageGpa10.toFixed(2)}`);
    const rc = remainingCredits ?? "?";
    return `Khá căng nhưng vẫn có thể đạt được. Bạn cần duy trì mức điểm rất cao — ${parts.join(", ")} — cho ${rc} tín chỉ còn lại.`;
  }
  if (status === "needs_improvement") {
    const parts: string[] = [];
    if (targetGpa4 !== null && requiredAverageGpa4 !== null && requiredAverageGpa4 > 4)
      parts.push(`hệ 4 cần TB ${requiredAverageGpa4.toFixed(2)}`);
    if (targetGpa10 !== null && requiredAverageGpa10 !== null && requiredAverageGpa10 > 10)
      parts.push(`hệ 10 cần TB ${requiredAverageGpa10.toFixed(2)}`);
    const rc = remainingCredits ?? "?";
    if (parts.length > 0)
      return `Chưa khả thi nếu chỉ dựa vào ${rc} tín chỉ còn lại (${parts.join(", ")}), nhưng có thể cải thiện bằng cách nâng điểm các môn thấp.`;
    return `Mục tiêu khá căng, nhưng bạn có thể cải thiện các môn điểm thấp để tăng cơ hội.`;
  }
  if (status === "impossible")
    return "Chưa khả thi nếu chỉ dựa vào các học phần chưa học. Bạn sẽ cần mức trung bình cao hơn thang điểm tối đa ở phần tín chỉ còn lại.";
  return "";
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
    targetGraduationCredits,
    improvementPlan,
  } = projection;

  const hasTarget = targetGpa4 !== null || targetGpa10 !== null;
  const primaryStatus = getPrimaryStatus(gpa4Status, gpa10Status, targetGpa4, targetGpa10);
  const badge = statusBadge[primaryStatus];
  const conclusion = getConclusion(primaryStatus, targetGpa4, targetGpa10, requiredAverageGpa4, requiredAverageGpa10, remainingCredits);

  // Gộp candidates từ cả 2 thang, loại trùng, sắp xếp theo mức tăng GPA4
  const allCandidates = improvementPlan
    ? [
        ...improvementPlan.suggestedCandidatesForGpa4,
        ...improvementPlan.suggestedCandidatesForGpa10,
      ].filter(
        (c, i, arr) =>
          arr.findIndex((x) => x.enrollmentId === c.enrollmentId) === i,
      )
    : [];

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm dark:border-sky-900/50 dark:from-background dark:to-sky-950/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mục tiêu GPA
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Ước tính mức điểm cần đạt ở phần tín chỉ còn lại.
          </p>
        </div>
        <Button size="sm" onClick={onOpenGoalSettings}>
          {hasTarget ? "Chỉnh mục tiêu" : "Đặt mục tiêu"}
        </Button>
      </div>

      {!hasTarget ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center dark:border-slate-800 dark:bg-slate-900/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-lg dark:bg-sky-900/50">🎯</div>
          <p className="text-sm text-muted-foreground">
            Đặt mục tiêu GPA để biết các tín chỉ còn lại cần trung bình bao nhiêu.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {/* 3 card thông tin */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Mục tiêu</p>
              <div className="mt-1 space-y-0.5">
                {targetGpa4 !== null && (
                  <p className="text-sm text-foreground">Hệ 4: <span className="font-semibold text-sky-600 dark:text-sky-400">{targetGpa4.toFixed(2)}</span></p>
                )}
                {targetGpa10 !== null && (
                  <p className="text-sm text-foreground">Hệ 10: <span className="font-semibold text-sky-600 dark:text-sky-400">{targetGpa10.toFixed(2)}</span></p>
                )}
                {targetGraduationCredits !== null && (
                  <p className="text-xs text-muted-foreground">Tốt nghiệp: {targetGraduationCredits} TC</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Hiện tại</p>
              <div className="mt-1 space-y-0.5">
                <p className="text-sm text-foreground">GPA 4: <span className="font-semibold">{formatGpa(currentGpa4)}</span></p>
                <p className="text-sm text-foreground">GPA 10: <span className="font-semibold">{formatGpa(currentGpa10)}</span></p>
                <p className="text-xs text-muted-foreground">Đã có: {currentGpaCredits} TC tính GPA</p>
              </div>
            </div>

            <div className="rounded-lg border bg-background/50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Cần đạt TB</p>
              <div className="mt-1 space-y-0.5">
                {targetGpa4 !== null && (
                  <p className="text-sm text-foreground">
                    Hệ 4:{" "}
                    {requiredAverageGpa4 !== null ? (
                      <span className={`font-semibold ${requiredAverageGpa4 > 4 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {requiredAverageGpa4.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                )}
                {targetGpa10 !== null && (
                  <p className="text-sm text-foreground">
                    Hệ 10:{" "}
                    {requiredAverageGpa10 !== null ? (
                      <span className={`font-semibold ${requiredAverageGpa10 > 10 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {requiredAverageGpa10.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {remainingCredits !== null ? `Còn lại: ${remainingCredits} TC` : "Chưa rõ"}
                </p>
              </div>
            </div>
          </div>

          {/* Kết luận + badge */}
          <div className="flex flex-wrap items-start gap-2">
            <span className={`mt-0.5 inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
              {badge.label}
            </span>
            {conclusion && (
              <p className="text-sm leading-relaxed text-muted-foreground">{conclusion}</p>
            )}
          </div>

          {/* Formula collapsible */}
          <details className="group">
            <summary className="cursor-pointer text-[11px] text-muted-foreground/50 hover:text-muted-foreground">
              Xem công thức
            </summary>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/50">
              Điểm cần đạt = (GPA mục tiêu × tổng TC mục tiêu − GPA hiệu lực × TC đã tính GPA) / TC còn lại
            </p>
          </details>

          {/* ─── Gợi ý cải thiện GPA ─── */}
          {(gpa4Status === "needs_improvement" || gpa10Status === "needs_improvement") &&
            allCandidates.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/80 px-4 py-3 dark:border-blue-800 dark:bg-blue-950/20">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                Gợi ý cải thiện GPA
              </p>
              <p className="mt-0.5 text-[11px] text-blue-700/70 dark:text-blue-300/70">
                Giả định cải thiện các môn dưới đây lên A để tăng khả năng đạt mục tiêu.
              </p>

              <div className="mt-2 space-y-1">
                {allCandidates.slice(0, 6).map((c) => (
                  <div
                    key={c.enrollmentId}
                    className="flex flex-wrap items-center gap-x-2 gap-y-0.5 rounded border border-blue-100 bg-white px-2.5 py-1.5 text-xs dark:border-blue-900 dark:bg-slate-900"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">{c.name}</span>
                    <span className="text-muted-foreground">
                      {c.currentLetterGrade ?? c.currentScore10?.toFixed(1) ?? "—"}, {c.currentScore10?.toFixed(1) ?? "—"}, {formatCredits(c.credits)} TC
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      → A (4.0/10.0)
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      +{c.possibleGpa4Gain.toFixed(3)} GPA 4
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-2">
                <Button asChild size="sm" variant="outline" className="h-7 text-[11px]">
                  <Link href="/transcript">{allCandidates.length > 6 ? "Xem thêm trên bảng điểm" : "Mở bảng điểm"}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
