import { getEnrollmentCourseIdentity } from "@/lib/enrollment-identity";
import { buildActualTermOrder } from "@/lib/semester";
import type { CourseEnrollment } from "@/types/academic";
import type { RetakeSettings } from "@/types/profile";

export type EnrollmentEffectReason =
  | "only_attempt"
  | "highest_score"
  | "latest_attempt"
  | "manual_included"
  | "manual_excluded"
  | "pending"
  | "failed_not_counted"
  | "duplicate_lower_score";

export type EnrollmentEffectStatus = {
  enrollmentId: string;
  courseIdentity: string;
  isEffectiveForGpa: boolean;
  isEffectiveForGraduation: boolean;
  reason: EnrollmentEffectReason;
  relatedEnrollmentIds: string[];
};

export type EffectiveEnrollmentResult = {
  effectiveEnrollments: CourseEnrollment[];
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
  repeatedCourseGroups: Array<{
    courseIdentity: string;
    enrollments: CourseEnrollment[];
    effectiveEnrollmentId?: string;
  }>;
  repeatedCourseCount: number;
  repeatedRawCredits: number;
  repeatedEffectiveCredits: number;
};

function isGpaStatus(enrollment: CourseEnrollment): boolean {
  return enrollment.status === "completed" || enrollment.status === "failed";
}

function isGradStatus(enrollment: CourseEnrollment): boolean {
  return (
    enrollment.score10 !== null &&
    enrollment.score10 >= 4 &&
    enrollment.status !== "failed"
  );
}

function getTermOrder(enrollment: CourseEnrollment): number {
  return buildActualTermOrder(enrollment.academicYear, enrollment.termCode);
}

function compareLatest(
  firstEnrollment: CourseEnrollment,
  secondEnrollment: CourseEnrollment,
): number {
  const orderDifference = getTermOrder(secondEnrollment) - getTermOrder(firstEnrollment);

  if (orderDifference !== 0) {
    return orderDifference;
  }

  return secondEnrollment.updatedAt.localeCompare(firstEnrollment.updatedAt);
}

function getBaseStatus(
  enrollment: CourseEnrollment,
  courseIdentity: string,
  relatedEnrollmentIds: string[],
  reason: EnrollmentEffectReason,
  settings: RetakeSettings,
): EnrollmentEffectStatus {
  const hasScore = enrollment.score10 !== null;

  return {
    enrollmentId: enrollment.id,
    courseIdentity,
    isEffectiveForGpa:
      enrollment.countsForGpa === true &&
      hasScore &&
      enrollment.gpa4 !== null &&
      enrollment.gpa4 !== undefined &&
      isGpaStatus(enrollment),
    isEffectiveForGraduation:
      enrollment.countsForGraduation === true &&
      (isGradStatus(enrollment) ||
        (settings.countFailedAttemptCredits === true &&
          hasScore &&
          isGpaStatus(enrollment))),
    reason,
    relatedEnrollmentIds,
  };
}

function chooseHighestEnrollment(
  enrollments: CourseEnrollment[],
): CourseEnrollment | null {
  const scoredEnrollments = enrollments.filter(
    (enrollment) => enrollment.score10 !== null,
  );

  if (scoredEnrollments.length === 0) {
    return null;
  }

  return [...scoredEnrollments].sort((firstEnrollment, secondEnrollment) => {
    const scoreDifference =
      (secondEnrollment.score10 ?? -1) - (firstEnrollment.score10 ?? -1);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return compareLatest(firstEnrollment, secondEnrollment);
  })[0];
}

function chooseLatestEnrollment(
  enrollments: CourseEnrollment[],
): CourseEnrollment | null {
  const scoredEnrollments = enrollments.filter(
    (enrollment) => enrollment.score10 !== null,
  );

  if (scoredEnrollments.length === 0) {
    return null;
  }

  return [...scoredEnrollments].sort(compareLatest)[0];
}

function sumCredits(enrollments: CourseEnrollment[]): number {
  return enrollments.reduce(
    (totalCredits, enrollment) => totalCredits + enrollment.credits,
    0,
  );
}

export function resolveEffectiveEnrollments(
  enrollments: CourseEnrollment[],
  settings: RetakeSettings,
): EffectiveEnrollmentResult {
  const groupsByIdentity = new Map<string, CourseEnrollment[]>();

  enrollments.forEach((enrollment) => {
    const courseIdentity = getEnrollmentCourseIdentity(enrollment);
    const group = groupsByIdentity.get(courseIdentity) ?? [];

    groupsByIdentity.set(courseIdentity, [...group, enrollment]);
  });

  const effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus> = {};
  const repeatedCourseGroups: EffectiveEnrollmentResult["repeatedCourseGroups"] =
    [];

  groupsByIdentity.forEach((group, courseIdentity) => {
    const sortedGroup = [...group].sort(compareLatest);
    const relatedEnrollmentIds = sortedGroup.map((enrollment) => enrollment.id);

    if (sortedGroup.length === 1) {
      const [enrollment] = sortedGroup;
      const reason = enrollment.score10 === null ? "pending" : "only_attempt";

      effectStatusByEnrollmentId[enrollment.id] = getBaseStatus(
        enrollment,
        courseIdentity,
        relatedEnrollmentIds,
        reason,
        settings,
      );
      return;
    }

    const policy = settings.policy;
    let effectiveEnrollment: CourseEnrollment | null = null;

    if (policy === "latest") {
      effectiveEnrollment = chooseLatestEnrollment(sortedGroup);
    } else if (policy === "manual") {
      const graduationEnrollment = sortedGroup.find(
        (enrollment) =>
          enrollment.countsForGraduation === true && isGradStatus(enrollment),
      );

      sortedGroup.forEach((enrollment) => {
        const baseStatus = getBaseStatus(
          enrollment,
          courseIdentity,
          relatedEnrollmentIds,
          enrollment.countsForGpa || enrollment.countsForGraduation
            ? "manual_included"
            : "manual_excluded",
          settings,
        );

        effectStatusByEnrollmentId[enrollment.id] = {
          ...baseStatus,
          isEffectiveForGraduation:
            baseStatus.isEffectiveForGraduation &&
            enrollment.id === graduationEnrollment?.id,
        };
      });

      repeatedCourseGroups.push({
        courseIdentity,
        enrollments: sortedGroup,
        effectiveEnrollmentId: graduationEnrollment?.id,
      });
      return;
    } else {
      effectiveEnrollment = chooseHighestEnrollment(sortedGroup);
    }

    sortedGroup.forEach((enrollment) => {
      const isEffective = enrollment.id === effectiveEnrollment?.id;
      const reason: EnrollmentEffectReason =
        effectiveEnrollment === null
          ? "pending"
          : isEffective
            ? policy === "latest"
              ? "latest_attempt"
              : "highest_score"
            : enrollment.score10 !== null && enrollment.score10 < 4
              ? "failed_not_counted"
              : "duplicate_lower_score";

      const baseStatus = getBaseStatus(
        enrollment,
        courseIdentity,
        relatedEnrollmentIds,
        reason,
        settings,
      );

      effectStatusByEnrollmentId[enrollment.id] = {
        ...baseStatus,
        isEffectiveForGpa: isEffective && baseStatus.isEffectiveForGpa,
        isEffectiveForGraduation:
          isEffective && baseStatus.isEffectiveForGraduation,
      };
    });

    repeatedCourseGroups.push({
      courseIdentity,
      enrollments: sortedGroup,
      effectiveEnrollmentId: effectiveEnrollment?.id,
    });
  });

  const effectiveEnrollments = enrollments.filter((enrollment) => {
    const status = effectStatusByEnrollmentId[enrollment.id];

    return status?.isEffectiveForGpa || status?.isEffectiveForGraduation;
  });
  const repeatedEffectiveIds = new Set(
    repeatedCourseGroups.flatMap((group) =>
      group.enrollments
        .filter((enrollment) => {
          const status = effectStatusByEnrollmentId[enrollment.id];

          return status?.isEffectiveForGpa || status?.isEffectiveForGraduation;
        })
        .map((enrollment) => enrollment.id),
    ),
  );

  return {
    effectiveEnrollments,
    effectStatusByEnrollmentId,
    repeatedCourseGroups,
    repeatedCourseCount: repeatedCourseGroups.length,
    repeatedRawCredits: sumCredits(
      repeatedCourseGroups.flatMap((group) => group.enrollments),
    ),
    repeatedEffectiveCredits: sumCredits(
      enrollments.filter((enrollment) => repeatedEffectiveIds.has(enrollment.id)),
    ),
  };
}
