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
      sub: `${formatCredits(status.totalProgramCredits)} tín chỉ từ khung đã import/thêm`,
    },
    {
      label: "Bảng điểm thật",
      value: status.enrollmentCount,
      sub: `${status.gradedEnrollmentCount} lượt có điểm từ bảng điểm thật`,
      info: status.isTranscriptEmpty || status.isTranscriptSparse,
    },
    {
      label: "Đã liên kết",
      value: status.linkedProgramCourseCount,
      sub: `${status.linkedProgramCourseCount} / ${status.programCourseCount} môn khung đã khớp bảng điểm`,
    },
    {
      label: "Chưa có điểm",
      value: status.programCoursesWithoutGradeCount,
      sub: "môn trong khung chưa có lượt điểm hiệu lực",
      info: status.programCoursesWithoutGradeCount > 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border bg-background px-4 py-3 shadow-sm ${
            card.info
              ? "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100"
              : ""
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground">
            {card.label}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {card.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
