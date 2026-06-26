export type GpaClassificationResult = {
  label: string;
  tone: "excellent" | "good" | "fair" | "average" | "warning" | "empty";
  className: string;
};

const classificationMap: Array<{
  min: number;
  label: string;
  tone: GpaClassificationResult["tone"];
}> = [
  { min: 3.6, label: "Xuất sắc", tone: "excellent" },
  { min: 3.2, label: "Giỏi", tone: "good" },
  { min: 2.5, label: "Khá", tone: "fair" },
  { min: 2.0, label: "Trung bình", tone: "average" },
];

const toneStyles: Record<GpaClassificationResult["tone"], string> = {
  excellent:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  good:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
  fair:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300",
  average:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
  warning:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300",
  empty:
    "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

export function getGpa4Classification(
  gpa4: number | null,
): GpaClassificationResult {
  if (gpa4 === null) {
    return {
      label: "Chưa có dữ liệu",
      tone: "empty",
      className: toneStyles.empty,
    };
  }

  for (const entry of classificationMap) {
    if (gpa4 >= entry.min) {
      return {
        label: entry.label,
        tone: entry.tone,
        className: toneStyles[entry.tone],
      };
    }
  }

  return {
    label: "Cần chú ý",
    tone: "warning",
    className: toneStyles.warning,
  };
}
