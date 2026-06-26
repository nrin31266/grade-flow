import type { RetakeSettings, UserProfile } from "@/types/profile";

export const defaultRetakeSettings: RetakeSettings = {
  policy: "highest",
  retakeTriggerMode: "failed_only",
  retakeScoreThreshold: 4,
  improvementEnabled: true,
  retakeCreditWarningPercent: 5,
  retakeCreditWarningMode: "affects_classification",
  improvementCreditWarningPercent: undefined,
  improvementCreditWarningMode: "info",
  countFailedAttemptCredits: false,
};

export function getEffectiveRetakeSettings(
  profile?: UserProfile | null,
): RetakeSettings {
  const mergedSettings = {
    ...defaultRetakeSettings,
    ...profile?.retakeSettings,
  };

  return {
    ...mergedSettings,
    retakeCreditWarningPercent:
      mergedSettings.retakeCreditWarningPercent ??
      mergedSettings.retakeCreditLimitPercent,
    improvementCreditWarningPercent:
      mergedSettings.improvementCreditWarningPercent ??
      mergedSettings.improvementCreditLimitPercent,
  };
}
