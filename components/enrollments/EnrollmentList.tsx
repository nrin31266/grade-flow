"use client";

import { Button } from "@/components/ui/button";
import { formatCredits, formatScore } from "@/lib/number-format";
import { buildActualTermOrder } from "@/lib/semester";
import type { CourseEnrollment, CourseStatus } from "@/types/academic";

type EnrollmentListProps = {
  enrollments: CourseEnrollment[];
  onRequestEditEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestRemoveEnrollment: (enrollment: CourseEnrollment) => void;
};

const statusLabels: Record<CourseStatus, string> = {
  completed: "Đã có điểm",
  pending: "Chưa có điểm",
  failed: "Chưa đạt",
  in_progress: "Đang học",
};

export function EnrollmentList({
  enrollments,
  onRequestEditEnrollment,
  onRequestRemoveEnrollment,
}: EnrollmentListProps) {
  const sortedEnrollments = [...enrollments].sort(
    (firstEnrollment, secondEnrollment) => {
      const firstOrder = buildActualTermOrder(
        firstEnrollment.academicYear,
        firstEnrollment.termCode,
      );
      const secondOrder = buildActualTermOrder(
        secondEnrollment.academicYear,
        secondEnrollment.termCode,
      );

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return firstEnrollment.name.localeCompare(secondEnrollment.name, "vi");
    },
  );

  if (sortedEnrollments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
        Chưa có lượt học thật nào. Hãy thêm điểm hoặc import bảng điểm ở phase
        sau.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="w-44 px-4 py-3 font-medium">Kỳ thật</th>
            <th className="min-w-80 px-4 py-3 font-medium">Tên học phần</th>
            <th className="w-24 px-4 py-3 font-medium">Tín chỉ</th>
            <th className="w-28 px-4 py-3 font-medium">Điểm hệ 10</th>
            <th className="w-24 px-4 py-3 font-medium">Điểm chữ</th>
            <th className="w-20 px-4 py-3 font-medium">Hệ 4</th>
            <th className="w-32 px-4 py-3 font-medium">Trạng thái</th>
            <th className="w-28 px-4 py-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedEnrollments.map((enrollment) => (
            <tr key={enrollment.id} className="border-t align-top">
              <td className="px-4 py-3">{enrollment.actualTermName}</td>
              <td className="px-4 py-3">
                <p className="font-medium">{enrollment.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {enrollment.code ? <span>Mã: {enrollment.code}</span> : null}
                  {enrollment.isRetake ? <span>Học lại/cải thiện</span> : null}
                  {!enrollment.countsForGpa ? <span>Không tính GPA</span> : null}
                  {!enrollment.countsForGraduation ? (
                    <span>Không tính tốt nghiệp</span>
                  ) : null}
                  {enrollment.note ? <span>{enrollment.note}</span> : null}
                </div>
              </td>
              <td className="px-4 py-3">{formatCredits(enrollment.credits)}</td>
              <td className="px-4 py-3">
                {formatScore(enrollment.score10)}
              </td>
              <td className="px-4 py-3">{enrollment.letterGrade || "—"}</td>
              <td className="px-4 py-3">{enrollment.gpa4 ?? "—"}</td>
              <td className="px-4 py-3">{statusLabels[enrollment.status]}</td>
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
  );
}
