import type { CumulativeGpaSummary } from "@/lib/gpa";
import { formatCredits, formatGpa } from "@/lib/number-format";

type TermGpaTableProps = {
  summaries: CumulativeGpaSummary[];
};

function getSummaryNote(summary: CumulativeGpaSummary): string {
  const notes: string[] = [];

  if (summary.pendingCount > 0) {
    notes.push(`${summary.pendingCount} chưa có điểm`);
  }

  if (summary.failedCount > 0) {
    notes.push(`${summary.failedCount} chưa đạt`);
  }

  return notes.length > 0 ? notes.join(" · ") : "—";
}

export function TermGpaTable({ summaries }: TermGpaTableProps) {
  if (summaries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
        Chưa có dữ liệu GPA. Hãy gán điểm cho một học phần trước.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
      <table className="w-full min-w-[1320px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="w-44 px-4 py-3 font-medium">Kỳ thật</th>
            <th className="w-32 px-4 py-3 font-medium">Lượt học có điểm</th>
            <th className="w-28 px-4 py-3 font-medium">Tín chỉ GPA</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 10 hiệu lực</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 4 hiệu lực</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 10 lượt học</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 4 lượt học</th>
            <th className="w-32 px-4 py-3 font-medium">Tín chỉ đạt kỳ</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 10 lũy kế</th>
            <th className="w-32 px-4 py-3 font-medium">GPA 4 lũy kế</th>
            <th className="w-36 px-4 py-3 font-medium">Tín chỉ đạt lũy kế</th>
            <th className="w-40 px-4 py-3 font-medium">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr key={summary.actualTermId} className="border-t">
              <td className="px-4 py-3 font-medium">{summary.actualTermName}</td>
              <td className="px-4 py-3">
                {summary.gradedCourseCount} / {summary.courseCount}
              </td>
              <td className="px-4 py-3">{formatCredits(summary.gpaCredits)}</td>
              <td className="px-4 py-3">{formatGpa(summary.gpa10)}</td>
              <td className="px-4 py-3">{formatGpa(summary.gpa4)}</td>
              <td className="px-4 py-3">{formatGpa(summary.rawGpa10)}</td>
              <td className="px-4 py-3">{formatGpa(summary.rawGpa4)}</td>
              <td className="px-4 py-3">
                {formatCredits(summary.earnedCredits)}
              </td>
              <td className="px-4 py-3">
                {formatGpa(summary.cumulativeGpa10)}
              </td>
              <td className="px-4 py-3">
                {formatGpa(summary.cumulativeGpa4)}
              </td>
              <td className="px-4 py-3">
                {formatCredits(summary.cumulativeEarnedCredits)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {getSummaryNote(summary)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
