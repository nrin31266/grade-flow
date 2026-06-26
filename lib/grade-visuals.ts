import type { CourseStatus } from "@/types/academic";

const neutralTone = "border-slate-200 bg-slate-50 text-slate-700";

export function getLetterGradeTone(letterGrade?: string | null): {
  label: string;
  className: string;
} {
  if (!letterGrade) {
    return { label: "—", className: neutralTone };
  }

  const normalizedLetter = letterGrade.toUpperCase();

  if (normalizedLetter.startsWith("A")) {
    return {
      label: letterGrade,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (normalizedLetter.startsWith("B")) {
    return {
      label: letterGrade,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    };
  }

  if (normalizedLetter.startsWith("C")) {
    return {
      label: letterGrade,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (normalizedLetter.startsWith("D")) {
    return {
      label: letterGrade,
      className: "border-orange-200 bg-orange-50 text-orange-700",
    };
  }

  return {
    label: letterGrade,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  };
}

export function getScoreTone(score10?: number | null): string {
  if (score10 === null || score10 === undefined) {
    return "text-muted-foreground";
  }

  if (score10 < 4) {
    return "font-medium text-rose-700";
  }

  if (score10 < 5.5) {
    return "font-medium text-orange-700";
  }

  if (score10 < 7) {
    return "font-medium text-amber-700";
  }

  if (score10 < 8.5) {
    return "font-medium text-blue-700";
  }

  return "font-medium text-emerald-700";
}

export function getStatusTone(status: CourseStatus): string {
  const tones: Record<CourseStatus, string> = {
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-slate-200 bg-slate-50 text-slate-700",
    failed: "border-rose-200 bg-rose-50 text-rose-700",
    in_progress: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return tones[status];
}

export function getGpaTone(gpa4?: number | null): string {
  if (gpa4 === null || gpa4 === undefined) {
    return neutralTone;
  }

  if (gpa4 >= 3.6) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (gpa4 >= 3) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (gpa4 >= 2) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (gpa4 >= 1) {
    return "border-orange-200 bg-orange-50 text-orange-700";
  }

  return "border-rose-200 bg-rose-50 text-rose-700";
}
