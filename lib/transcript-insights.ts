import type { CourseEnrollment } from "@/types/academic";
import type { CumulativeGpaSummary } from "@/lib/gpa";

export type TranscriptInsights = {
  bestTerm?: {
    actualTermName: string;
    gpa4: number | null;
    gpa10: number | null;
  };
  weakestTerm?: {
    actualTermName: string;
    gpa4: number | null;
    gpa10: number | null;
  };
  pendingCount: number;
  failedCount: number;
  retakeOrImprovementCount: number;
  topScoreCount: number;
};

export function calculateTranscriptInsights(
  termSummaries: CumulativeGpaSummary[],
  enrollments: CourseEnrollment[],
): TranscriptInsights {
  const gradedTerms = termSummaries.filter(
    (summary) => summary.rawGpa4 !== null,
  );
  const bestTerm = gradedTerms.reduce<CumulativeGpaSummary | undefined>(
    (bestSummary, summary) =>
      !bestSummary || (summary.rawGpa4 ?? 0) > (bestSummary.rawGpa4 ?? 0)
        ? summary
        : bestSummary,
    undefined,
  );
  const weakestTerm = gradedTerms.reduce<CumulativeGpaSummary | undefined>(
    (weakestSummary, summary) =>
      !weakestSummary ||
      (summary.rawGpa4 ?? Number.POSITIVE_INFINITY) <
        (weakestSummary.rawGpa4 ?? Number.POSITIVE_INFINITY)
        ? summary
        : weakestSummary,
    undefined,
  );

  return {
    bestTerm: bestTerm
      ? {
          actualTermName: bestTerm.actualTermName,
          gpa4: bestTerm.rawGpa4,
          gpa10: bestTerm.rawGpa10,
        }
      : undefined,
    weakestTerm: weakestTerm
      ? {
          actualTermName: weakestTerm.actualTermName,
          gpa4: weakestTerm.rawGpa4,
          gpa10: weakestTerm.rawGpa10,
        }
      : undefined,
    pendingCount: enrollments.filter(
      (enrollment) =>
        enrollment.score10 === null ||
        enrollment.status === "pending" ||
        enrollment.status === "in_progress",
    ).length,
    failedCount: enrollments.filter(
      (enrollment) =>
        enrollment.status === "failed" ||
        (enrollment.score10 !== null && enrollment.score10 < 4),
    ).length,
    retakeOrImprovementCount: enrollments.filter(
      (enrollment) => enrollment.isRetake,
    ).length,
    topScoreCount: enrollments.filter(
      (enrollment) => enrollment.score10 !== null && enrollment.score10 >= 8.5,
    ).length,
  };
}
