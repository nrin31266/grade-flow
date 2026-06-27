import type { RetakeImprovementSummary } from "@/lib/retake-improvement-summary";
import { formatCredits } from "@/lib/number-format";
import type { RetakeSettings } from "@/types/profile";

type RetakeImprovementSummaryCardProps = {
  summary: RetakeImprovementSummary;
  settings: RetakeSettings;
  graduationCredits?: number;
};

function isOverLimit(
  credits: number,
  graduationCredits: number | undefined,
  percent: number | undefined,
): boolean {
  if (!graduationCredits || percent === undefined) {
    return false;
  }

  return (credits / graduationCredits) * 100 > percent;
}

export function RetakeImprovementSummaryCard({
  summary,
  settings,
  graduationCredits,
}: RetakeImprovementSummaryCardProps) {
  const retakeOverLimit = isOverLimit(
    summary.retakeRawCredits,
    graduationCredits,
    settings.retakeCreditWarningPercent,
  );
  const improvementOverLimit = isOverLimit(
    summary.improvementRawCredits,
    graduationCredits,
    settings.improvementCreditWarningPercent,
  );

  const hasWarning = retakeOverLimit || improvementOverLimit;

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto] lg:items-center">
        <div>
          <h3 className="text-sm font-semibold">Học lại/cải thiện</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Theo dõi lượt học lặp; tín chỉ đạt vẫn lấy theo lượt hiệu lực.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-72">
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Học lại</p>
            <p className="font-semibold">
              {summary.retakeCourseCount} môn ({formatCredits(summary.retakeRawCredits)} TC)
            </p>
          </div>
          <div className="rounded-md border bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Cải thiện</p>
            <p className="font-semibold">
              {summary.improvementCourseCount} môn ({formatCredits(summary.improvementRawCredits)} TC)
            </p>
          </div>
        </div>

        {hasWarning ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Có thể ảnh hưởng xếp loại
          </p>
        ) : (
          <p className="text-xs text-muted-foreground lg:text-right">
            Không cộng trùng vào tín chỉ đã đạt.
          </p>
        )}
      </div>
    </section>
  );
}
