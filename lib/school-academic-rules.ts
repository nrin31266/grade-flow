import { schoolOptions } from "@/data/school-options";
import { getEffectiveRetakeSettings } from "@/lib/retake-settings";
import type { UserProfile } from "@/types/profile";
import type { GradeScaleItem } from "@/types/school";

export type AcademicRules = {
  gradeScale: GradeScaleItem[];
  retakeSettings: ReturnType<typeof getEffectiveRetakeSettings>;
  graduationCredits?: number;
  requiredGraduationCredits?: number;
  electiveGraduationCredits?: number;
};

export function getDefaultAcademicRulesForSchool(schoolId: string): AcademicRules {
  const school = schoolOptions.find((option) => option.id === schoolId);

  return {
    gradeScale: school?.academicRulePreset?.gradeScale ?? school?.gradeScale ?? [],
    retakeSettings: getEffectiveRetakeSettings({
      retakeSettings: school?.academicRulePreset?.retakeSettings,
    } as UserProfile),
    graduationCredits: school?.academicRulePreset?.graduationCredits,
    requiredGraduationCredits:
      school?.academicRulePreset?.requiredGraduationCredits,
    electiveGraduationCredits:
      school?.academicRulePreset?.electiveGraduationCredits,
  };
}

export function mergeProfileWithAcademicDefaults(
  profile: UserProfile,
): UserProfile {
  const rules = getDefaultAcademicRulesForSchool(profile.schoolId);

  return {
    ...profile,
    graduationCredits: profile.graduationCredits ?? rules.graduationCredits,
    requiredGraduationCredits:
      profile.requiredGraduationCredits ?? rules.requiredGraduationCredits,
    electiveGraduationCredits:
      profile.electiveGraduationCredits ?? rules.electiveGraduationCredits,
    gradeScale: profile.gradeScale.length > 0 ? profile.gradeScale : rules.gradeScale,
    retakeSettings: getEffectiveRetakeSettings(profile),
  };
}
