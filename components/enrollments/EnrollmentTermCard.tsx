"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { EnrollmentTermGroup } from "@/lib/enrollment-view";
import { formatCredits, formatGpa, formatScore } from "@/lib/number-format";
import type { CourseEnrollment, TermCode } from "@/types/academic";

type EnrollmentTermCardProps = {
  group: EnrollmentTermGroup;
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
  onRequestEditEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestRemoveEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestAddEnrollmentToTerm: (term: {
    academicYear: string;
    termCode: TermCode;
  }) => void;
};

const statusLabels: Record<CourseEnrollment["status"], string> = {
  completed: "Đã có điểm",
  pending: "Chưa có điểm",
  failed: "Chưa đạt",
  in_progress: "Đang học",
};

const effectReasonLabels: Record<EnrollmentEffectStatus["reason"], string> = {
  only_attempt: "Đang tính GPA",
  highest_score: "Điểm hiệu lực",
  latest_attempt: "Lượt hiệu lực mới nhất",
  manual_included: "Tính theo thiết lập",
  manual_excluded: "Không tính theo thiết lập",
  pending: "Chờ điểm",
  failed_not_counted: "Không tính do chưa đạt",
  duplicate_lower_score: "Không tính do đã có lượt điểm cao hơn",
};

function EnrollmentFlags({ enrollment }: { enrollment: CourseEnrollment }) {
  const flags = [
    enrollment.isRetake ? "Học lại/cải thiện" : null,
    !enrollment.countsForGpa ? "Không tính GPA" : null,
    !enrollment.countsForGraduation ? "Không tính tốt nghiệp" : null,
  ].filter(Boolean);

  if (flags.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {flags.map((flag) => (
        <Badge key={flag} variant="outline" className="text-muted-foreground">
          {flag}
        </Badge>
      ))}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function EnrollmentTermCard({
  group,
  effectStatusByEnrollmentId,
  onRequestEditEnrollment,
  onRequestRemoveEnrollment,
  onRequestAddEnrollmentToTerm,
}: EnrollmentTermCardProps) {
  const { summary } = group;
  const firstEnrollment = group.enrollments[0];

  return (
    <article className="rounded-xl border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{group.actualTermName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.gradedCourseCount}/{summary.courseCount} lượt học có điểm ·{" "}
            {formatCredits(summary.gpaCredits)} tín chỉ GPA
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-48">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">GPA 10 hiệu lực</p>
              <p className="font-semibold">{formatGpa(summary.gpa10)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">GPA 4 hiệu lực</p>
              <p className="font-semibold">{formatGpa(summary.gpa4)}</p>
            </div>
          </div>
          {firstEnrollment ? (
            <Button
              type="button"
              onClick={() =>
                onRequestAddEnrollmentToTerm({
                  academicYear: firstEnrollment.academicYear,
                  termCode: firstEnrollment.termCode,
                })
              }
            >
              Thêm lượt học vào kỳ này
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <SummaryItem
            label="GPA 10 hiệu lực"
            value={formatGpa(summary.gpa10)}
            sub="trừ lượt cải thiện không hiệu lực"
          />
          <SummaryItem
            label="GPA 4 hiệu lực"
            value={formatGpa(summary.gpa4)}
            sub="trừ lượt cải thiện không hiệu lực"
          />
          <SummaryItem
            label="GPA 10 lượt học"
            value={formatGpa(summary.rawGpa10)}
            sub="tính cả lượt nhập trong kỳ"
          />
          <SummaryItem
            label="GPA 4 lượt học"
            value={formatGpa(summary.rawGpa4)}
            sub="tính cả lượt nhập trong kỳ"
          />
          <SummaryItem
            label="Tín chỉ GPA"
            value={formatCredits(summary.gpaCredits)}
          />
          <SummaryItem
            label="Tín chỉ đạt kỳ"
            value={formatCredits(summary.earnedCredits)}
          />
          <SummaryItem
            label="GPA 10 lũy kế"
            value={formatGpa(summary.cumulativeGpa10)}
          />
          <SummaryItem
            label="GPA 4 lũy kế"
            value={formatGpa(summary.cumulativeGpa4)}
          />
          <SummaryItem
            label="TC đạt lũy kế"
            value={formatCredits(summary.cumulativeEarnedCredits)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="min-w-80 px-4 py-3 font-medium">Môn học</th>
                <th className="w-24 px-4 py-3 font-medium">Tín chỉ</th>
                <th className="w-28 px-4 py-3 font-medium">Điểm hệ 10</th>
                <th className="w-24 px-4 py-3 font-medium">Điểm chữ</th>
                <th className="w-24 px-4 py-3 font-medium">Hệ 4</th>
                <th className="w-32 px-4 py-3 font-medium">Trạng thái</th>
                <th className="min-w-48 px-4 py-3 font-medium">Ghi chú</th>
                <th className="w-36 px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {group.enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-t align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium leading-6">{enrollment.name}</p>
                    {enrollment.code ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Mã: {enrollment.code}
                      </p>
                    ) : null}
                    <EnrollmentFlags enrollment={enrollment} />
                  </td>
                  <td className="px-4 py-3">{formatCredits(enrollment.credits)}</td>
                  <td className="px-4 py-3">{formatScore(enrollment.score10)}</td>
                  <td className="px-4 py-3">
                    {enrollment.letterGrade || "—"}
                  </td>
                  <td className="px-4 py-3">{formatGpa(enrollment.gpa4 ?? null)}</td>
                  <td className="px-4 py-3">{statusLabels[enrollment.status]}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="grid gap-2">
                      <Badge
                        variant={
                          effectStatusByEnrollmentId[enrollment.id]
                            ?.isEffectiveForGpa
                            ? "default"
                            : "outline"
                        }
                      >
                        {effectStatusByEnrollmentId[enrollment.id]
                          ? effectReasonLabels[
                              effectStatusByEnrollmentId[enrollment.id].reason
                            ]
                          : "Chưa xác định"}
                      </Badge>
                      <span>{enrollment.note || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestEditEnrollment(enrollment)}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onRequestRemoveEnrollment(enrollment)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
