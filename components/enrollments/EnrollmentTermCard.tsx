"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { enrollmentStatusLabels } from "@/lib/academic-labels";
import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { EnrollmentTermGroup } from "@/lib/enrollment-view";
import {
  getLetterGradeTone,
  getScoreTone,
} from "@/lib/grade-visuals";
import { formatCredits, formatGpa, formatScore } from "@/lib/number-format";
import type { CourseEnrollment, TermCode } from "@/types/academic";
import type { RetakeKind } from "@/lib/retake-kind";

type EnrollmentTermCardProps = {
  group: EnrollmentTermGroup;
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
  isCollapsed?: boolean;
  onToggleCollapsed?: (termId: string) => void;
  onRequestEditEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestRemoveEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestAddEnrollmentToTerm: (term: {
    academicYear: string;
    termCode: TermCode;
  }) => void;
};

export function EnrollmentTermCard({
  group,
  effectStatusByEnrollmentId,
  isCollapsed = false,
  onToggleCollapsed,
  onRequestEditEnrollment,
  onRequestRemoveEnrollment,
  onRequestAddEnrollmentToTerm,
}: EnrollmentTermCardProps) {
  const { rawSummary } = group;
  const firstEnrollment = group.enrollments[0];
  const retakeBadge: Record<
    RetakeKind,
    { label: string; tooltip: string }
  > = {
    retake: {
      label: "Học lại",
      tooltip: "Lượt học này thay thế lượt cũ chưa đạt theo cấu hình học vụ.",
    },
    improvement: {
      label: "Cải thiện",
      tooltip: "Lượt học này thay thế lượt cũ đã đạt để cải thiện điểm.",
    },
    retake_or_improvement: {
      label: "Học lại/cải thiện",
      tooltip: "Lượt học này thay thế một lượt cũ theo cấu hình học vụ.",
    },
  };

  return (
    <article className="rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{group.actualTermName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {rawSummary.gradedEnrollmentCount}/{rawSummary.enrollmentCount} lượt học có điểm, {" "}
            {formatCredits(rawSummary.rawGpaCredits)} TC GPA, {" "}
            {formatCredits(rawSummary.rawEarnedCredits)} TC đạt
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              GPA 10: {formatGpa(rawSummary.rawGpa10)}
            </Badge>
            <Badge variant="secondary">
              GPA 4: {formatGpa(rawSummary.rawGpa4)}
            </Badge>
            <Badge variant="outline">
              TC đạt: {formatCredits(rawSummary.rawEarnedCredits)}
            </Badge>
          </div>
          {firstEnrollment ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onToggleCollapsed?.(group.actualTermId)}
            >
              {isCollapsed ? "Mở" : "Thu gọn"}
            </Button>
          ) : null}
          {firstEnrollment ? (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                onRequestAddEnrollmentToTerm({
                  academicYear: firstEnrollment.academicYear,
                  termCode: firstEnrollment.termCode,
                })
              }
            >
              Thêm vào kỳ
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 px-4 py-3">
        {isCollapsed ? null : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[960px] text-sm">
              <thead className="bg-sky-50 text-left text-muted-foreground dark:bg-sky-950/20">
                <tr>
                  <th className="min-w-64 px-3 py-2.5 font-medium">Học phần</th>
                  <th className="w-16 px-3 py-2.5 font-medium">TC</th>
                  <th className="w-20 px-3 py-2.5 font-medium">Điểm hệ 10</th>
                  <th className="w-16 px-3 py-2.5 font-medium">Điểm chữ</th>
                  <th className="w-16 px-3 py-2.5 font-medium">Điểm hệ 4</th>
                  <th className="w-24 px-3 py-2.5 font-medium">Trạng thái</th>
                  <th className="w-24 px-3 py-2.5 font-medium">Tính GPA</th>
                  <th className="w-28 px-3 py-2.5 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {group.enrollments.map((enrollment, index) => {
                  const effectStatus =
                    effectStatusByEnrollmentId[enrollment.id];

                  // Determine "Tính GPA" label
                  let effectLabel = "—";
                  let effectColor = "text-muted-foreground";
                  if (effectStatus?.reason === "pending") {
                    effectLabel = "Chờ điểm";
                    effectColor = "text-slate-500";
                  } else if (effectStatus?.reason === "duplicate_lower_score") {
                    effectLabel = "Lượt cũ";
                    effectColor = "text-amber-600 dark:text-amber-400";
                  } else if (effectStatus?.reason === "manual_excluded") {
                    effectLabel = "Không";
                    effectColor = "text-slate-500";
                  } else if (effectStatus?.reason === "failed_not_counted") {
                    effectLabel = "Chưa đạt";
                    effectColor = "text-rose-600 dark:text-rose-400";
                  } else if (effectStatus?.isEffectiveForGpa === true) {
                    effectLabel = "Có";
                    effectColor = "text-emerald-600 dark:text-emerald-400";
                  } else if (effectStatus?.isEffectiveForGpa === false) {
                    effectLabel = "Không";
                    effectColor = "text-slate-500";
                  }

                  const retakeKind = group.retakeKindByEnrollmentId[enrollment.id];
                  const badge = retakeKind ? retakeBadge[retakeKind] : null;

                  return (
                    <tr
                      key={enrollment.id}
                      className={`border-t align-top ${
                        index % 2 === 1
                          ? "bg-muted/20"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <p className="font-medium leading-6">
                          {enrollment.name}
                          {badge && (
                            <span
                              title={badge.tooltip}
                              className="ml-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 align-middle text-[10px] font-semibold leading-none text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
                            >
                              {badge.label}
                            </span>
                          )}
                          {!enrollment.countsForGpa && !badge && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              (Không tính GPA)
                            </span>
                          )}
                        </p>
                        {enrollment.code ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {enrollment.code}
                          </p>
                        ) : null}
                        {enrollment.note ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {enrollment.note}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5">{formatCredits(enrollment.credits)}</td>
                      <td className="px-3 py-2.5">
                        <span className={getScoreTone(enrollment.score10)}>
                          {formatScore(enrollment.score10)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {(() => {
                          const tone = getLetterGradeTone(enrollment.letterGrade);

                          return (
                            <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${tone.className}`}>
                              {tone.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-2.5">{formatGpa(enrollment.gpa4 ?? null)}</td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-xs font-semibold ${
                            enrollment.status === "completed"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : enrollment.status === "pending"
                                ? "text-slate-500"
                                : enrollment.status === "failed"
                                  ? "text-rose-600 dark:text-rose-400"
                                  : enrollment.status === "in_progress"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-muted-foreground"
                          })()}`}
                        >
                          {enrollmentStatusLabels[enrollment.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-xs font-semibold ${effectColor}`}>
                          {effectLabel}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mr-1.5 h-7 text-xs"
                          onClick={() => onRequestEditEnrollment(enrollment)}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => onRequestRemoveEnrollment(enrollment)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </article>
  );
}
