import type { TermCode } from "@/types/academic";

export const termOptions: { value: TermCode; label: string }[] = [
  { value: "semester_1", label: "Học kỳ 1" },
  { value: "semester_2", label: "Học kỳ 2" },
  { value: "summer", label: "Học kỳ hè" },
  { value: "custom", label: "Học kỳ riêng" },
];

export function buildActualTermName(
  academicYear: string,
  termCode: TermCode
): string {
  const selectedTerm = termOptions.find((term) => term.value === termCode);
  const termLabel = selectedTerm?.label ?? "Học kỳ riêng";

  return `${termLabel} - ${academicYear}`;
}

export function buildActualTermId(
  academicYear: string,
  termCode: TermCode
): string {
  return `${academicYear}_${termCode}`;
}

export function parseAcademicYearOrder(academicYear: string): number {
  const startYear = Number(academicYear.split("-")[0]);

  return Number.isFinite(startYear) ? startYear : 0;
}

export function buildActualTermOrder(
  academicYear: string,
  termCode: TermCode
): number {
  const termOrder: Record<TermCode, number> = {
    semester_1: 1,
    semester_2: 2,
    summer: 3,
    custom: 4,
  };

  return parseAcademicYearOrder(academicYear) * 10 + termOrder[termCode];
}

export const buildSemesterName = buildActualTermName;
export const buildSemesterId = buildActualTermId;