import type { DashboardDataStatus } from "@/lib/dashboard-data-status";
import { formatCredits } from "@/lib/number-format";

type DataStatusCardsProps = {
  status: DashboardDataStatus;
};

export function DataStatusCards({ status }: DataStatusCardsProps) {
  const cards = [
    {
      label: "Chương trình học",
      value: status.programCourseCount,
      sub: `${formatCredits(status.totalProgramCredits)} tín chỉ trong khung chương trình`,
    },
    {
      label: "Bảng điểm thật",
      value: status.enrollmentCount,
      sub: `${status.gradedEnrollmentCount} lượt học thật đã có điểm`,
      info: status.isTranscriptEmpty || status.isTranscriptSparse,
    },
    {
      label: "Đã liên kết",
      value: status.linkedProgramCourseCount,
      sub: `${status.linkedProgramCourseCount} / ${status.programCourseCount} học phần trong khung có lượt học thật`,
    },
    {
      label: "Chưa có điểm",
      value: status.programCoursesWithoutGradeCount,
      sub: "học phần trong chương trình",
      info: status.programCoursesWithoutGradeCount > 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border bg-background p-4 shadow-sm ${
            card.info
              ? "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100"
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
