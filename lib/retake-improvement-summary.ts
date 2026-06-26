import type { EffectiveEnrollmentResult } from "@/lib/effective-enrollments";
import type { RetakeSettings } from "@/types/profile";

export type RetakeImprovementSummary = {
  retakeCourseCount: number;
  retakeRawCredits: number;
  improvementCourseCount: number;
  improvementRawCredits: number;
};

function sumCredits(
  groups: EffectiveEnrollmentResult["repeatedCourseGroups"],
): number {
  return groups.reduce(
    (totalCredits, group) =>
      totalCredits +
      group.enrollments.reduce(
        (groupCredits, enrollment) => groupCredits + enrollment.credits,
        0,
      ),
    0,
  );
}

export function getRetakeImprovementSummary(
  effectiveResult: EffectiveEnrollmentResult,
  settings: RetakeSettings,
): RetakeImprovementSummary {
  const retakeGroups = effectiveResult.repeatedCourseGroups.filter((group) =>
    group.enrollments.some((enrollment) => {
      if (enrollment.score10 === null) {
        return false;
      }

      if (settings.retakeTriggerMode === "manual") {
        return enrollment.isRetake;
      }

      if (settings.retakeTriggerMode === "below_score") {
        return enrollment.score10 < settings.retakeScoreThreshold;
      }

      return (
        enrollment.status === "failed" ||
        enrollment.score10 < settings.retakeScoreThreshold
      );
    }),
  );
  const retakeIdentities = new Set(
    retakeGroups.map((group) => group.courseIdentity),
  );
  const improvementGroups = settings.improvementEnabled
    ? effectiveResult.repeatedCourseGroups.filter(
        (group) => !retakeIdentities.has(group.courseIdentity),
      )
    : [];

  return {
    retakeCourseCount: retakeGroups.length,
    retakeRawCredits: sumCredits(retakeGroups),
    improvementCourseCount: improvementGroups.length,
    improvementRawCredits: sumCredits(improvementGroups),
  };
}
