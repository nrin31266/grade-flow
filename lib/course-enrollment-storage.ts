import type { CourseEnrollment } from "@/types/academic";

const COURSE_ENROLLMENTS_STORAGE_KEY = "gradeflow:course-enrollments";

export function getCourseEnrollments(): CourseEnrollment[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedEnrollments = localStorage.getItem(
      COURSE_ENROLLMENTS_STORAGE_KEY,
    );

    if (!storedEnrollments) {
      return [];
    }

    const parsedEnrollments = JSON.parse(storedEnrollments);

    return Array.isArray(parsedEnrollments)
      ? (parsedEnrollments as CourseEnrollment[])
      : [];
  } catch {
    return [];
  }
}

export function saveCourseEnrollments(
  enrollments: CourseEnrollment[],
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    COURSE_ENROLLMENTS_STORAGE_KEY,
    JSON.stringify(enrollments),
  );
}

export function addCourseEnrollment(enrollment: CourseEnrollment): void {
  const enrollments = getCourseEnrollments();

  saveCourseEnrollments([...enrollments, enrollment]);
}

export function updateCourseEnrollment(enrollment: CourseEnrollment): void {
  const enrollments = getCourseEnrollments();

  saveCourseEnrollments(
    enrollments.map((currentEnrollment) =>
      currentEnrollment.id === enrollment.id ? enrollment : currentEnrollment,
    ),
  );
}

export function removeCourseEnrollment(enrollmentId: string): void {
  const enrollments = getCourseEnrollments();

  saveCourseEnrollments(
    enrollments.filter((enrollment) => enrollment.id !== enrollmentId),
  );
}

export function clearCourseEnrollments(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(COURSE_ENROLLMENTS_STORAGE_KEY);
}
