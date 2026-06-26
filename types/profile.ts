import type { GradeScaleItem } from "@/types/school";

export type RetakePolicy = "highest" | "latest" | "manual";

export type RetakeTriggerMode = "failed_only" | "below_score" | "manual";

export type CreditWarningMode = "off" | "info" | "affects_classification";

export type RetakeSettings = {
  policy: RetakePolicy;
  retakeTriggerMode: RetakeTriggerMode;
  retakeScoreThreshold: number;
  improvementEnabled: boolean;

  retakeCreditWarningPercent?: number;
  retakeCreditWarningMode?: CreditWarningMode;
  improvementCreditWarningPercent?: number;
  improvementCreditWarningMode?: CreditWarningMode;

  // Legacy keys kept for existing localStorage profiles.
  improvementCreditLimitPercent?: number;
  retakeCreditLimitPercent?: number;

  countFailedAttemptCredits?: boolean;
};

export type UserProfile = {
  displayName: string;
  schoolId: string;
  schoolName: string;
  schoolShortName: string;

  programId?: string;
  programName?: string;
  majorName?: string;

  graduationCredits?: number;
  requiredGraduationCredits?: number;
  electiveGraduationCredits?: number;

  gradeScale: GradeScaleItem[];
  retakeSettings?: RetakeSettings;

  createdAt: string;
  updatedAt: string;
};
