export function getCurrentAcademicYear(date = new Date()): string {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth() + 1;
  const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;

  return `${startYear}-${startYear + 1}`;
}

export function getAcademicYearOptions(count = 10): string[] {
  const currentAcademicYear = getCurrentAcademicYear();
  const startYear = Number(currentAcademicYear.split("-")[0]);

  return Array.from({ length: count }, (_, index) => {
    const year = startYear - index;

    return `${year}-${year + 1}`;
  });
}
