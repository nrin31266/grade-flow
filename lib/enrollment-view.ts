import {
  calculateCumulativeGpaSummariesFromEffective,
  calculateRawTermSummaries,
  getEnrollmentTermOrder,
  groupEnrollmentsByActualTerm,
  type CumulativeGpaSummary,
  type RawTermSummary,
} from "@/lib/gpa";
import type { EffectiveEnrollmentResult } from "@/lib/effective-enrollments";
import type { CourseEnrollment } from "@/types/academic";
import type { RetakeSettings } from "@/types/profile";
import {
  buildRetakeKindByEnrollmentId,
  type RetakeKind,
} from "@/lib/retake-kind";

export type EnrollmentTermGroup = {
  actualTermId: string;
  actualTermName: string;
  termOrder: number;
  enrollments: CourseEnrollment[];
  rawSummary: RawTermSummary;
  effectiveSummary: CumulativeGpaSummary;
  retakeKindByEnrollmentId: Record<string, RetakeKind | null>;
};

export function groupEnrollmentsWithSummaries(
  enrollments: CourseEnrollment[],
  settings: RetakeSettings,
): EnrollmentTermGroup[] {
  const termGroups = groupEnrollmentsByActualTerm(enrollments);
  const summaries = calculateCumulativeGpaSummariesFromEffective(
    enrollments,
    settings,
  );
  const rawSummaries = calculateRawTermSummaries(enrollments);
  const retakeKindByEnrollmentId = buildRetakeKindByEnrollmentId(
    enrollments,
    settings,
  );
  const summariesByTermId = new Map(
    summaries.map((summary) => [summary.actualTermId, summary]),
  );
  const rawSummariesByTermId = new Map(
    rawSummaries.map((summary) => [summary.actualTermId, summary]),
  );

  return termGroups
    .map((group) => {
      const summary = summariesByTermId.get(group.actualTermId);
      const rawSummary = rawSummariesByTermId.get(group.actualTermId);

      if (!summary || !rawSummary) {
        return null;
      }

      return {
        ...group,
        enrollments: [...group.enrollments].sort((first, second) =>
          first.name.localeCompare(second.name, "vi"),
        ),
        rawSummary,
        effectiveSummary: summary,
        retakeKindByEnrollmentId,
      };
    })
    .filter((group): group is EnrollmentTermGroup => group !== null)
    .sort((first, second) => {
      if (first.termOrder !== second.termOrder) {
        return second.termOrder - first.termOrder;
      }

      return first.actualTermName.localeCompare(second.actualTermName, "vi");
    });
}

export function getLatestEnrollmentForProgramCourse(
  programCourseId: string,
  enrollments: CourseEnrollment[],
): CourseEnrollment | null {
  const matchedEnrollments = enrollments.filter(
    (enrollment) => enrollment.programCourseId === programCourseId,
  );

  if (matchedEnrollments.length === 0) {
    return null;
  }

  return [...matchedEnrollments].sort((first, second) => {
    const firstHasScore = first.score10 !== null;
    const secondHasScore = second.score10 !== null;

    if (firstHasScore !== secondHasScore) {
      return firstHasScore ? -1 : 1;
    }

    const orderDifference =
      getEnrollmentTermOrder(second) - getEnrollmentTermOrder(first);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return second.updatedAt.localeCompare(first.updatedAt);
  })[0];
}

export function countEnrollmentsForProgramCourse(
  programCourseId: string,
  enrollments: CourseEnrollment[],
): number {
  return enrollments.filter(
    (enrollment) => enrollment.programCourseId === programCourseId,
  ).length;
}

export function getEffectiveEnrollmentForProgramCourse(
  programCourseId: string,
  effectiveResult: EffectiveEnrollmentResult,
): CourseEnrollment | null {
  const matchedEnrollments = effectiveResult.effectiveEnrollments.filter(
    (enrollment) => enrollment.programCourseId === programCourseId,
  );

  if (matchedEnrollments.length === 0) {
    return null;
  }

  return [...matchedEnrollments].sort((firstEnrollment, secondEnrollment) => {
    const orderDifference =
      getEnrollmentTermOrder(secondEnrollment) -
      getEnrollmentTermOrder(firstEnrollment);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return secondEnrollment.updatedAt.localeCompare(firstEnrollment.updatedAt);
  })[0];
}
