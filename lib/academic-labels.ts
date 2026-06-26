import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { CourseStatus } from "@/types/academic";

export type AcademicLabel = {
  label: string;
  description: string;
  className?: string;
};

export const enrollmentStatusLabels: Record<CourseStatus, AcademicLabel> = {
  completed: {
    label: "Đã có điểm",
    description: "Lượt học đã có điểm tổng kết.",
  },
  pending: {
    label: "Chờ điểm",
    description: "Lượt học chưa có điểm tổng kết.",
  },
  failed: {
    label: "Chưa đạt",
    description: "Điểm dưới ngưỡng đạt.",
  },
  in_progress: {
    label: "Đang học",
    description: "Lượt học đang diễn ra.",
  },
};

const effectiveLabel: AcademicLabel = {
  label: "Tính GPA",
  description: "Lượt này được dùng để tính GPA/tín chỉ hiệu lực.",
  className: "border-cyan-200 bg-cyan-50 text-cyan-800",
};

export const enrollmentEffectLabels: Record<
  EnrollmentEffectStatus["reason"],
  AcademicLabel
> = {
  only_attempt: effectiveLabel,
  highest_score: effectiveLabel,
  latest_attempt: effectiveLabel,
  manual_included: effectiveLabel,
  manual_excluded: {
    label: "Không",
    description: "Lượt học này không tính vào GPA.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  pending: {
    label: "Chờ điểm",
    description: "Chưa có điểm tổng kết nên chưa tính GPA.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  failed_not_counted: {
    label: "Chưa đạt",
    description: "Điểm dưới ngưỡng đạt.",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  duplicate_lower_score: {
    label: "Lượt cũ",
    description: "Vẫn thuộc học kỳ này nhưng không dùng cho GPA tích lũy.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

export const noEffectiveEnrollmentLabel: AcademicLabel = {
  label: "Không",
  description: "Không dùng cho GPA/tín chỉ tích lũy.",
  className: "border-slate-200 bg-slate-50 text-slate-700",
};
