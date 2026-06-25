import type { CourseRequirementType, KnowledgeBlock } from "@/types/academic";

export const knowledgeBlockLabels: Record<KnowledgeBlock, string> = {
  general: "Đại cương",
  foundation: "Cơ sở ngành",
  major: "Chuyên ngành",
  specialized: "Chuyên sâu",
  support: "Bổ trợ",
  graduation: "Tốt nghiệp",
  other: "Khác",
};

export const requirementTypeLabels: Record<CourseRequirementType, string> = {
  required: "Bắt buộc",
  elective: "Tự chọn",
};
