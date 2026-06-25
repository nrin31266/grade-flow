import type { StudyProgramCourse } from "@/types/academic";

export function normalizeCourseText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

export function getProgramCourseIdentity(course: StudyProgramCourse): {
  codeKey?: string;
  nameKey: string;
  credits: number;
} {
  const codeKey = course.code ? normalizeCourseText(course.code) : undefined;

  return {
    codeKey: codeKey || undefined,
    nameKey: normalizeCourseText(course.name),
    credits: course.credits,
  };
}

export function findDuplicateProgramCourse(
  incomingCourse: StudyProgramCourse,
  existingCourses: StudyProgramCourse[],
): StudyProgramCourse | null {
  const incomingIdentity = getProgramCourseIdentity(incomingCourse);

  if (incomingIdentity.codeKey) {
    const codeDuplicate = existingCourses.find((existingCourse) => {
      const existingIdentity = getProgramCourseIdentity(existingCourse);

      return existingIdentity.codeKey === incomingIdentity.codeKey;
    });

    if (codeDuplicate) {
      return codeDuplicate;
    }
  }

  return (
    existingCourses.find((existingCourse) => {
      const existingIdentity = getProgramCourseIdentity(existingCourse);

      return (
        existingIdentity.nameKey === incomingIdentity.nameKey &&
        existingIdentity.credits === incomingIdentity.credits
      );
    }) ?? null
  );
}

export function splitProgramCoursesByDuplicate(
  incomingCourses: StudyProgramCourse[],
  existingCourses: StudyProgramCourse[],
): {
  newCourses: StudyProgramCourse[];
  duplicateCourses: Array<{
    incoming: StudyProgramCourse;
    existing: StudyProgramCourse;
  }>;
} {
  const workingCourses = [...existingCourses];
  const newCourses: StudyProgramCourse[] = [];
  const duplicateCourses: Array<{
    incoming: StudyProgramCourse;
    existing: StudyProgramCourse;
  }> = [];

  incomingCourses.forEach((incomingCourse) => {
    const existingCourse = findDuplicateProgramCourse(
      incomingCourse,
      workingCourses,
    );

    if (existingCourse) {
      duplicateCourses.push({
        incoming: incomingCourse,
        existing: existingCourse,
      });
      return;
    }

    newCourses.push(incomingCourse);
    workingCourses.push(incomingCourse);
  });

  return { newCourses, duplicateCourses };
}
