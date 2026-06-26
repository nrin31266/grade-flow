export type AcademicGoal = {
  targetGpa4: number | null;
  targetGpa10: number | null;
  targetGraduationCredits: number | null;
  preferredTargetScale: "gpa4" | "gpa10" | "both";

  /** Giả định điểm hệ 4 sau cải thiện (mặc định 4.0) */
  assumedImprovementGpa4?: number;
  /** Giả định điểm hệ 10 sau cải thiện (mặc định 8.5) */
  assumedImprovementScore10?: number;

  note?: string;
  updatedAt: string;
};

export function getDefaultAcademicGoal(): AcademicGoal {
  return {
    targetGpa4: null,
    targetGpa10: null,
    targetGraduationCredits: null,
    preferredTargetScale: "gpa4",
    assumedImprovementGpa4: 4.0,
    assumedImprovementScore10: 8.5,
    updatedAt: new Date().toISOString(),
  };
}
