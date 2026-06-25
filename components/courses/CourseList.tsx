"use client";

import { Button } from "@/components/ui/button";
import type { CourseEnrollment, CourseStatus } from "@/types/academic";

type CourseListProps = {
  enrollments: CourseEnrollment[];
  onRemoveEnrollment: (enrollmentId: string) => void;
};

const statusLabels: Record<CourseStatus, string> = {
  completed: "Đã có điểm",
  pending: "Chưa có điểm",
  failed: "Chưa đạt",
  in_progress: "Đang học",
};

export function CourseList({ enrollments, onRemoveEnrollment }: CourseListProps) {
  const sortedEnrollments = [...enrollments].sort((a, b) =>
    a.actualTermId.localeCompare(b.actualTermId)
  );

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Danh sách học phần</h2>
        <p className="mt-1 text-sm text-muted-foreground">Các lượt học được lưu tạm trên trình duyệt của bạn.</p>
      </div>

      {sortedEnrollments.length === 0 ? (
        <p className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">Chưa có học phần nào. Hãy thêm học phần đầu tiên.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Mã</th>
                <th className="px-4 py-3 font-medium">Tên học phần</th>
                <th className="px-4 py-3 font-medium">Tín chỉ</th>
                <th className="px-4 py-3 font-medium">Kỳ thật</th>
                <th className="px-4 py-3 font-medium">Kỳ kế hoạch</th>
                <th className="px-4 py-3 font-medium">Điểm hệ 10</th>
                <th className="px-4 py-3 font-medium">Trạng thái</th>
                <th className="px-4 py-3 font-medium">Tính GPA</th>
                <th className="px-4 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedEnrollments.map((enrollment) => (
                <tr key={enrollment.id} className="border-t">
                  <td className="px-4 py-3">{enrollment.code ?? "-"}</td>
                  <td className="px-4 py-3 font-medium">{enrollment.name}</td>
                  <td className="px-4 py-3">{enrollment.credits}</td>
                  <td className="px-4 py-3">{enrollment.actualTermName}</td>
                  <td className="px-4 py-3">{enrollment.plannedTermNumber ? `Kỳ ${enrollment.plannedTermNumber}` : "Chưa gán"}</td>
                  <td className="px-4 py-3">{enrollment.score10 === null ? "Chưa có điểm" : enrollment.score10}</td>
                  <td className="px-4 py-3">{statusLabels[enrollment.status]}</td>
                  <td className="px-4 py-3">{enrollment.countsForGpa ? "Có" : "Không"}</td>
                  <td className="px-4 py-3"><Button type="button" variant="destructive" size="sm" onClick={() => onRemoveEnrollment(enrollment.id)}>Xóa</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
