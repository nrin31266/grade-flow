import type { CumulativeGpaSummary } from "@/lib/gpa";
import type { CourseEnrollment } from "@/types/academic";

export type GpaTrendPoint = {
  termName: string;
  shortTermName: string;
  termOrder: number;
  termGpa4: number | null;
  termGpa10: number | null;
  cumulativeGpa4: number | null;
  cumulativeGpa10: number | null;
};

export type CreditTrendPoint = {
  termName: string;
  shortTermName: string;
  termOrder: number;
  gpaCredits: number;
  earnedCredits: number;
  cumulativeEarnedCredits: number;
};

export type GradeDistributionItem = {
  letterGrade: string;
  count: number;
  credits: number;
  percent: number;
};

function shortenTermName(termName: string): string {
  // "Học kỳ 1 2023-2024" → "HK1 23-24"
  // "Học kỳ 2 - 2024-2025" → "HK2 24-25"
  // "Học kỳ hè 2023-2024" → "Hè 23-24"

  const shortYear = (year: string) => {
    const parts = year.split("-");
    return parts.map((p) => p.slice(-2)).join("-");
  };

  // Normalize: remove " - " between term number and year
  const normalized = termName.replace(/(\d)\s*-\s*(\d{4})/, "$1 $2");

  const hk1 = /học\s*kỳ\s*1\s*(\d{4}-\d{4})/i;
  const hk2 = /học\s*kỳ\s*2\s*(\d{4}-\d{4})/i;
  const summer = /học\s*kỳ\s*h[eè]\s*(\d{4}-\d{4})/i;

  if (hk1.test(normalized)) {
    return normalized.replace(hk1, "HK1 $1").replace(/(\d{4})-(\d{4})/, (_, y1, y2) => shortYear(`${y1}-${y2}`));
  }
  if (hk2.test(normalized)) {
    return normalized.replace(hk2, "HK2 $1").replace(/(\d{4})-(\d{4})/, (_, y1, y2) => shortYear(`${y1}-${y2}`));
  }
  if (summer.test(normalized)) {
    return normalized.replace(summer, "Hè $1").replace(/(\d{4})-(\d{4})/, (_, y1, y2) => shortYear(`${y1}-${y2}`));
  }

  return normalized;
}

export function buildGpaTrendData(
  summaries: CumulativeGpaSummary[],
): GpaTrendPoint[] {
  return [...summaries]
    .sort((a, b) => a.termOrder - b.termOrder)
    .map((summary) => ({
      termName: summary.actualTermName,
      shortTermName: shortenTermName(summary.actualTermName),
      termOrder: summary.termOrder,
      termGpa4: summary.rawGpa4,
      termGpa10: summary.rawGpa10,
      cumulativeGpa4: summary.cumulativeGpa4,
      cumulativeGpa10: summary.cumulativeGpa10,
    }));
}

export function buildCreditTrendData(
  summaries: CumulativeGpaSummary[],
): CreditTrendPoint[] {
  return [...summaries]
    .sort((a, b) => a.termOrder - b.termOrder)
    .map((summary) => ({
      termName: summary.actualTermName,
      shortTermName: shortenTermName(summary.actualTermName),
      termOrder: summary.termOrder,
      gpaCredits: summary.gpaCredits,
      earnedCredits: summary.earnedCredits,
      cumulativeEarnedCredits: summary.cumulativeEarnedCredits,
    }));
}

export function buildGradeDistribution(
  enrollments: CourseEnrollment[],
): GradeDistributionItem[] {
  const graded = enrollments.filter(
    (enrollment) => enrollment.score10 !== null,
  );
  const groups = new Map<string, { count: number; credits: number }>();

  for (const enrollment of graded) {
    const letter = enrollment.letterGrade ?? "Khác";
    const existing = groups.get(letter) ?? { count: 0, credits: 0 };
    groups.set(letter, {
      count: existing.count + 1,
      credits: existing.credits + enrollment.credits,
    });
  }

  const total = graded.length;
  const sorted = Array.from(groups.entries())
    .map(([letterGrade, { count, credits }]) => ({
      letterGrade,
      count,
      credits,
      percent: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => {
      const order = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "Khác"];
      const aIdx = order.indexOf(a.letterGrade);
      const bIdx = order.indexOf(b.letterGrade);
      return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    });

  return sorted;
}
