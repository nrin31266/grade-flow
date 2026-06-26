"use client";

import Link from "next/link";

import type { AcademicActionItem } from "@/lib/academic-actions";
import { Button } from "@/components/ui/button";

const typeConfig = {
  warning:
    "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20",
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20",
  success:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20",
};

const dotConfig = {
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  success: "bg-emerald-500",
};

type AcademicActionListProps = {
  items: AcademicActionItem[];
  onOpenGoalSettings?: () => void;
};

export function AcademicActionList({
  items,
  onOpenGoalSettings,
}: AcademicActionListProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Gợi ý tiếp theo</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Các việc cần làm dựa trên dữ liệu hiện tại.
      </p>

      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${typeConfig[item.type]}`}
          >
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotConfig[item.type]}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.description}
              </p>
            </div>
            {item.actionHref ? (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={item.actionHref}>{item.actionLabel}</Link>
              </Button>
            ) : item.actionLabel && onOpenGoalSettings ? (
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={onOpenGoalSettings}
              >
                {item.actionLabel}
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
