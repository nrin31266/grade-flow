export function formatGpa(value: number | null): string {
  return value === null ? "—" : value.toFixed(2);
}

export function formatCredits(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      });
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "Chưa có điểm";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString("vi-VN", {
        maximumFractionDigits: 2,
      });
}
