import type { GradeScaleItem } from "@/types/school";

export function getGradeScaleResult(
  score10: number | null,
  gradeScale: GradeScaleItem[],
): {
  letterGrade: string | null;
  gpa4: number | null;
} {
  if (score10 === null) {
    return { letterGrade: null, gpa4: null };
  }

  const matchedGrade = gradeScale.find(
    (grade) => score10 >= grade.minScore10 && score10 <= grade.maxScore10,
  );

  return matchedGrade
    ? { letterGrade: matchedGrade.letter, gpa4: matchedGrade.gpa4 }
    : { letterGrade: null, gpa4: null };
}

export function normalizeScore10Input(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
