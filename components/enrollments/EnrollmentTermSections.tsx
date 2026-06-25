"use client";

import { EnrollmentTermCard } from "@/components/enrollments/EnrollmentTermCard";
import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { EnrollmentTermGroup } from "@/lib/enrollment-view";
import type { CourseEnrollment, TermCode } from "@/types/academic";

type EnrollmentTermSectionsProps = {
  groups: EnrollmentTermGroup[];
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
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
      {groups.map((group) => (
        <EnrollmentTermCard
          key={group.actualTermId}
          group={group}
          effectStatusByEnrollmentId={effectStatusByEnrollmentId}
          onRequestEditEnrollment={onRequestEditEnrollment}
          onRequestRemoveEnrollment={onRequestRemoveEnrollment}
          onRequestAddEnrollmentToTerm={onRequestAddEnrollmentToTerm}
        />
      ))}
    </div>
  );
}
