import { buildActualTermOrder } from "@/lib/semester";
import type { CourseEnrollment } from "@/types/academic";
import {
  resolveEffectiveEnrollments,
  type EnrollmentEffectStatus,
} from "@/lib/effective-enrollments";
import type { RetakeSettings } from "@/types/profile";

export type GpaInputEnrollment = CourseEnrollment;

export type TermGpaSummary = {
  actualTermId: string;
  actualTermName: string;
  termOrder: number;
  courseCount: number;
  gradedCourseCount: number;
  gpaCredits: number;
  earnedCredits: number;
  gpa10: number | null;
  gpa4: number | null;
  rawGpaCredits: number;
  rawGpa10: number | null;
  rawGpa4: number | null;
  failedCount: number;
  pendingCount: number;
};

export type CumulativeGpaSummary = TermGpaSummary & {
  cumulativeCredits: number;
  cumulativeEarnedCredits: number;
  cumulativeGpa10: number | null;
  cumulativeGpa4: number | null;
};

export type OverallGpaSummary = {
  totalEnrollmentCount: number;
  gradedEnrollmentCount: number;
  pendingEnrollmentCount: number;
  failedEnrollmentCount: number;
  gpaCredits: number;
  earnedGraduationCredits: number;
  remainingGraduationCredits: number | null;
  cumulativeGpa10: number | null;
  cumulativeGpa4: number | null;
  retakeCount: number;
  repeatedCourseCount: number;
  repeatedRawCredits: number;
  repeatedEffectiveCredits: number;
};

function isGpaStatus(enrollment: CourseEnrollment): boolean {
  return enrollment.status === "completed" || enrollment.status === "failed";
}

export function isEnrollmentGraded(enrollment: CourseEnrollment): boolean {
  return enrollment.score10 !== null && isGpaStatus(enrollment);
}

export function isEnrollmentIncludedInGpa(
  enrollment: CourseEnrollment,
  effectStatusByEnrollmentId?: Record<string, EnrollmentEffectStatus>,
): boolean {
  if (effectStatusByEnrollmentId) {
    return effectStatusByEnrollmentId[enrollment.id]?.isEffectiveForGpa ?? false;
  }

  return (
    enrollment.countsForGpa === true &&
    enrollment.score10 !== null &&
    enrollment.gpa4 !== null &&
    enrollment.gpa4 !== undefined &&
    isGpaStatus(enrollment)
  );
}

export function isEnrollmentEarnedForGraduation(
  enrollment: CourseEnrollment,
  effectStatusByEnrollmentId?: Record<string, EnrollmentEffectStatus>,
): boolean {
  if (effectStatusByEnrollmentId) {
    return (
      effectStatusByEnrollmentId[enrollment.id]?.isEffectiveForGraduation ??
      false
    );
  }

  return (
    enrollment.countsForGraduation === true &&
    enrollment.score10 !== null &&
    enrollment.score10 >= 4 &&
    enrollment.status !== "failed"
  );
}

export function getEnrollmentTermOrder(enrollment: CourseEnrollment): number {
  if (!enrollment.academicYear || !enrollment.termCode) {
    return 0;
  }

  return buildActualTermOrder(enrollment.academicYear, enrollment.termCode);
}

export function calculateWeightedGpa(
  enrollments: CourseEnrollment[],
  effectStatusByEnrollmentId?: Record<string, EnrollmentEffectStatus>,
): {
  credits: number;
  gpa10: number | null;
  gpa4: number | null;
} {
  const includedEnrollments = enrollments.filter((enrollment) =>
    isEnrollmentIncludedInGpa(enrollment, effectStatusByEnrollmentId),
  );
  const credits = includedEnrollments.reduce(
    (totalCredits, enrollment) => totalCredits + enrollment.credits,
    0,
  );

  if (credits <= 0) {
    return { credits: 0, gpa10: null, gpa4: null };
  }

  const weightedScore10 = includedEnrollments.reduce(
    (totalScore, enrollment) =>
      totalScore + (enrollment.score10 ?? 0) * enrollment.credits,
    0,
  );
  const weightedGpa4 = includedEnrollments.reduce(
    (totalScore, enrollment) =>
      totalScore + (enrollment.gpa4 ?? 0) * enrollment.credits,
    0,
  );

  return {
    credits,
    gpa10: weightedScore10 / credits,
    gpa4: weightedGpa4 / credits,
  };
}

function getEarnedCredits(
  enrollments: CourseEnrollment[],
  effectStatusByEnrollmentId?: Record<string, EnrollmentEffectStatus>,
): number {
  return enrollments
    .filter((enrollment) =>
      isEnrollmentEarnedForGraduation(
        enrollment,
        effectStatusByEnrollmentId,
      ),
    )
    .reduce((totalCredits, enrollment) => totalCredits + enrollment.credits, 0);
}

export function groupEnrollmentsByActualTerm(
  enrollments: CourseEnrollment[],
): Array<{
  actualTermId: string;
  actualTermName: string;
  termOrder: number;
  enrollments: CourseEnrollment[];
}> {
  const groupsByTerm = new Map<
    string,
    {
      actualTermId: string;
      actualTermName: string;
      termOrder: number;
      enrollments: CourseEnrollment[];
    }
  >();

  enrollments.forEach((enrollment) => {
    const actualTermId = enrollment.actualTermId || "unknown";
    const currentGroup = groupsByTerm.get(actualTermId);

    if (currentGroup) {
      currentGroup.enrollments.push(enrollment);
      return;
    }

    groupsByTerm.set(actualTermId, {
      actualTermId,
      actualTermName: enrollment.actualTermName || "Chưa rõ kỳ",
      termOrder: getEnrollmentTermOrder(enrollment),
      enrollments: [enrollment],
    });
  });

  return Array.from(groupsByTerm.values()).sort((firstGroup, secondGroup) => {
    if (firstGroup.termOrder !== secondGroup.termOrder) {
      return firstGroup.termOrder - secondGroup.termOrder;
    }

    return firstGroup.actualTermName.localeCompare(
      secondGroup.actualTermName,
      "vi",
    );
  });
}

export function calculateTermGpaSummaries(
  enrollments: CourseEnrollment[],
): TermGpaSummary[] {
  return groupEnrollmentsByActualTerm(enrollments).map((group) => {
    const weightedGpa = calculateWeightedGpa(group.enrollments);

    return {
      actualTermId: group.actualTermId,
      actualTermName: group.actualTermName,
      termOrder: group.termOrder,
      courseCount: group.enrollments.length,
      gradedCourseCount: group.enrollments.filter(isEnrollmentGraded).length,
      gpaCredits: weightedGpa.credits,
      earnedCredits: group.enrollments
        .filter((enrollment) => isEnrollmentEarnedForGraduation(enrollment))
        .reduce((totalCredits, enrollment) => totalCredits + enrollment.credits, 0),
      gpa10: weightedGpa.gpa10,
      gpa4: weightedGpa.gpa4,
      rawGpaCredits: weightedGpa.credits,
      rawGpa10: weightedGpa.gpa10,
      rawGpa4: weightedGpa.gpa4,
      failedCount: group.enrollments.filter(
        (enrollment) =>
          enrollment.status === "failed" ||
          (enrollment.score10 !== null && enrollment.score10 < 4),
      ).length,
      pendingCount: group.enrollments.filter(
        (enrollment) =>
          enrollment.score10 === null ||
          enrollment.status === "pending" ||
          enrollment.status === "in_progress",
      ).length,
    };
  });
}

export function calculateTermGpaSummariesFromEffective(
  enrollments: CourseEnrollment[],
  settings: RetakeSettings,
): TermGpaSummary[] {
  const effectiveResult = resolveEffectiveEnrollments(enrollments, settings);

  return groupEnrollmentsByActualTerm(enrollments).map((group) => {
    const rawWeightedGpa = calculateWeightedGpa(group.enrollments);
    const weightedGpa = calculateWeightedGpa(
      group.enrollments,
      effectiveResult.effectStatusByEnrollmentId,
    );

    return {
      actualTermId: group.actualTermId,
      actualTermName: group.actualTermName,
      termOrder: group.termOrder,
      courseCount: group.enrollments.length,
      gradedCourseCount: group.enrollments.filter(isEnrollmentGraded).length,
      gpaCredits: weightedGpa.credits,
      earnedCredits: getEarnedCredits(
        group.enrollments,
        effectiveResult.effectStatusByEnrollmentId,
      ),
      gpa10: weightedGpa.gpa10,
      gpa4: weightedGpa.gpa4,
      rawGpaCredits: rawWeightedGpa.credits,
      rawGpa10: rawWeightedGpa.gpa10,
      rawGpa4: rawWeightedGpa.gpa4,
      failedCount: group.enrollments.filter(
        (enrollment) =>
          enrollment.status === "failed" ||
          (enrollment.score10 !== null && enrollment.score10 < 4),
      ).length,
      pendingCount: group.enrollments.filter(
        (enrollment) =>
          enrollment.score10 === null ||
          enrollment.status === "pending" ||
          enrollment.status === "in_progress",
      ).length,
    };
  });
}

export function calculateCumulativeGpaSummaries(
  enrollments: CourseEnrollment[],
): CumulativeGpaSummary[] {
  const termGroups = groupEnrollmentsByActualTerm(enrollments);
  const cumulativeEnrollments: CourseEnrollment[] = [];

  return termGroups.map((group) => {
    cumulativeEnrollments.push(...group.enrollments);

    const termSummary = calculateTermGpaSummaries(group.enrollments)[0];
    const cumulativeGpa = calculateWeightedGpa(cumulativeEnrollments);
    const cumulativeEarnedCredits = cumulativeEnrollments
      .filter((enrollment) => isEnrollmentEarnedForGraduation(enrollment))
      .reduce((totalCredits, enrollment) => totalCredits + enrollment.credits, 0);

    return {
      ...termSummary,
      cumulativeCredits: cumulativeGpa.credits,
      cumulativeEarnedCredits,
      cumulativeGpa10: cumulativeGpa.gpa10,
      cumulativeGpa4: cumulativeGpa.gpa4,
    };
  });
}

export function calculateCumulativeGpaSummariesFromEffective(
  enrollments: CourseEnrollment[],
  settings: RetakeSettings,
): CumulativeGpaSummary[] {
  const termGroups = groupEnrollmentsByActualTerm(enrollments);

  return termGroups.map((group) => {
    const currentEnrollments = enrollments.filter(
      (enrollment) => getEnrollmentTermOrder(enrollment) <= group.termOrder,
    );
    const currentEffectiveResult = resolveEffectiveEnrollments(
      currentEnrollments,
      settings,
    );
    const termEffectiveResult = resolveEffectiveEnrollments(enrollments, settings);
    const termSummary = calculateTermGpaSummariesFromEffective(
      enrollments,
      settings,
    ).find((summary) => summary.actualTermId === group.actualTermId);
    const cumulativeGpa = calculateWeightedGpa(
      currentEnrollments,
      currentEffectiveResult.effectStatusByEnrollmentId,
    );

    return {
      ...(termSummary ?? {
        actualTermId: group.actualTermId,
        actualTermName: group.actualTermName,
        termOrder: group.termOrder,
        courseCount: group.enrollments.length,
        gradedCourseCount: group.enrollments.filter(isEnrollmentGraded).length,
        failedCount: 0,
        pendingCount: 0,
        gpaCredits: 0,
        earnedCredits: 0,
        gpa10: null,
        gpa4: null,
        rawGpaCredits: 0,
        rawGpa10: null,
        rawGpa4: null,
      }),
      earnedCredits:
        termSummary?.earnedCredits ??
        getEarnedCredits(
          group.enrollments,
          termEffectiveResult.effectStatusByEnrollmentId,
        ),
      cumulativeCredits: cumulativeGpa.credits,
      cumulativeEarnedCredits: getEarnedCredits(
        currentEnrollments,
        currentEffectiveResult.effectStatusByEnrollmentId,
      ),
      cumulativeGpa10: cumulativeGpa.gpa10,
      cumulativeGpa4: cumulativeGpa.gpa4,
    };
  });
}

export function calculateOverallGpaSummary(
  enrollments: CourseEnrollment[],
  graduationCredits?: number,
): OverallGpaSummary {
  const cumulativeSummaries = calculateCumulativeGpaSummaries(enrollments);
  const finalCumulativeSummary =
    cumulativeSummaries[cumulativeSummaries.length - 1];
  const earnedGraduationCredits = enrollments
    .filter((enrollment) => isEnrollmentEarnedForGraduation(enrollment))
    .reduce((totalCredits, enrollment) => totalCredits + enrollment.credits, 0);

  return {
    totalEnrollmentCount: enrollments.length,
    gradedEnrollmentCount: enrollments.filter(isEnrollmentGraded).length,
    pendingEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.score10 === null ||
        enrollment.status === "pending" ||
        enrollment.status === "in_progress",
    ).length,
    failedEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.status === "failed" ||
        (enrollment.score10 !== null && enrollment.score10 < 4),
    ).length,
    gpaCredits: calculateWeightedGpa(enrollments).credits,
    earnedGraduationCredits,
    remainingGraduationCredits:
      graduationCredits === undefined
        ? null
        : Math.max(graduationCredits - earnedGraduationCredits, 0),
    cumulativeGpa10: finalCumulativeSummary?.cumulativeGpa10 ?? null,
    cumulativeGpa4: finalCumulativeSummary?.cumulativeGpa4 ?? null,
    retakeCount: enrollments.filter((enrollment) => enrollment.isRetake).length,
    repeatedCourseCount: 0,
    repeatedRawCredits: 0,
    repeatedEffectiveCredits: 0,
  };
}

export function calculateOverallGpaSummaryFromEffective(
  enrollments: CourseEnrollment[],
  graduationCredits: number | undefined,
  settings: RetakeSettings,
): OverallGpaSummary {
  const effectiveResult = resolveEffectiveEnrollments(enrollments, settings);
  const cumulativeSummaries = calculateCumulativeGpaSummariesFromEffective(
    enrollments,
    settings,
  );
  const finalCumulativeSummary =
    cumulativeSummaries[cumulativeSummaries.length - 1];
  const earnedGraduationCredits = getEarnedCredits(
    enrollments,
    effectiveResult.effectStatusByEnrollmentId,
  );

  return {
    totalEnrollmentCount: enrollments.length,
    gradedEnrollmentCount: enrollments.filter(isEnrollmentGraded).length,
    pendingEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.score10 === null ||
        enrollment.status === "pending" ||
        enrollment.status === "in_progress",
    ).length,
    failedEnrollmentCount: enrollments.filter(
      (enrollment) =>
        enrollment.status === "failed" ||
        (enrollment.score10 !== null && enrollment.score10 < 4),
    ).length,
    gpaCredits: calculateWeightedGpa(
      enrollments,
      effectiveResult.effectStatusByEnrollmentId,
    ).credits,
    earnedGraduationCredits,
    remainingGraduationCredits:
      graduationCredits === undefined
        ? null
        : Math.max(graduationCredits - earnedGraduationCredits, 0),
    cumulativeGpa10: finalCumulativeSummary?.cumulativeGpa10 ?? null,
    cumulativeGpa4: finalCumulativeSummary?.cumulativeGpa4 ?? null,
    retakeCount: effectiveResult.repeatedCourseCount,
    repeatedCourseCount: effectiveResult.repeatedCourseCount,
    repeatedRawCredits: effectiveResult.repeatedRawCredits,
    repeatedEffectiveCredits: effectiveResult.repeatedEffectiveCredits,
  };
}
