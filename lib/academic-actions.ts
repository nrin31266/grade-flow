import type { OverallGpaSummary } from "@/lib/gpa";

import type { GpaGoalProjection } from "@/lib/gpa-goals";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";

export type AcademicActionItem = {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

type BuildParams = {
  overallSummary: OverallGpaSummary;
  goalProjection: GpaGoalProjection;
  programCourses: StudyProgramCourse[];
  enrollments: CourseEnrollment[];
};

export function buildAcademicActionItems({
  overallSummary,
  goalProjection,
  programCourses,
  enrollments,
}: BuildParams): AcademicActionItem[] {
  const items: AcademicActionItem[] = [];

  // No enrollments at all
  if (enrollments.length === 0) {
    items.push({
      type: "info",
      title: "Chưa có bảng điểm thật",
      description:
        "Import bảng điểm hoặc thêm lượt học để bắt đầu tính GPA.",
      actionLabel: "Mở bảng điểm",
      actionHref: "/transcript",
    });
  }

  // No program courses
  if (programCourses.length === 0) {
    items.push({
      type: "info",
      title: "Chưa có chương trình học",
      description:
        "Import chương trình học để đối chiếu tiến độ tốt nghiệp.",
      actionLabel: "Mở chương trình",
      actionHref: "/program",
    });
  }

  // Pending enrollments
  if (overallSummary.pendingEnrollmentCount > 0) {
    items.push({
      type: "warning",
      title: "Có môn đang chờ điểm",
      description: `${overallSummary.pendingEnrollmentCount} lượt học chưa có điểm. Khi có điểm, hãy cập nhật để GPA chính xác hơn.`,
      actionLabel: "Mở bảng điểm",
      actionHref: "/transcript",
    });
  }

  // Failed enrollments
  if (overallSummary.failedEnrollmentCount > 0) {
    items.push({
      type: "warning",
      title: "Có môn chưa đạt",
      description: `${overallSummary.failedEnrollmentCount} lượt học cần chú ý. Kiểm tra chính sách học lại/cải thiện.`,
      actionLabel: "Mở bảng điểm",
      actionHref: "/transcript",
    });
  }

  // Goal impossible
  if (
    goalProjection.gpa4Status === "impossible" ||
    goalProjection.gpa10Status === "impossible"
  ) {
    items.push({
      type: "warning",
      title: "Mục tiêu GPA hiện không khả thi với tín chỉ còn lại",
      description:
        "Hãy điều chỉnh mục tiêu hoặc kiểm tra lại tín chỉ còn lại.",
      actionLabel: "Chỉnh mục tiêu",
    });
  }

  // Goal hard
  if (
    goalProjection.gpa4Status === "hard" ||
    goalProjection.gpa10Status === "hard"
  ) {
    items.push({
      type: "info",
      title: "Mục tiêu GPA khá cao",
      description:
        "Bạn cần điểm trung bình cao ở các tín chỉ còn lại. Cân nhắc điều chỉnh mục tiêu nếu cần.",
      actionLabel: "Chỉnh mục tiêu",
    });
  }

  // All good
  if (items.length === 0) {
    items.push({
      type: "success",
      title: "Dữ liệu đang ổn",
      description: "Không có cảnh báo lớn từ bảng điểm hiện tại.",
    });
  }

  return items;
}
