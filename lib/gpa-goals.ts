import type { OverallGpaSummary } from "@/lib/gpa";
import type { AcademicGoal } from "@/types/goals";
import type { CourseEnrollment } from "@/types/academic";

// ─── Improvement candidate ─────────────────────────────────────────

export type ImprovementCandidate = {
  enrollmentId: string;
  programCourseId?: string;
  name: string;
  code?: string;
  credits: number;
  currentScore10: number | null;
  currentGpa4: number | null;
  currentLetterGrade?: string | null;
  assumedTargetGpa4: number;
  assumedTargetScore10: number;
  /** possibleGpa4Gain = (assumedTargetGpa4 - currentGpa4) * credits */
  possibleGpa4Gain: number;
  /** possibleScore10Gain = (assumedTargetScore10 - currentScore10) * credits */
  possibleScore10Gain: number;
  actualTermName: string;
};

export type ImprovementPlanEstimate = {
  candidates: ImprovementCandidate[];
  totalCandidateCredits: number;

  /** Sum of (assumedTargetGpa4 - currentGpa4) * credits across all candidates */
  totalPossibleGpa4GainPoints: number;
  totalPossibleGpa10GainPoints: number;

  /** Credits needed to improve so required avg ≤ max (4.0 / 10) */
  creditsNeededToMakeTargetPossibleGpa4: number | null;
  creditsNeededToMakeTargetPossibleGpa10: number | null;

  suggestedCandidatesForGpa4: ImprovementCandidate[];
  suggestedCandidatesForGpa10: ImprovementCandidate[];

  /** Required avg for remaining credits after improvement */
  improvedRequiredAverageGpa4: number | null;
  improvedRequiredAverageGpa10: number | null;

  canBecomePossibleWithImprovementGpa4: boolean;
  canBecomePossibleWithImprovementGpa10: boolean;
};

// ─── Goal projection ────────────────────────────────────────────────

export type GpaGoalProjection = {
  targetGpa4: number | null;
  targetGpa10: number | null;
  currentGpa4: number | null;
  currentGpa10: number | null;
  currentGpaCredits: number;
  earnedGraduationCredits: number;
  targetGraduationCredits: number | null;
  remainingCredits: number | null;
  requiredAverageGpa4: number | null;
  requiredAverageGpa10: number | null;
  gpa4Status: GpaGoalStatus;
  gpa10Status: GpaGoalStatus;
  explanation: string[];
  /** Plan phân tích cải thiện (null nếu không đủ dữ liệu) */
  improvementPlan: ImprovementPlanEstimate | null;
};

export type GpaGoalStatus =
  | "not_set"
  | "achieved"
  | "possible"
  | "hard"
  | "needs_improvement"
  | "impossible"
  | "no_remaining_credits";

type CalculateParams = {
  overallSummary: OverallGpaSummary;
  goal: AcademicGoal;
  profileGraduationCredits?: number;
  /** Lượt học hiệu lực — dùng để tìm môn có thể cải thiện */
  effectiveEnrollments?: CourseEnrollment[];
};

// ─── Tìm môn có thể cải thiện ───────────────────────────────────────

export function findImprovementCandidates(params: {
  effectiveEnrollments: CourseEnrollment[];
  assumedTargetGpa4?: number;
  assumedTargetScore10?: number;
}): ImprovementCandidate[] {
  const { effectiveEnrollments } = params;
  const targetGpa4 = params.assumedTargetGpa4 ?? 4.0;
  const targetScore10 = params.assumedTargetScore10 ?? 8.5;

  const candidates: ImprovementCandidate[] = [];

  for (const enrollment of effectiveEnrollments) {
    // Chỉ xét môn có điểm, có GPA, đã completed/failed
    if (
      enrollment.score10 === null ||
      enrollment.gpa4 === null ||
      enrollment.gpa4 === undefined ||
      (enrollment.status !== "completed" && enrollment.status !== "failed")
    ) {
      continue;
    }

    // Chỉ xét môn được tính GPA
    if (!enrollment.countsForGpa) continue;

    // Bỏ qua nếu đã >= target
    if (enrollment.gpa4 >= targetGpa4 && enrollment.score10 >= targetScore10) {
      continue;
    }

    const gainGpa4 = Math.max(0, (targetGpa4 - enrollment.gpa4) * enrollment.credits);
    const gainScore10 = Math.max(
      0,
      (targetScore10 - enrollment.score10) * enrollment.credits,
    );

    candidates.push({
      enrollmentId: enrollment.id,
      programCourseId: enrollment.programCourseId,
      name: enrollment.name,
      code: enrollment.code,
      credits: enrollment.credits,
      currentScore10: enrollment.score10,
      currentGpa4: enrollment.gpa4,
      currentLetterGrade: enrollment.letterGrade,
      assumedTargetGpa4: targetGpa4,
      assumedTargetScore10: targetScore10,
      possibleGpa4Gain: gainGpa4,
      possibleScore10Gain: gainScore10,
      actualTermName: enrollment.actualTermName,
    });
  }

  // Sort: potential gain (gpa4 * credits) giảm dần
  candidates.sort((a, b) => {
    const gainDiff = b.possibleGpa4Gain - a.possibleGpa4Gain;
    if (gainDiff !== 0) return gainDiff;
    const creditDiff = b.credits - a.credits;
    if (creditDiff !== 0) return creditDiff;
    return (a.currentGpa4 ?? 0) - (b.currentGpa4 ?? 0);
  });

  return candidates;
}

// ─── Ước tính cần cải thiện bao nhiêu ──────────────────────────────

function estimateImprovementForScale(
  candidates: ImprovementCandidate[],
  currentGpa: number | null,
  currentGpaCredits: number,
  targetGpa: number | null,
  targetGraduationCredits: number | null,
  remainingCredits: number | null,
  maxScale: number,
  assumedTargetGpaPerCandidate: number,
): {
  creditsNeeded: number | null;
  suggestedCandidates: ImprovementCandidate[];
  improvedRequiredAverage: number | null;
  canBecomePossible: boolean;
} {
  if (
    targetGpa === null ||
    currentGpa === null ||
    remainingCredits === null ||
    remainingCredits <= 0 ||
    targetGraduationCredits === null
  ) {
    return {
      creditsNeeded: null,
      suggestedCandidates: [],
      improvedRequiredAverage: null,
      canBecomePossible: false,
    };
  }

  const targetTotal = targetGraduationCredits;
  let currentPoints = currentGpa * currentGpaCredits;
  const selectedCandidates: ImprovementCandidate[] = [];
  let totalGain = 0;

  for (const candidate of candidates) {
    const gain =
      (assumedTargetGpaPerCandidate - (candidate.currentGpa4 ?? 0)) *
      candidate.credits;

    // Chỉ xét candidate có gain dương
    if (gain <= 0) continue;

    currentPoints += gain;
    totalGain += gain;
    selectedCandidates.push(candidate);

    const remaining = Math.max(remainingCredits, 0);
    const required =
      remaining > 0
        ? (targetGpa * targetTotal - currentPoints) / remaining
        : null;

    if (required !== null && required <= maxScale) {
      return {
        creditsNeeded: selectedCandidates.reduce(
          (sum, c) => sum + c.credits,
          0,
        ),
        suggestedCandidates: selectedCandidates,
        improvedRequiredAverage: required,
        canBecomePossible: true,
      };
    }
  }

  // Duyệt hết vẫn chưa đủ
  const lastRequired =
    remainingCredits > 0
      ? (targetGpa * targetGraduationCredits -
          (currentGpa * currentGpaCredits + totalGain)) /
        remainingCredits
      : null;

  return {
    creditsNeeded: null,
    suggestedCandidates: selectedCandidates.slice(0, 3),
    improvedRequiredAverage: lastRequired,
    canBecomePossible: false,
  };
}

// ─── Status helpers ─────────────────────────────────────────────────

function computeGpa4Status(
  target: number | null,
  current: number | null,
  required: number | null,
  remaining: number | null,
  canBecomePossibleWithImprovement: boolean,
): GpaGoalStatus {
  if (target === null) return "not_set";
  if (current === null) return "hard";
  if (remaining === null) return "hard";
  if (remaining <= 0) {
    return current >= target ? "achieved" : "no_remaining_credits";
  }
  if (required === null) return "hard";
  if (current >= target) return "achieved";
  if (required <= 3.2) return "possible";
  if (required <= 4.0) return "hard";
  // required > 4.0
  if (canBecomePossibleWithImprovement) return "needs_improvement";
  return "impossible";
}

function computeGpa10Status(
  target: number | null,
  current: number | null,
  required: number | null,
  remaining: number | null,
  canBecomePossibleWithImprovement: boolean,
): GpaGoalStatus {
  if (target === null) return "not_set";
  if (current === null) return "hard";
  if (remaining === null) return "hard";
  if (remaining <= 0) {
    return current >= target ? "achieved" : "no_remaining_credits";
  }
  if (required === null) return "hard";
  if (current >= target) return "achieved";
  if (required <= 8.0) return "possible";
  if (required <= 10.0) return "hard";
  // required > 10.0
  if (canBecomePossibleWithImprovement) return "needs_improvement";
  return "impossible";
}

export function calculateGpaGoalProjection({
  overallSummary,
  goal,
  profileGraduationCredits,
  effectiveEnrollments,
}: CalculateParams): GpaGoalProjection {
  const targetGraduationCredits =
    goal.targetGraduationCredits ?? profileGraduationCredits ?? null;

  const currentGpa4 = overallSummary.cumulativeGpa4;
  const currentGpa10 = overallSummary.cumulativeGpa10;
  const currentGpaCredits = overallSummary.gpaCredits;
  const earnedGraduationCredits = overallSummary.earnedGraduationCredits;

  const remainingCredits =
    targetGraduationCredits === null
      ? null
      : Math.max(targetGraduationCredits - earnedGraduationCredits, 0);

  const targetTotal = targetGraduationCredits ?? currentGpaCredits;

  // Required average gpa4
  let requiredAverageGpa4: number | null = null;
  if (
    goal.targetGpa4 !== null &&
    currentGpa4 !== null &&
    remainingCredits !== null &&
    remainingCredits > 0
  ) {
    requiredAverageGpa4 =
      (goal.targetGpa4 * targetTotal - currentGpa4 * currentGpaCredits) /
      remainingCredits;
  }

  // Required average gpa10
  let requiredAverageGpa10: number | null = null;
  if (
    goal.targetGpa10 !== null &&
    currentGpa10 !== null &&
    remainingCredits !== null &&
    remainingCredits > 0
  ) {
    requiredAverageGpa10 =
      (goal.targetGpa10 * targetTotal - currentGpa10 * currentGpaCredits) /
      remainingCredits;
  }

  // ─── Improvement plan ─────────────────────────────────────
  const assumedImprovementGpa4 = goal.assumedImprovementGpa4 ?? 4.0;
  const assumedImprovementScore10 = goal.assumedImprovementScore10 ?? 8.5;

  let improvementPlan: ImprovementPlanEstimate | null = null;

  if (effectiveEnrollments && effectiveEnrollments.length > 0) {
    const candidates = findImprovementCandidates({
      effectiveEnrollments,
      assumedTargetGpa4: assumedImprovementGpa4,
      assumedTargetScore10: assumedImprovementScore10,
    });

    const totalCandidateCredits = candidates.reduce(
      (sum, c) => sum + c.credits,
      0,
    );
    const totalPossibleGpa4GainPoints = candidates.reduce(
      (sum, c) => sum + c.possibleGpa4Gain,
      0,
    );
    const totalPossibleGpa10GainPoints = candidates.reduce(
      (sum, c) => sum + c.possibleScore10Gain,
      0,
    );

    const gpa4Estimate = estimateImprovementForScale(
      candidates,
      currentGpa4,
      currentGpaCredits,
      goal.targetGpa4,
      targetGraduationCredits,
      remainingCredits,
      4.0,
      assumedImprovementGpa4,
    );

    const gpa10Estimate = estimateImprovementForScale(
      candidates,
      currentGpa10,
      currentGpaCredits,
      goal.targetGpa10,
      targetGraduationCredits,
      remainingCredits,
      10.0,
      assumedImprovementGpa4, // Use gpa4 target for per-candidate assumed gain
    );

    improvementPlan = {
      candidates,
      totalCandidateCredits,
      totalPossibleGpa4GainPoints,
      totalPossibleGpa10GainPoints,
      creditsNeededToMakeTargetPossibleGpa4: gpa4Estimate.creditsNeeded,
      creditsNeededToMakeTargetPossibleGpa10: gpa10Estimate.creditsNeeded,
      suggestedCandidatesForGpa4: gpa4Estimate.suggestedCandidates,
      suggestedCandidatesForGpa10: gpa10Estimate.suggestedCandidates,
      improvedRequiredAverageGpa4: gpa4Estimate.improvedRequiredAverage,
      improvedRequiredAverageGpa10: gpa10Estimate.improvedRequiredAverage,
      canBecomePossibleWithImprovementGpa4: gpa4Estimate.canBecomePossible,
      canBecomePossibleWithImprovementGpa10: gpa10Estimate.canBecomePossible,
    };
  }

  // ─── Compute status (now with improvement info) ───────────
  const canImproveGpa4 =
    improvementPlan?.canBecomePossibleWithImprovementGpa4 ?? false;
  const canImproveGpa10 =
    improvementPlan?.canBecomePossibleWithImprovementGpa10 ?? false;

  const gpa4Status = computeGpa4Status(
    goal.targetGpa4,
    currentGpa4,
    requiredAverageGpa4,
    remainingCredits,
    canImproveGpa4,
  );
  const gpa10Status = computeGpa10Status(
    goal.targetGpa10,
    currentGpa10,
    requiredAverageGpa10,
    remainingCredits,
    canImproveGpa10,
  );

  // ─── Explanation ──────────────────────────────────────────
  const explanation: string[] = [];

  if (remainingCredits !== null) {
    explanation.push(
      `Bạn còn ${remainingCredits} tín chỉ theo mục tiêu tốt nghiệp ${targetGraduationCredits} tín chỉ.`,
    );
  } else if (targetGraduationCredits === null) {
    explanation.push(
      "Chưa có tín chỉ tốt nghiệp mục tiêu. Hãy cấu hình trong hồ sơ học tập.",
    );
  }

  if (
    goal.targetGpa4 !== null &&
    requiredAverageGpa4 !== null
  ) {
    explanation.push(
      `Để đạt GPA hệ 4 là ${goal.targetGpa4.toFixed(2)}, trung bình các tín chỉ còn lại cần khoảng ${requiredAverageGpa4.toFixed(2)}.`,
    );
  }

  if (
    goal.targetGpa10 !== null &&
    requiredAverageGpa10 !== null
  ) {
    explanation.push(
      `Để đạt GPA hệ 10 là ${goal.targetGpa10.toFixed(2)}, trung bình các tín chỉ còn lại cần khoảng ${requiredAverageGpa10.toFixed(2)}.`,
    );
  }

  // Thêm giải thích improvement
  if (gpa4Status === "needs_improvement" && improvementPlan) {
    if (improvementPlan.creditsNeededToMakeTargetPossibleGpa4 !== null) {
      explanation.push(
        `Có thể khả thi nếu cải thiện khoảng ${improvementPlan.creditsNeededToMakeTargetPossibleGpa4} tín chỉ điểm thấp lên ${assumedImprovementGpa4.toFixed(1)}.`,
      );
      if (improvementPlan.improvedRequiredAverageGpa4 !== null) {
        explanation.push(
          `Khi đó trung bình tín chỉ còn lại cần khoảng ${improvementPlan.improvedRequiredAverageGpa4.toFixed(2)}.`,
        );
      }
    } else {
      explanation.push(
        "Nếu chỉ tính tín chỉ còn lại thì chưa đủ, nhưng cải thiện môn điểm thấp có thể giúp đạt mục tiêu.",
      );
    }
  } else if (gpa4Status === "possible" || gpa4Status === "hard") {
    if (
      improvementPlan &&
      improvementPlan.candidates.length > 0 &&
      remainingCredits !== null &&
      remainingCredits > 0
    ) {
      explanation.push(
        "Cải thiện môn điểm thấp sẽ giúp giảm áp lực các kỳ sau.",
      );
    }
  }

  if (requiredAverageGpa4 !== null || requiredAverageGpa10 !== null) {
    explanation.push(
      "Đây là ước tính nếu các tín chỉ còn lại đều tính GPA.",
    );
  }

  return {
    targetGpa4: goal.targetGpa4,
    targetGpa10: goal.targetGpa10,
    currentGpa4,
    currentGpa10,
    currentGpaCredits,
    earnedGraduationCredits,
    targetGraduationCredits,
    remainingCredits,
    requiredAverageGpa4,
    requiredAverageGpa10,
    gpa4Status,
    gpa10Status,
    explanation,
    improvementPlan,
  };
}


