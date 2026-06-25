import type { GradeScaleItem } from "@/types/school";

export type RetakePolicy = "highest" | "latest" | "manual";

export type RetakeTriggerMode = "failed_only" | "below_score" | "manual";

export type RetakeSettings = {
  policy: RetakePolicy;
  retakeTriggerMode: RetakeTriggerMode;
  retakeScoreThreshold: number;
  improvementEnabled: boolean;
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

  gradeScale: GradeScaleItem[];
  retakeSettings?: RetakeSettings;

  createdAt: string;
  updatedAt: string;
};
