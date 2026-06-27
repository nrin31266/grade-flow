import { getEnrollmentCourseIdentity } from "@/lib/enrollment-identity";
import { buildActualTermOrder } from "@/lib/semester";
import type { CourseEnrollment } from "@/types/academic";
import type { RetakeSettings } from "@/types/profile";

export type RetakeKind =
  | "retake"
  | "improvement"
  | "retake_or_improvement";

function isReplacementAttempt(enrollment: CourseEnrollment): boolean {
  return (
    enrollment.isRetake ||
    enrollment.replacesEnrollmentId !== undefined ||
    (enrollment.attemptNumber ?? 1) > 1
  );
}

function compareAttempts(
  first: CourseEnrollment,
  second: CourseEnrollment,
): number {
  const termDifference =
    buildActualTermOrder(first.academicYear, first.termCode) -
    buildActualTermOrder(second.academicYear, second.termCode);

  if (termDifference !== 0) return termDifference;

  const attemptDifference =
    (first.attemptNumber ?? 1) - (second.attemptNumber ?? 1);

  if (attemptDifference !== 0) return attemptDifference;

  return first.updatedAt.localeCompare(second.updatedAt);
}

export function getRetakeKind(
  currentAttempt: CourseEnrollment,
  previousAttempts: CourseEnrollment[],
  settings: RetakeSettings,
): RetakeKind | null {
  if (!isReplacementAttempt(currentAttempt)) return null;

  const previousAttempt = [...previousAttempts]
    .filter((attempt) => compareAttempts(attempt, currentAttempt) < 0)
    .sort(compareAttempts)
    .at(-1);

  if (!previousAttempt || previousAttempt.score10 === null) {
    return "retake_or_improvement";
  }

  const retakeThreshold = settings.retakeScoreThreshold;
  const wasFailed =
    previousAttempt.status === "failed" ||
    previousAttempt.score10 < retakeThreshold;

  if (wasFailed) return "retake";

  if (settings.improvementEnabled) return "improvement";

  return "retake_or_improvement";
}

export function buildRetakeKindByEnrollmentId(
  enrollments: CourseEnrollment[],
  settings: RetakeSettings,
): Record<string, RetakeKind | null> {
  const attemptsByCourse = new Map<string, CourseEnrollment[]>();

  for (const enrollment of enrollments) {
    const identity = getEnrollmentCourseIdentity(enrollment);
    const attempts = attemptsByCourse.get(identity) ?? [];
    attemptsByCourse.set(identity, [...attempts, enrollment]);
  }

  const result: Record<string, RetakeKind | null> = {};

  for (const attempts of attemptsByCourse.values()) {
    const sortedAttempts = [...attempts].sort(compareAttempts);

    sortedAttempts.forEach((attempt, index) => {
      result[attempt.id] = getRetakeKind(
        attempt,
        sortedAttempts.slice(0, index),
        settings,
      );
    });
  }

  return result;
}

export function combineRetakeKinds(
  kinds: Array<RetakeKind | null | undefined>,
): RetakeKind | null {
  const presentKinds = new Set(kinds.filter((kind): kind is RetakeKind => Boolean(kind)));

  if (presentKinds.size === 0) return null;
  if (presentKinds.size === 1) return [...presentKinds][0];

  return "retake_or_improvement";
}
