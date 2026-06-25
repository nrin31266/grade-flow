import type { RetakeSettings } from "@/types/profile";

export type GradeScaleItem = {
  letter: string;
  minScore10: number;
  maxScore10: number;
  gpa4: number;
};

export type SchoolOption = {
  id: string;
  name: string;
  shortName: string;
  gradeScale: GradeScaleItem[];
  academicRulePreset?: {
    gradeScale: GradeScaleItem[];
    retakeSettings: RetakeSettings;
  };
};
