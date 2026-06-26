import type { ProgramCourseStatsValue } from "@/lib/program-course-view";

type ProgramCourseStatsProps = {
  stats: ProgramCourseStatsValue;
  graduationCredits?: number;
  requiredGraduationCredits?: number;
  electiveGraduationCredits?: number;
};

export function ProgramCourseStats({
  stats,
  graduationCredits,
  requiredGraduationCredits,
  electiveGraduationCredits,
}: ProgramCourseStatsProps) {
  const statItems = [
    {
      label: "Học phần",
      value: stats.courseCount,
      sub: "môn trong chương trình",
    },
    {
      label: "Tín chỉ chương trình",
      value: stats.totalCredits,
      sub: "tín chỉ trong khung đã nhập",
      detail: graduationCredits
        ? `Mục tiêu tốt nghiệp: ${graduationCredits} tín chỉ`
        : "Khung có thể gồm nhiều học phần tự chọn.",
    },
    {
      label: "Bắt buộc",
      value: stats.requiredCredits,
      sub: requiredGraduationCredits
        ? `mục tiêu: ${requiredGraduationCredits} tín chỉ`
        : "tín chỉ bắt buộc trong khung",
    },
    {
      label: "Tự chọn",
      value: stats.electiveCredits,
      sub: electiveGraduationCredits
        ? `mục tiêu: ${electiveGraduationCredits} tín chỉ`
        : "tín chỉ tự chọn trong khung",
    },
    {
      label: "Chưa gán kỳ",
      value: stats.unassignedCount,
      sub:
        stats.unassignedCount > 0
          ? `${stats.unassignedCredits} tín chỉ chưa gán kỳ kế hoạch`
          : "đã gán đủ kỳ kế hoạch",
      warning: stats.unassignedCount > 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map((item) => (
        <div
          key={item.label}
          className={`rounded-lg border bg-background px-4 py-3 shadow-sm ${
            item.warning
              ? "border-yellow-300 bg-yellow-50 text-yellow-950 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100"
              : ""
          }`}
        >
          <p className="text-sm font-medium text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {item.value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
          {"detail" in item && item.detail ? (
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
