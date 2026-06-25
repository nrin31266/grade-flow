import type { OverallGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";

type GpaOverviewCardsProps = {
  summary: OverallGpaSummary;
  graduationCredits?: number;
};

export function GpaOverviewCards({
  summary,
  graduationCredits,
}: GpaOverviewCardsProps) {
  const cards = [
    {
      label: "GPA hệ 4",
      value: formatGpa(summary.cumulativeGpa4),
      sub: "Tính từ bảng điểm thật đã nhập",
    },
    {
      label: "GPA hệ 10",
      value: formatGpa(summary.cumulativeGpa10),
      sub: "Tính từ bảng điểm thật đã nhập",
    },
    {
      label: "Tín chỉ đã đạt",
      value: graduationCredits
        ? `${formatCredits(summary.earnedGraduationCredits)} / ${formatCredits(
            graduationCredits,
          )}`
        : formatCredits(summary.earnedGraduationCredits),
      sub: "Từ các lượt học thật đạt điểm",
    },
    {
      label: "Còn thiếu",
      value: formatCredits(summary.remainingGraduationCredits),
      sub: "Ước tính theo tín chỉ tốt nghiệp mục tiêu",
    },
    {
      label: "Chưa có điểm",
      value: summary.pendingEnrollmentCount,
      sub: "lượt học đang chờ điểm",
    },
    {
      label: "Chưa đạt",
      value: summary.failedEnrollmentCount,
      sub: "lượt học cần chú ý",
      warning: summary.failedEnrollmentCount > 0,
    },
    {
      label: "Học lại/cải thiện",
      value: summary.repeatedCourseCount,
      sub: `${formatCredits(summary.repeatedEffectiveCredits)} tín chỉ hiệu lực / ${formatCredits(
        summary.repeatedRawCredits,
      )} tín chỉ lượt học`,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-background p-4 shadow-sm ${
            card.warning
              ? "border-yellow-300 bg-yellow-50 text-yellow-950 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100"
              : ""
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
