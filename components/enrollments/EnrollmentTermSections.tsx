"use client";

import { EnrollmentTermCard } from "@/components/enrollments/EnrollmentTermCard";
import { Button } from "@/components/ui/button";
import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { EnrollmentTermGroup } from "@/lib/enrollment-view";
import type { CourseEnrollment, TermCode } from "@/types/academic";

type EnrollmentTermSectionsProps = {
  groups: EnrollmentTermGroup[];
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
  collapsedTermIds?: string[];
  onToggleTerm?: (termId: string) => void;
  onCollapseAll?: () => void;
  onExpandAll?: () => void;
  onRequestEditEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestRemoveEnrollment: (enrollment: CourseEnrollment) => void;
  onRequestAddEnrollmentToTerm: (term: {
    academicYear: string;
    termCode: TermCode;
  }) => void;
};

export function EnrollmentTermSections({
  groups,
  effectStatusByEnrollmentId,
  collapsedTermIds = [],
  onToggleTerm,
  onCollapseAll,
  onExpandAll,
  onRequestEditEnrollment,
  onRequestRemoveEnrollment,
  onRequestAddEnrollmentToTerm,
}: EnrollmentTermSectionsProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Chưa có bảng điểm thật</p>
        <p className="mt-1">
          Hãy thêm lượt học thủ công hoặc import bảng điểm ở bước sau.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Chi tiết học phần theo học kỳ</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Mỗi học kỳ hiển thị các học phần đã đăng ký và điểm tổng kết.
          </p>
        </div>
        {groups.length > 1 ? (
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onExpandAll}
            >
              Mở tất cả
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCollapseAll}
            >
              Thu gọn tất cả
            </Button>
          </div>
        ) : null}
      </div>
      {groups.map((group) => (
        <EnrollmentTermCard
          key={group.actualTermId}
          group={group}
          effectStatusByEnrollmentId={effectStatusByEnrollmentId}
          isCollapsed={collapsedTermIds.includes(group.actualTermId)}
          onToggleCollapsed={onToggleTerm}
          onRequestEditEnrollment={onRequestEditEnrollment}
          onRequestRemoveEnrollment={onRequestRemoveEnrollment}
          onRequestAddEnrollmentToTerm={onRequestAddEnrollmentToTerm}
        />
      ))}
    </div>
  );
}
