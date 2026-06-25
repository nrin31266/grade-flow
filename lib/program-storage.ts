import type { StudyProgram } from "@/types/program";

const STUDY_PROGRAM_STORAGE_KEY = "gradeflow:study-program";

export function getStudyProgram(): StudyProgram | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedProgram = localStorage.getItem(STUDY_PROGRAM_STORAGE_KEY);

    if (!storedProgram) {
      return null;
    }

    return JSON.parse(storedProgram) as StudyProgram;
  } catch {
    return null;
  }
}

export function saveStudyProgram(program: StudyProgram): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STUDY_PROGRAM_STORAGE_KEY, JSON.stringify(program));
}

export function clearStudyProgram(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STUDY_PROGRAM_STORAGE_KEY);
}