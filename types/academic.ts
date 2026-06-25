export type TermCode = "semester_1" | "semester_2" | "summer" | "custom";

// ActualTerm là kỳ thật người dùng đăng ký/học. GPA theo kỳ sẽ dựa trên actualTerm.
export type ActualTerm = {
  id: string;
  academicYear: string;
  termCode: TermCode;
  name: string;
  order: number;
};

export type KnowledgeBlock =
  | "general"
  | "foundation"
  | "major"
  | "specialized"
  | "support"
  | "graduation"
  | "other";

export type CourseRequirementType = "required" | "elective";

export type CourseStatus = "completed" | "pending" | "failed" | "in_progress";

export type StudyProgramCourse = {
  id: string;
  code?: string;
  name: string;
  credits: number;

  // plannedTermNumber là kỳ theo chương trình đào tạo, không phải kỳ học thật.
  plannedTermNumber?: number;

  knowledgeBlock: KnowledgeBlock;
  requirementType: CourseRequirementType;

  tags: string[];

  note?: string;

  createdAt: string;
  updatedAt: string;
};

export type CourseEnrollment = {
  id: string;

  programCourseId?: string;

  code?: string;
  name: string;
  credits: number;

  actualTermId: string;
  actualTermName: string;
  academicYear: string;
  termCode: TermCode;

  // actualTerm là kỳ học thật sinh viên đăng ký/học.
  // plannedTermNumber là kỳ theo chương trình đào tạo, không phải kỳ tính GPA.
  plannedTermNumber?: number;

  score10: number | null;
  letterGrade?: string | null;
  gpa4?: number | null;

  status: CourseStatus;

  countsForGpa: boolean;
  countsForGraduation: boolean;

  isRetake: boolean;
  replacesEnrollmentId?: string;

  attemptNumber?: number;

  tags: string[];

  note?: string;

  createdAt: string;
  updatedAt: string;
};
