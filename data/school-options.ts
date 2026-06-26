import {
  academicRulePresets,
  plusGradeScale,
  vkuGradeScale,
} from "@/data/academic-rule-presets";
import type { SchoolOption } from "@/types/school";

export const schoolOptions: SchoolOption[] = [
  {
    id: "vku",
    name: "Trường Đại học CNTT&TT Việt - Hàn",
    shortName: "VKU",
    gradeScale: vkuGradeScale,
    academicRulePreset: academicRulePresets.vku,
  },
  {
    id: "due",
    name: "Trường Đại học Kinh tế - Đại học Đà Nẵng",
    shortName: "DUE",
    gradeScale: plusGradeScale,
    academicRulePreset: academicRulePresets.plus_default,
  },
  {
    id: "dut",
    name: "Trường Đại học Bách khoa - Đại học Đà Nẵng",
    shortName: "DUT",
    gradeScale: plusGradeScale,
    academicRulePreset: academicRulePresets.plus_default,
  },
  {
    id: "custom",
    name: "Trường khác",
    shortName: "Custom",
    gradeScale: plusGradeScale,
    academicRulePreset: academicRulePresets.plus_default,
  },
];
