import type { GradeScaleItem, SchoolOption } from "@/types/school";
import type { RetakeSettings } from "@/types/profile";

const vkuGradeScale: GradeScaleItem[] = [
  { letter: "A", minScore10: 8.5, maxScore10: 10, gpa4: 4.0 },
  { letter: "B", minScore10: 7.0, maxScore10: 8.4, gpa4: 3.0 },
  { letter: "C", minScore10: 5.5, maxScore10: 6.9, gpa4: 2.0 },
  { letter: "D", minScore10: 4.0, maxScore10: 5.4, gpa4: 1.0 },
  { letter: "F", minScore10: 0, maxScore10: 3.9, gpa4: 0 },
];

const plusGradeScale: GradeScaleItem[] = [
  { letter: "A", minScore10: 8.5, maxScore10: 10, gpa4: 4.0 },
  { letter: "B+", minScore10: 8.0, maxScore10: 8.4, gpa4: 3.5 },
  { letter: "B", minScore10: 7.0, maxScore10: 7.9, gpa4: 3.0 },
  { letter: "C+", minScore10: 6.5, maxScore10: 6.9, gpa4: 2.5 },
  { letter: "C", minScore10: 5.5, maxScore10: 6.4, gpa4: 2.0 },
  { letter: "D+", minScore10: 5.0, maxScore10: 5.4, gpa4: 1.5 },
  { letter: "D", minScore10: 4.0, maxScore10: 4.9, gpa4: 1.0 },
  { letter: "F", minScore10: 0, maxScore10: 3.9, gpa4: 0 },
];

const defaultRetakeSettings: RetakeSettings = {
  policy: "highest",
  retakeTriggerMode: "failed_only",
  retakeScoreThreshold: 4,
  improvementEnabled: true,
  improvementCreditLimitPercent: 10,
  retakeCreditLimitPercent: 10,
  countFailedAttemptCredits: false,
};

export const schoolOptions: SchoolOption[] = [
  {
    id: "vku",
    name: "Trường Đại học CNTT&TT Việt - Hàn",
    shortName: "VKU",
    gradeScale: vkuGradeScale,
    academicRulePreset: {
      gradeScale: vkuGradeScale,
      retakeSettings: defaultRetakeSettings,
    },
  },
  {
    id: "due",
    name: "Trường Đại học Kinh tế - Đại học Đà Nẵng",
    shortName: "DUE",
    gradeScale: plusGradeScale,
    academicRulePreset: {
      gradeScale: plusGradeScale,
      retakeSettings: defaultRetakeSettings,
    },
  },
  {
    id: "dut",
    name: "Trường Đại học Bách khoa - Đại học Đà Nẵng",
    shortName: "DUT",
    // Mẫu tạm thời, người dùng có thể chỉnh cấu hình này ở phase sau.
    gradeScale: plusGradeScale,
    academicRulePreset: {
      gradeScale: plusGradeScale,
      retakeSettings: defaultRetakeSettings,
    },
  },
  {
    id: "custom",
    name: "Trường khác",
    shortName: "Custom",
    gradeScale: plusGradeScale,
    academicRulePreset: {
      gradeScale: plusGradeScale,
      retakeSettings: defaultRetakeSettings,
    },
  },
];
