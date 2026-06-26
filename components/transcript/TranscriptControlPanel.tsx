"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TranscriptViewFilter, TranscriptViewMode } from "@/lib/transcript-filters";

type FilterOption = {
  key: TranscriptViewFilter;
  label: string;
  count: number;
  highlight?: "warning" | "danger" | "info" | "none";
};

type TermOption = {
  id: string;
  name: string;
};

type TranscriptControlPanelProps = {
  totalEnrollments: number;
  pendingCount: number;
  failedCount: number;
  retakeCount: number;
  notCountedCount: number;
  gradedCount: number;

  selectedFilter: TranscriptViewFilter;
  onSelectedFilterChange: (filter: TranscriptViewFilter) => void;

  searchQuery: string;
  onSearchQueryChange: (value: string) => void;

  selectedTermId: string;
  onSelectedTermIdChange: (termId: string) => void;

  termOptions: TermOption[];

  viewMode: TranscriptViewMode;
  onViewModeChange: (mode: TranscriptViewMode) => void;

  showOldAttempts: boolean;
  onShowOldAttemptsChange: (value: boolean) => void;

  showPending: boolean;
  onShowPendingChange: (value: boolean) => void;

  onExpandAll: () => void;
  onCollapseAll: () => void;
};

const filterConfig: Record<
  TranscriptViewFilter,
  { activeClass: string; inactiveClass: string }
> = {
  all: {
    activeClass: "bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900/40 dark:border-sky-700 dark:text-sky-200",
    inactiveClass: "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
  },
  pending: {
    activeClass: "bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200",
    inactiveClass: "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
  },
  failed: {
    activeClass: "bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-900/40 dark:border-rose-700 dark:text-rose-200",
    inactiveClass: "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30",
  },
  retake: {
    activeClass: "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200",
    inactiveClass: "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30",
  },
  improvement: {
    activeClass: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200",
    inactiveClass: "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30",
  },
  not_counted: {
    activeClass: "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200",
    inactiveClass: "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30",
  },
  effective_only: {
    activeClass: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200",
    inactiveClass: "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
  },
};

export function TranscriptControlPanel({
  totalEnrollments,
  pendingCount,
  failedCount,
  retakeCount,
  notCountedCount,
  gradedCount,
  selectedFilter,
  onSelectedFilterChange,
  searchQuery,
  onSearchQueryChange,
  selectedTermId,
  onSelectedTermIdChange,
  termOptions,
  viewMode,
  onViewModeChange,
  showOldAttempts,
  onShowOldAttemptsChange,
  showPending,
  onShowPendingChange,
  onExpandAll,
  onCollapseAll,
}: TranscriptControlPanelProps) {
  const filterChips: FilterOption[] = [
    { key: "all", label: "Tất cả", count: totalEnrollments },
    { key: "pending", label: "Chờ điểm", count: pendingCount, highlight: pendingCount > 0 ? "warning" : "none" },
    { key: "failed", label: "Chưa đạt", count: failedCount, highlight: failedCount > 0 ? "danger" : "none" },
    { key: "retake", label: "Học lại", count: retakeCount, highlight: retakeCount > 0 ? "info" : "none" },
    { key: "improvement", label: "Cải thiện", count: retakeCount, highlight: retakeCount > 0 ? "info" : "none" },
    { key: "not_counted", label: "Không tính GPA", count: notCountedCount },
    { key: "effective_only", label: "Đang tính", count: gradedCount },
  ];

  return (
    <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/30 p-4 shadow-sm dark:border-sky-900/40 dark:from-background dark:to-sky-950/10">
      {/* Search */}
      <div className="mt-3">
        <Input
          placeholder="Tìm theo tên hoặc mã học phần..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      {/* Filter chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {filterChips.map((chip) => {
          const isActive = selectedFilter === chip.key;
          const cfg = filterConfig[chip.key];

          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onSelectedFilterChange(chip.key)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive ? cfg.activeClass : cfg.inactiveClass
              }`}
            >
              {chip.label}
              <span className="tabular-nums">({chip.count})</span>
            </button>
          );
        })}
      </div>

      {/* Second row: term jump + view options */}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        {/* Term select */}
        <div className="min-w-[200px] flex-1">
          <Label className="text-xs text-muted-foreground">
            Đi tới học kỳ
          </Label>
          <Select
            value={selectedTermId}
            onValueChange={onSelectedTermIdChange}
          >
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả học kỳ</SelectItem>
              {termOptions.map((term) => (
                <SelectItem key={term.id} value={term.id}>
                  {term.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View mode */}
        <div className="min-w-[120px]">
          <Label className="text-xs text-muted-foreground">
            Chế độ xem
          </Label>
          <Select
            value={viewMode}
            onValueChange={(val) =>
              onViewModeChange(val as TranscriptViewMode)
            }
          >
            <SelectTrigger className="mt-1 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">Đầy đủ</SelectItem>
              <SelectItem value="compact">Gọn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showOldAttempts}
              onChange={(e) => onShowOldAttemptsChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Hiện lượt cũ
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={showPending}
              onChange={(e) => onShowPendingChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Hiện môn chờ điểm
          </label>
        </div>

        {/* Expand/collapse */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onExpandAll}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-muted-foreground hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Mở rộng
          </button>
          <button
            type="button"
            onClick={onCollapseAll}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs text-muted-foreground hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Thu gọn
          </button>
        </div>
      </div>

    </div>
  );
}
