import type { RetakeSettings, UserProfile } from "@/types/profile";

export const defaultRetakeSettings: RetakeSettings = {
  policy: "highest",
  retakeTriggerMode: "failed_only",
  retakeScoreThreshold: 4,
  improvementEnabled: true,
  improvementCreditLimitPercent: 10,
  retakeCreditLimitPercent: 10,
  countFailedAttemptCredits: false,
};

export function getEffectiveRetakeSettings(
  profile?: UserProfile | null,
): RetakeSettings {
  return {
    ...defaultRetakeSettings,
    ...profile?.retakeSettings,
  };
}
