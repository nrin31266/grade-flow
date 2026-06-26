import type { RetakeSettings } from "@/types/profile";
import type { GradeScaleItem } from "@/types/school";

export type AcademicRulePreset = {
  id: string;
  label: string;
  gradeScale: GradeScaleItem[];
  retakeSettings: RetakeSettings;
  graduationCredits?: number;
  requiredGraduationCredits?: number;
  electiveGraduationCredits?: number;
  note: string;
};

export const vkuGradeScale: GradeScaleItem[] = [
  { letter: "A", minScore10: 8.5, maxScore10: 10, gpa4: 4.0 },
  { letter: "B", minScore10: 7.0, maxScore10: 8.4, gpa4: 3.0 },
  { letter: "C", minScore10: 5.5, maxScore10: 6.9, gpa4: 2.0 },
  { letter: "D", minScore10: 4.0, maxScore10: 5.4, gpa4: 1.0 },
  { letter: "F", minScore10: 0, maxScore10: 3.9, gpa4: 0 },
];

export const plusGradeScale: GradeScaleItem[] = [
  { letter: "A", minScore10: 8.5, maxScore10: 10, gpa4: 4.0 },
  { letter: "B+", minScore10: 8.0, maxScore10: 8.4, gpa4: 3.5 },
  { letter: "B", minScore10: 7.0, maxScore10: 7.9, gpa4: 3.0 },
  { letter: "C+", minScore10: 6.5, maxScore10: 6.9, gpa4: 2.5 },
  { letter: "C", minScore10: 5.5, maxScore10: 6.4, gpa4: 2.0 },
  { letter: "D+", minScore10: 5.0, maxScore10: 5.4, gpa4: 1.5 },
  { letter: "D", minScore10: 4.0, maxScore10: 4.9, gpa4: 1.0 },
  { letter: "F", minScore10: 0, maxScore10: 3.9, gpa4: 0 },
];

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

export const academicRulePresets: Record<string, AcademicRulePreset> = {
  vku: {
    id: "vku",
    label: "Preset VKU",
    gradeScale: vkuGradeScale,
    retakeSettings: defaultRetakeSettings,
    graduationCredits: 160,
    requiredGraduationCredits: 154,
    electiveGraduationCredits: 6,
    note: "A/B/C/D/F, học lại/cải thiện lấy điểm cao nhất.",
  },
  plus_default: {
    id: "plus_default",
    label: "Preset thang điểm cộng",
    gradeScale: plusGradeScale,
    retakeSettings: defaultRetakeSettings,
    note: "A/B+/B/C+/C/D+/D/F, có thể chỉnh lại trong Cấu hình học vụ.",
  },
};
