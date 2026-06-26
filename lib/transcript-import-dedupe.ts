import { normalizeCourseIdentityText } from "@/lib/enrollment-identity";
import type { CourseEnrollment } from "@/types/academic";

function sameNullableNumber(
  firstValue: number | null | undefined,
  secondValue: number | null | undefined,
): boolean {
  return (firstValue ?? null) === (secondValue ?? null);
}

function normalizeCode(value?: string): string {
  return value ? normalizeCourseIdentityText(value).replace(/\s+/g, "") : "";
}

export function findDuplicateEnrollment(
  incoming: CourseEnrollment,
  existingEnrollments: CourseEnrollment[],
): CourseEnrollment | null {
  if (incoming.programCourseId) {
    const programDuplicate = existingEnrollments.find(
      (existing) =>
        existing.programCourseId === incoming.programCourseId &&
        existing.actualTermId === incoming.actualTermId &&
        (incoming.attemptNumber === undefined ||
          existing.attemptNumber === incoming.attemptNumber),
    );

    if (programDuplicate) {
      return programDuplicate;
    }
  }

  const incomingCode = normalizeCode(incoming.code);

  if (incomingCode) {
    const codeDuplicate = existingEnrollments.find(
      (existing) =>
        normalizeCode(existing.code) === incomingCode &&
        existing.actualTermId === incoming.actualTermId &&
        sameNullableNumber(existing.score10, incoming.score10),
    );

    if (codeDuplicate) {
      return codeDuplicate;
    }
  }

  const incomingName = normalizeCourseIdentityText(incoming.name);

  return (
    existingEnrollments.find(
      (existing) =>
        normalizeCourseIdentityText(existing.name) === incomingName &&
        existing.credits === incoming.credits &&
        existing.actualTermId === incoming.actualTermId &&
        sameNullableNumber(existing.score10, incoming.score10),
    ) ?? null
  );
}

export function splitTranscriptEnrollmentsByDuplicate(
  incomingEnrollments: CourseEnrollment[],
  existingEnrollments: CourseEnrollment[],
): {
  newEnrollments: CourseEnrollment[];
  duplicateEnrollments: Array<{
    incoming: CourseEnrollment;
    existing: CourseEnrollment;
  }>;
} {
  const workingEnrollments = [...existingEnrollments];
  const newEnrollments: CourseEnrollment[] = [];
  const duplicateEnrollments: Array<{
    incoming: CourseEnrollment;
    existing: CourseEnrollment;
  }> = [];

  incomingEnrollments.forEach((incoming) => {
    const existing = findDuplicateEnrollment(incoming, workingEnrollments);

    if (existing) {
      duplicateEnrollments.push({ incoming, existing });
      return;
    }

    newEnrollments.push(incoming);
    workingEnrollments.push(incoming);
  });

  return { newEnrollments, duplicateEnrollments };
}
