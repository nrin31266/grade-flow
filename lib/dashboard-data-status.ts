import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";

export type DashboardDataStatus = {
  programCourseCount: number;
  totalProgramCredits: number;
  enrollmentCount: number;
  gradedEnrollmentCount: number;
  pendingEnrollmentCount: number;
  failedEnrollmentCount: number;
  linkedProgramCourseCount: number;
  unlinkedProgramCourseCount: number;
  programCoursesWithGradedEnrollmentCount: number;
  programCoursesWithoutGradeCount: number;
  isTranscriptEmpty: boolean;
  isTranscriptSparse: boolean;
};

export function calculateDashboardDataStatus(
  programCourses: StudyProgramCourse[],
  enrollments: CourseEnrollment[],
): DashboardDataStatus {
  const linkedProgramCourseIds = new Set(
    enrollments
      .map((enrollment) => enrollment.programCourseId)
      .filter((programCourseId): programCourseId is string =>
        Boolean(programCourseId),
      ),
  );
  const programCourseIdsWithGrade = new Set(
    enrollments
      .filter((enrollment) => enrollment.score10 !== null)
      .map((enrollment) => enrollment.programCourseId)
      .filter((programCourseId): programCourseId is string =>
        Boolean(programCourseId),
      ),
  );
  const programCourseCount = programCourses.length;
  const gradedEnrollmentCount = enrollments.filter(
    (enrollment) => enrollment.score10 !== null,
  ).length;

  return {
    programCourseCount,
    totalProgramCredits: programCourses.reduce(
      (totalCredits, course) => totalCredits + course.credits,
      0,
    ),
    enrollmentCount: enrollments.length,
    gradedEnrollmentCount,
    pendingEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.score10 === null ||
        enrollment.status === "pending" ||
        enrollment.status === "in_progress",
    ).length,
    failedEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.status === "failed" ||
        (enrollment.score10 !== null && enrollment.score10 < 4),
    ).length,
    linkedProgramCourseCount: programCourses.filter((course) =>
      linkedProgramCourseIds.has(course.id),
    ).length,
    unlinkedProgramCourseCount:
      programCourseCount -
      programCourses.filter((course) => linkedProgramCourseIds.has(course.id))
        .length,
    programCoursesWithGradedEnrollmentCount: programCourses.filter((course) =>
      programCourseIdsWithGrade.has(course.id),
    ).length,
    programCoursesWithoutGradeCount:
      programCourseCount -
      programCourses.filter((course) => programCourseIdsWithGrade.has(course.id))
        .length,
    isTranscriptEmpty: enrollments.length === 0,
    isTranscriptSparse: gradedEnrollmentCount > 0 && gradedEnrollmentCount < 5,
  };
}
