import type { CumulativeGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";
import type { RetakeKind } from "@/lib/retake-kind";

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

function Delta({ value, digits = 2 }: { value: number | null; digits?: number }) {
  if (value === null) return null;

  return (
    <span className={value >= 0 ? "text-xs text-emerald-500" : "text-xs text-rose-500"}>
      {value >= 0 ? "+" : ""}
      {value.toFixed(digits)}
    </span>
  );
}

const termRetakeBadge: Record<RetakeKind, string> = {
  retake: "Có học lại",
  improvement: "Có cải thiện",
  retake_or_improvement: "Học lại/cải thiện",
};

export function TermSummaryPanel({ summaries }: TermSummaryPanelProps) {
  if (summaries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
        Chưa có dữ liệu bảng điểm.
      </p>
    );
  }

  const sortedSummaries = [...summaries].sort(
    (first, second) => first.termOrder - second.termOrder,
  );
  const hasRetakeOrImprovement = sortedSummaries.some(
    (summary) => summary.retakeCount > 0,
  );

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-semibold">Bảng tổng kết học kỳ</h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Bảng tổng hợp theo học kỳ thật. GPA/TC hiệu lực đã xử lý học
          lại/cải thiện và được dùng để theo dõi mục tiêu tốt nghiệp.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-sky-50 text-left text-muted-foreground dark:bg-sky-950/20">
            <tr>
              <th className="w-40 px-3 py-2.5 font-medium">Học kỳ</th>
              <th className="w-24 px-3 py-2.5 text-center font-medium">Có điểm</th>
              <th className="w-16 px-3 py-2.5 text-right font-medium">TC GPA</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium">GPA 10</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium">GPA 4</th>
              <th className="w-16 px-3 py-2.5 text-right font-medium">TC đạt</th>
              <th className="w-28 px-3 py-2.5 text-right font-medium">GPA 10 hiệu lực</th>
              <th className="w-28 px-3 py-2.5 text-right font-medium">GPA 4 hiệu lực</th>
              <th className="w-24 px-3 py-2.5 text-right font-medium">TC hiệu lực</th>
              <th className="w-16 px-3 py-2.5 text-center font-medium">XLoại</th>
            </tr>
          </thead>
          <tbody>
            {sortedSummaries.map((summary, index) => {
              const previousSummary = sortedSummaries[index - 1];
              const grade = getGradeLabel(summary.rawGpa4);
              const warnings = getWarnings(summary);
              const effectiveGpa10Delta =
                previousSummary?.cumulativeGpa10 !== null &&
                previousSummary?.cumulativeGpa10 !== undefined &&
                summary.cumulativeGpa10 !== null
                  ? summary.cumulativeGpa10 - previousSummary.cumulativeGpa10
                  : null;
              const effectiveGpa4Delta =
                previousSummary?.cumulativeGpa4 !== null &&
                previousSummary?.cumulativeGpa4 !== undefined &&
                summary.cumulativeGpa4 !== null
                  ? summary.cumulativeGpa4 - previousSummary.cumulativeGpa4
                  : null;
              const effectiveCreditsDelta = previousSummary
                ? summary.cumulativeCredits - previousSummary.cumulativeCredits
                : null;

              return (
                <tr key={summary.actualTermId} className={`border-t transition-colors ${index % 2 === 1 ? "bg-muted/20" : ""}`}>
                  <td className="px-3 py-2.5 font-medium">
                    {summary.actualTermName}
                    {summary.retakeKind && (
                      <span
                        title="Kỳ này có lượt học thay thế điểm cũ, nên GPA hiệu lực có thể thay đổi khác với GPA học kỳ."
                        className="ml-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                      >
                        {termRetakeBadge[summary.retakeKind]}
                      </span>
                    )}
                    {warnings.length > 0 && (
                      <span className="ml-1.5 text-xs text-muted-foreground">{warnings.join(" ")}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">{summary.gradedCourseCount}/{summary.courseCount}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatCredits(summary.gpaCredits)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatGpa(summary.rawGpa10)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatGpa(summary.rawGpa4)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{formatCredits(summary.earnedCredits)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">{formatGpa(summary.cumulativeGpa10)}<Delta value={effectiveGpa10Delta} /></span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">{formatGpa(summary.cumulativeGpa4)}<Delta value={effectiveGpa4Delta} /></span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">{formatCredits(summary.cumulativeCredits)}<Delta value={effectiveCreditsDelta} digits={0} /></span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {grade ? <span className={`text-xs font-semibold ${grade.color}`}>{grade.label}</span> : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hasRetakeOrImprovement && (
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
          GPA hiệu lực có thể tăng khi học lại/cải thiện thay thế điểm cũ thấp hơn.
        </p>
      )}
    </section>
  );
}
