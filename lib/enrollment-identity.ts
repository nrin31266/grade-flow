import type { CourseEnrollment } from "@/types/academic";

export function normalizeCourseIdentityText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[()]/g, " ")
    .replace(/[-_/]/g, " ")
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEnrollmentCourseIdentity(
  enrollment: CourseEnrollment,
): string {
  if (enrollment.programCourseId) {
    return `program:${enrollment.programCourseId}`;
  }

  if (enrollment.code) {
    return `code:${normalizeCourseIdentityText(enrollment.code)}`;
  }

  return `name:${normalizeCourseIdentityText(enrollment.name)}|credits:${
    enrollment.credits
  }`;
}

export function areSameEnrollmentCourse(
  firstEnrollment: CourseEnrollment,
  secondEnrollment: CourseEnrollment,
): boolean {
  return (
    getEnrollmentCourseIdentity(firstEnrollment) ===
    getEnrollmentCourseIdentity(secondEnrollment)
  );
}
