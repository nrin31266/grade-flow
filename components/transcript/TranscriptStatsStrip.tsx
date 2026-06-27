import { formatCredits } from "@/lib/number-format";

export type TranscriptStats = {
  totalAttempts: number;
  gradedAttempts: number;
  pendingAttempts: number;
  pendingCredits: number;
  failedAttempts: number;
  failedCredits: number;
  retakeOrImprovementAttempts: number;
  retakeOrImprovementCredits: number;
  excludedAttempts: number;
  excludedCredits: number;
  effectiveCredits: number;
};

type TranscriptStatsStripProps = {
  stats: TranscriptStats;
};

export function TranscriptStatsStrip({ stats }: TranscriptStatsStripProps) {
  const items = [
    {
      label: "Tổng lượt đăng ký",
      value: `${stats.totalAttempts}`,
      color: "text-foreground",
    },
    {
      label: "Đã có điểm",
      value: `${stats.gradedAttempts} (${formatCredits(stats.effectiveCredits)} TC hiệu lực)`,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Chờ điểm",
      value: `${stats.pendingAttempts} (${formatCredits(stats.pendingCredits)} TC)`,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Chưa đạt",
      value: `${stats.failedAttempts} (${formatCredits(stats.failedCredits)} TC)`,
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Học lại/cải thiện",
      value: `${stats.retakeOrImprovementAttempts} (${formatCredits(stats.retakeOrImprovementCredits)} TC)`,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Không tính GPA",
      value: `${stats.excludedAttempts} (${formatCredits(stats.excludedCredits)} TC)`,
      color: "text-slate-500 dark:text-slate-400",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <div
          key={item.label}
          className="inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm shadow-sm"
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span className={`font-semibold tabular-nums ${item.color}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
