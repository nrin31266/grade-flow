"use client";

import { Button } from "@/components/ui/button";
import type { EffectiveEnrollmentResult } from "@/lib/effective-enrollments";
import {
  knowledgeBlockLabels,
  requirementTypeLabels,
} from "@/lib/program-course-labels";
import {
  countEnrollmentsForProgramCourse,
  getEffectiveEnrollmentForProgramCourse,
} from "@/lib/enrollment-view";
import { formatScore } from "@/lib/number-format";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";

type ProgramCourseListProps = {
  courses: StudyProgramCourse[];
  hasAnyCourse: boolean;
  enrollments?: CourseEnrollment[];
  effectiveResult?: EffectiveEnrollmentResult;
  onRequestAddEnrollment?: (course: StudyProgramCourse) => void;
  onRequestEditCourse: (course: StudyProgramCourse) => void;
  onRequestRemoveCourse: (course: StudyProgramCourse) => void;
};

export function ProgramCourseList({
  courses,
  hasAnyCourse,
  enrollments = [],
  effectiveResult,
  onRequestAddEnrollment,
  onRequestEditCourse,
  onRequestRemoveCourse,
}: ProgramCourseListProps) {
  if (courses.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
        {hasAnyCourse
          ? "Không tìm thấy học phần phù hợp với bộ lọc hiện tại."
          : "Chưa có học phần nào trong chương trình. Hãy import JSON hoặc thêm học phần đầu tiên."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-background shadow-sm">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="w-28 px-4 py-3 font-medium">Kỳ</th>
            <th className="w-32 px-4 py-3 font-medium">Mã</th>
            <th className="min-w-80 px-4 py-3 font-medium">Tên học phần</th>
            <th className="w-24 px-4 py-3 font-medium">Tín chỉ</th>
            <th className="w-40 px-4 py-3 font-medium">Khối kiến thức</th>
            <th className="w-32 px-4 py-3 font-medium">Loại</th>
            <th className="w-40 px-4 py-3 font-medium">Trạng thái điểm</th>
            <th className="w-56 px-4 py-3 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const enrollmentCount = countEnrollmentsForProgramCourse(
              course.id,
              enrollments,
            );
            const effectiveEnrollment = effectiveResult
              ? getEffectiveEnrollmentForProgramCourse(course.id, effectiveResult)
              : null;
            const scoredEffectiveEnrollment =
              effectiveEnrollment && effectiveEnrollment.score10 !== null
                ? effectiveEnrollment
                : null;

            return (
              <tr key={course.id} className="border-t align-top">
                <td className="px-4 py-3">
                  {course.plannedTermNumber
                    ? `Kỳ ${course.plannedTermNumber}`
                    : "Chưa gán"}
                </td>
                <td className="px-4 py-3 font-medium text-muted-foreground">
                  {course.code || "—"}
                </td>
                <td className="px-4 py-3">
                  <p className="max-w-xl font-medium leading-6">{course.name}</p>
                  {course.note ? (
                    <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                      {course.note}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3">{course.credits}</td>
                <td className="px-4 py-3">
                  {knowledgeBlockLabels[course.knowledgeBlock]}
                </td>
                <td className="px-4 py-3">
                  {requirementTypeLabels[course.requirementType]}
                </td>
                <td className="px-4 py-3">
                  {enrollmentCount === 0 ? (
                    <span className="text-muted-foreground">Chưa gán điểm</span>
                  ) : scoredEffectiveEnrollment ? (
                    <div>
                      <p className="font-medium">
                        {formatScore(scoredEffectiveEnrollment.score10)} ·{" "}
                        {scoredEffectiveEnrollment.letterGrade || "—"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Điểm hiệu lực · {enrollmentCount} lượt học
                        {scoredEffectiveEnrollment.isRetake
                          ? " · Có cải thiện"
                          : ""}
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <p>Có lượt học nhưng chưa tính</p>
                      <p className="mt-1 text-xs">{enrollmentCount} lượt học</p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {onRequestAddEnrollment ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onRequestAddEnrollment(course)}
                      >
                        {enrollmentCount > 0 ? "Thêm lượt" : "Gán điểm"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRequestEditCourse(course)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => onRequestRemoveCourse(course)}
                    >
                      Xóa khỏi khung
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
