import type { StudyProgramCourse } from "./academic";

export type StudyProgram = {
  id: string;
  schoolId: string;
  name: string;
  majorName?: string;
  graduationCredits?: number;
  totalPlannedTerms?: number;
  courses: StudyProgramCourse[];
  createdAt: string;
  updatedAt: string;
};