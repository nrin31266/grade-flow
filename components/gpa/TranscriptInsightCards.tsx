import type { TranscriptInsights } from "@/lib/transcript-insights";
import { formatGpa } from "@/lib/number-format";

type TranscriptInsightCardsProps = {
  insights: TranscriptInsights;
};

export function TranscriptInsightCards({
  insights,
}: TranscriptInsightCardsProps) {
  const items = [
    {
      label: "Kỳ tốt nhất",
      value: insights.bestTerm
        ? formatGpa(insights.bestTerm.gpa4)
        : "—",
      sub: insights.bestTerm?.actualTermName ?? "Chưa đủ dữ liệu",
    },
    {
      label: "Kỳ cần chú ý",
      value: insights.weakestTerm
        ? formatGpa(insights.weakestTerm.gpa4)
        : "—",
      sub: insights.weakestTerm?.actualTermName ?? "Chưa đủ dữ liệu",
    },
    {
      label: "Điểm A",
      value: insights.topScoreCount,
      sub: "lượt học từ 8.5 trở lên",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-background px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-xl font-semibold">{item.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}
