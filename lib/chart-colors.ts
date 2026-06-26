export const chartColors = {
  gpaTerm: "#0ea5e9",         // sky-500
  gpaCumulative: "#ef4444",   // red-500
  creditsGpa: "#38bdf8",      // sky-400
  creditsEarned: "#22c55e",   // green-500
  creditsPending: "#f59e0b",  // amber-500
  gradeA: "#10b981",          // emerald-500
  gradeB: "#3b82f6",          // blue-500
  gradeC: "#f59e0b",          // amber-500
  gradeD: "#f97316",          // orange-500
  gradeF: "#ef4444",          // red-500
  muted: "#94a3b8",           // slate-400
  grid: "#bae6fd",            // sky-200
};

export function getLetterGradeChartColor(letterGrade: string): string {
  if (letterGrade.startsWith("A")) return chartColors.gradeA;
  if (letterGrade.startsWith("B")) return chartColors.gradeB;
  if (letterGrade.startsWith("C")) return chartColors.gradeC;
  if (letterGrade.startsWith("D")) return chartColors.gradeD;
  if (letterGrade.startsWith("F")) return chartColors.gradeF;
  return chartColors.muted;
}
