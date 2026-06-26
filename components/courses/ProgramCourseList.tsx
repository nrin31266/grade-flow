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
import { getLetterGradeTone } from "@/lib/grade-visuals";
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
      <p className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
        {hasAnyCourse
          ? "Không tìm thấy học phần phù hợp với bộ lọc hiện tại."
          : "Chưa có học phần nào trong chương trình. Hãy import JSON hoặc thêm học phần đầu tiên."}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background shadow-sm">
      <table className="w-full min-w-[1100px] text-sm">
        <thead className="bg-muted text-left text-muted-foreground">
          <tr>
            <th className="w-24 px-3 py-2.5 font-medium">Kỳ</th>
            <th className="w-28 px-3 py-2.5 font-medium">Mã</th>
            <th className="min-w-80 px-3 py-2.5 font-medium">Tên học phần</th>
            <th className="w-20 px-3 py-2.5 font-medium">TC</th>
            <th className="w-36 px-3 py-2.5 font-medium">Khối</th>
            <th className="w-28 px-3 py-2.5 font-medium">Loại</th>
            <th className="w-36 px-3 py-2.5 font-medium">Điểm</th>
            <th className="w-48 px-3 py-2.5 font-medium">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, index) => {
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
              <tr
                key={course.id}
                className={`border-t align-top ${
                  index % 2 === 1 ? "bg-muted/20" : ""
                }`}
              >
                <td className="px-3 py-2.5">
                  {course.plannedTermNumber
                    ? `Kỳ ${course.plannedTermNumber}`
                    : "Chưa gán"}
                </td>
                <td className="px-3 py-2.5 font-medium text-muted-foreground">
                  {course.code || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <p className="max-w-xl font-medium leading-6">{course.name}</p>
                  {course.note ? (
                    <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                      {course.note}
                    </p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5">{course.credits}</td>
                <td className="px-3 py-2.5">
                  {knowledgeBlockLabels[course.knowledgeBlock]}
                </td>
                <td className="px-3 py-2.5">
                  {requirementTypeLabels[course.requirementType]}
                </td>
                <td className="px-3 py-2.5">
                  {enrollmentCount === 0 ? (
                    <span className="text-xs font-semibold text-muted-foreground">
                      Chưa có
                    </span>
                  ) : scoredEffectiveEnrollment ? (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatScore(scoredEffectiveEnrollment.score10)}
                      </span>
                      {(() => {
                        const tone = getLetterGradeTone(
                          scoredEffectiveEnrollment.letterGrade,
                        );
                        return (
                          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${tone.className}`}>
                            {tone.label}
                          </span>
                        );
                      })()}
                      {scoredEffectiveEnrollment.isRetake && (
                        <span className="text-xs text-muted-foreground">
                          · Cải thiện
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      Chờ điểm
                    </span>
                  )}
                  {enrollmentCount > 1 && !scoredEffectiveEnrollment ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {enrollmentCount} lượt
                    </p>
                  ) : null}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                    {onRequestAddEnrollment ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mr-1.5 h-7 text-xs"
                        onClick={() => onRequestAddEnrollment(course)}
                        aria-label={
                          enrollmentCount > 0
                            ? "Thêm lượt học mới"
                            : "Gán điểm cho học phần"
                        }
                        title={
                          enrollmentCount > 0
                            ? "Thêm lượt học mới"
                            : "Gán điểm cho học phần"
                        }
                      >
                        {enrollmentCount > 0 ? "Thêm" : "Gán"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mr-1.5 h-7 text-xs"
                      onClick={() => onRequestEditCourse(course)}
                    >
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onRequestRemoveCourse(course)}
                      aria-label="Xóa học phần khỏi chương trình"
                      title="Xóa học phần khỏi chương trình"
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
  );
}
