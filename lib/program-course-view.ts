import { normalizeCourseText } from "@/lib/program-course-dedupe";
import type {
  CourseRequirementType,
  KnowledgeBlock,
  StudyProgramCourse,
} from "@/types/academic";

export type ProgramCourseFilters = {
  search: string;
  plannedTerm: string;
  knowledgeBlock: string;
  requirementType: string;
};

export type ProgramCourseStatsValue = {
  courseCount: number;
  totalCredits: number;
  requiredCredits: number;
  electiveCredits: number;
  unassignedCount: number;
  unassignedCredits: number;
};

export const defaultProgramCourseFilters: ProgramCourseFilters = {
  search: "",
  plannedTerm: "all",
  knowledgeBlock: "all",
  requirementType: "all",
};

export function getAvailablePlannedTerms(
  courses: StudyProgramCourse[],
): number[] {
  return Array.from(
    new Set(
      courses
        .map((course) => course.plannedTermNumber)
        .filter((term): term is number => term !== undefined),
    ),
  ).sort((firstTerm, secondTerm) => firstTerm - secondTerm);
}

export function filterProgramCourses(
  courses: StudyProgramCourse[],
  filters: ProgramCourseFilters,
): StudyProgramCourse[] {
  const normalizedSearch = normalizeCourseText(filters.search);

  return courses.filter((course) => {
    const searchableText = normalizeCourseText(
      [
        course.code,
        course.name,
        ...(course.tags ?? []),
        course.note,
      ]
        .filter(Boolean)
        .join(" "),
    );

    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesPlannedTerm =
      filters.plannedTerm === "all" ||
      (filters.plannedTerm === "unassigned" &&
        course.plannedTermNumber === undefined) ||
      course.plannedTermNumber === Number(filters.plannedTerm);
    const matchesKnowledgeBlock =
      filters.knowledgeBlock === "all" ||
      course.knowledgeBlock === (filters.knowledgeBlock as KnowledgeBlock);
    const matchesRequirementType =
      filters.requirementType === "all" ||
      course.requirementType ===
        (filters.requirementType as CourseRequirementType);

    return (
      matchesSearch &&
      matchesPlannedTerm &&
      matchesKnowledgeBlock &&
      matchesRequirementType
    );
  });
}

export function sortProgramCourses(
  courses: StudyProgramCourse[],
): StudyProgramCourse[] {
  return [...courses].sort((firstCourse, secondCourse) => {
    const firstTerm = firstCourse.plannedTermNumber ?? Number.POSITIVE_INFINITY;
    const secondTerm =
      secondCourse.plannedTermNumber ?? Number.POSITIVE_INFINITY;

    if (firstTerm !== secondTerm) {
      return firstTerm - secondTerm;
    }

    const firstName = normalizeCourseText(firstCourse.name);
    const secondName = normalizeCourseText(secondCourse.name);

    if (firstName !== secondName) {
      return firstName.localeCompare(secondName);
    }

    return (firstCourse.code ?? "").localeCompare(secondCourse.code ?? "");
  });
}

export function getProgramCourseStats(
  courses: StudyProgramCourse[],
): ProgramCourseStatsValue {
  return courses.reduce<ProgramCourseStatsValue>(
    (stats, course) => {
      stats.courseCount += 1;
      stats.totalCredits += course.credits;

      if (course.requirementType === "required") {
        stats.requiredCredits += course.credits;
      }

      if (course.requirementType === "elective") {
        stats.electiveCredits += course.credits;
      }

      if (course.plannedTermNumber === undefined) {
        stats.unassignedCount += 1;
        stats.unassignedCredits += course.credits;
      }

      return stats;
    },
    {
      courseCount: 0,
      totalCredits: 0,
      requiredCredits: 0,
      electiveCredits: 0,
      unassignedCount: 0,
      unassignedCredits: 0,
    },
  );
}

export function groupProgramCoursesByPlannedTerm(
  courses: StudyProgramCourse[],
): Array<{
  key: string;
  title: string;
  courses: StudyProgramCourse[];
  totalCredits: number;
}> {
  const sortedCourses = sortProgramCourses(courses);
  const terms = getAvailablePlannedTerms(sortedCourses);
  const groups = terms.map((term) => {
    const termCourses = sortedCourses.filter(
      (course) => course.plannedTermNumber === term,
    );

    return {
      key: String(term),
      title: `Kỳ ${term}`,
      courses: termCourses,
      totalCredits: getProgramCourseStats(termCourses).totalCredits,
    };
  });
  const unassignedCourses = sortedCourses.filter(
    (course) => course.plannedTermNumber === undefined,
  );

  if (unassignedCourses.length > 0) {
    groups.push({
      key: "unassigned",
      title: "Chưa gán kỳ",
      courses: unassignedCourses,
      totalCredits: getProgramCourseStats(unassignedCourses).totalCredits,
    });
  }

  return groups;
}
