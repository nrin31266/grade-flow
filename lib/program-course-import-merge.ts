import { findDuplicateProgramCourse } from "@/lib/program-course-dedupe";
import type { StudyProgramCourse } from "@/types/academic";

export type ImportDuplicateStrategy = "skip" | "append" | "replace";

export type ProgramCourseImportSummary = {
  totalParsed: number;
  added: number;
  skipped: number;
  replaced: number;
};

export function mergeProgramCourseImport(
  existingCourses: StudyProgramCourse[],
  parsedCourses: StudyProgramCourse[],
  strategy: ImportDuplicateStrategy,
): {
  updatedCourses: StudyProgramCourse[];
  summary: ProgramCourseImportSummary;
} {
  const summary: ProgramCourseImportSummary = {
    totalParsed: parsedCourses.length,
    added: 0,
    skipped: 0,
    replaced: 0,
  };

  if (strategy === "append") {
    return {
      updatedCourses: [...existingCourses, ...parsedCourses],
      summary: {
        ...summary,
        added: parsedCourses.length,
      },
    };
  }

  const updatedCourses = [...existingCourses];

  parsedCourses.forEach((parsedCourse) => {
    const duplicateCourse = findDuplicateProgramCourse(
      parsedCourse,
      updatedCourses,
    );

    if (!duplicateCourse) {
      updatedCourses.push(parsedCourse);
      summary.added += 1;
      return;
    }

    if (strategy === "skip") {
      summary.skipped += 1;
      return;
    }

    const currentTime = new Date().toISOString();

    summary.replaced += 1;
    updatedCourses.splice(updatedCourses.indexOf(duplicateCourse), 1, {
      ...parsedCourse,
      id: duplicateCourse.id,
      createdAt: duplicateCourse.createdAt,
      updatedAt: currentTime,
    });
  });

  return { updatedCourses, summary };
}
