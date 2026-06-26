import type { CumulativeGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";

type TermSummaryPanelProps = {
  summaries: CumulativeGpaSummary[];
};

function getGradeLabel(gpa4: number | null): {
  label: string;
  color: string;
} | null {
  if (gpa4 === null) return null;
  if (gpa4 >= 3.6) return { label: "XS", color: "text-emerald-600 dark:text-emerald-400" };
  if (gpa4 >= 3.2) return { label: "Giỏi", color: "text-blue-600 dark:text-blue-400" };
  if (gpa4 >= 2.5) return { label: "Khá", color: "text-sky-600 dark:text-sky-400" };
  if (gpa4 >= 2.0) return { label: "TB", color: "text-amber-600 dark:text-amber-400" };
  return { label: "Yếu", color: "text-rose-600 dark:text-rose-400" };
}

function getWarnings(summary: CumulativeGpaSummary): string[] {
  const warnings: string[] = [];
  if (summary.pendingCount > 0) warnings.push(`⏳${summary.pendingCount}`);
  if (summary.failedCount > 0) warnings.push(`✗${summary.failedCount}`);
  return warnings;
}

export function TermSummaryPanel({
  summaries,
}: TermSummaryPanelProps) {
  if (summaries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
        Chưa có dữ liệu bảng điểm.
      </p>
    );
  }

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-semibold">Bảng tổng kết học kỳ</h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Tổng hợp kết quả học tập theo từng học kỳ thật. TL là tích lũy —
          GPA và tín chỉ đã xử lý học lại/cải thiện.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-sky-50 text-left text-muted-foreground dark:bg-sky-950/20">
            <tr>
              <th className="w-40 px-3 py-2.5 font-medium">Học kỳ</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium">Có điểm</th>
              <th className="w-16 px-3 py-2.5 text-right font-medium">TC GPA</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium">GPA 10</th>
              <th className="w-28 px-3 py-2.5 text-right font-medium">GPA 4</th>
              <th className="w-16 px-3 py-2.5 text-right font-medium">TC đạt</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium">GPA 10 TL</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium">GPA 4 TL</th>
              <th className="w-16 px-3 py-2.5 text-right font-medium">TC TL</th>
              <th className="w-16 px-3 py-2.5 text-center font-medium">XLoại</th>
            </tr>
          </thead>
          <tbody>
            {[...summaries]
              .sort((a, b) => a.termOrder - b.termOrder)
              .map((summary, index, arr) => {
              const grade = getGradeLabel(summary.rawGpa4);
              const warnings = getWarnings(summary);

              // Cumulative change from previous (older) term
              const delta4 =
                index > 0 &&
                summary.cumulativeGpa4 !== null &&
                arr[index - 1].cumulativeGpa4 !== null
                  ? summary.cumulativeGpa4 - arr[index - 1].cumulativeGpa4!
                  : null;
              const delta10 =
                index > 0 &&
                summary.cumulativeGpa10 !== null &&
                arr[index - 1].cumulativeGpa10 !== null
                  ? summary.cumulativeGpa10 - arr[index - 1].cumulativeGpa10!
                  : null;

              return (
                <tr
                  key={summary.actualTermId}
                  className={`border-t transition-colors ${
                    index % 2 === 1 ? "bg-muted/20" : ""
                  }`}
                >
                  <td className="px-3 py-2.5 font-medium">
                    {summary.actualTermName}
                    {warnings.length > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {warnings.join(" ")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {summary.gradedCourseCount}/{summary.courseCount}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatCredits(summary.gpaCredits)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatGpa(summary.rawGpa10)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatGpa(summary.rawGpa4)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatCredits(summary.earnedCredits)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      {formatGpa(summary.cumulativeGpa10)}
                      {delta10 !== null && (
                        <span
                          className={
                            delta10 >= 0
                              ? "text-emerald-500 text-xs"
                              : "text-rose-500 text-xs"
                          }
                        >
                          {delta10 >= 0 ? "+" : ""}
                          {delta10.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      {formatGpa(summary.cumulativeGpa4)}
                      {delta4 !== null && (
                        <span
                          className={
                            delta4 >= 0
                              ? "text-emerald-500 text-xs"
                              : "text-rose-500 text-xs"
                          }
                        >
                          {delta4 >= 0 ? "+" : ""}
                          {delta4.toFixed(2)}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatCredits(summary.cumulativeEarnedCredits)}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {grade ? (
                      <span className={`text-xs font-semibold ${grade.color}`}>
                        {grade.label}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        Công thức GPA học kỳ = tổng(điểm × tín chỉ) / tổng(tín chỉ tính GPA).
        GPA tích lũy dùng các lượt học hiệu lực theo cấu hình học vụ.
      </p>
    </section>
  );
}
