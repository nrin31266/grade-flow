import { findDuplicateEnrollment } from "@/lib/transcript-import-dedupe";
import type { CourseEnrollment } from "@/types/academic";

export type TranscriptImportDuplicateStrategy = "skip" | "append" | "replace";

export type TranscriptImportSummary = {
  totalParsed: number;
  added: number;
  skipped: number;
  replaced: number;
  duplicateCount: number;
  matchedProgramCourseCount: number;
  unmatchedProgramCourseCount: number;
  pendingCount: number;
  gradedCount: number;
};

export function mergeTranscriptImport(
  existingEnrollments: CourseEnrollment[],
  incomingEnrollments: CourseEnrollment[],
  strategy: TranscriptImportDuplicateStrategy,
): {
  enrollments: CourseEnrollment[];
  summary: TranscriptImportSummary;
} {
  const workingEnrollments = [...existingEnrollments];
  const summary: TranscriptImportSummary = {
    totalParsed: incomingEnrollments.length,
    added: 0,
    skipped: 0,
    replaced: 0,
    duplicateCount: 0,
    matchedProgramCourseCount: incomingEnrollments.filter(
      (enrollment) => enrollment.programCourseId,
    ).length,
    unmatchedProgramCourseCount: incomingEnrollments.filter(
      (enrollment) => !enrollment.programCourseId,
    ).length,
    pendingCount: incomingEnrollments.filter(
      (enrollment) => enrollment.score10 === null,
    ).length,
    gradedCount: incomingEnrollments.filter(
      (enrollment) => enrollment.score10 !== null,
    ).length,
  };

  if (strategy === "append") {
    return {
      enrollments: [...workingEnrollments, ...incomingEnrollments],
      summary: {
        ...summary,
        added: incomingEnrollments.length,
        duplicateCount: incomingEnrollments.filter((incoming) =>
          findDuplicateEnrollment(incoming, workingEnrollments),
        ).length,
      },
    };
  }

  incomingEnrollments.forEach((incoming) => {
    const duplicate = findDuplicateEnrollment(incoming, workingEnrollments);

    if (!duplicate) {
      workingEnrollments.push(incoming);
      summary.added += 1;
      return;
    }

    summary.duplicateCount += 1;

    if (strategy === "skip") {
      summary.skipped += 1;
      return;
    }

    summary.replaced += 1;
    workingEnrollments.splice(workingEnrollments.indexOf(duplicate), 1, {
      ...incoming,
      id: duplicate.id,
      createdAt: duplicate.createdAt,
      updatedAt: new Date().toISOString(),
    });
  });

  return { enrollments: workingEnrollments, summary };
}
