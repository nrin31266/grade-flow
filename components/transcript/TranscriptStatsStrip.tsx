type TranscriptStatsStripProps = {
  totalEnrollments: number;
  pendingEnrollments: number;
  failedEnrollments: number;
  retakeCourseCount: number;
  notCountedEnrollments: number;
};

export function TranscriptStatsStrip({
  totalEnrollments,
  pendingEnrollments,
  failedEnrollments,
  retakeCourseCount,
  notCountedEnrollments,
}: TranscriptStatsStripProps) {
  const stats = [
    {
      label: "Tổng lượt học",
      value: totalEnrollments,
      color: "text-foreground",
    },
    {
      label: "Chờ điểm",
      value: pendingEnrollments,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Chưa đạt",
      value: failedEnrollments,
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Học lại/cải thiện",
      value: retakeCourseCount,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Không tính GPA",
      value: notCountedEnrollments,
      color: "text-slate-500 dark:text-slate-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs shadow-sm"
        >
          <span className="text-muted-foreground">{stat.label}:</span>
          <span className={`font-semibold tabular-nums ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
