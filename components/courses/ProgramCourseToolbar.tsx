import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  knowledgeBlockLabels,
  requirementTypeLabels,
} from "@/lib/program-course-labels";
import type { ProgramCourseFilters } from "@/lib/program-course-view";
import type { CourseRequirementType, KnowledgeBlock } from "@/types/academic";

type ProgramCourseToolbarProps = {
  filters: ProgramCourseFilters;
  onFiltersChange: (filters: ProgramCourseFilters) => void;
  availableTerms: number[];
  totalCount: number;
  filteredCount: number;
  totalCredits: number;
  filteredCredits: number;
  onResetFilters: () => void;
};

const knowledgeBlockOptions: Array<{
  value: "all" | KnowledgeBlock;
  label: string;
}> = [
  { value: "all", label: "Tất cả khối" },
  ...Object.entries(knowledgeBlockLabels).map(([value, label]) => ({
    value: value as KnowledgeBlock,
    label,
  })),
];

const requirementTypeOptions: Array<{
  value: "all" | CourseRequirementType;
  label: string;
}> = [
  { value: "all", label: "Tất cả loại" },
  ...Object.entries(requirementTypeLabels).map(([value, label]) => ({
    value: value as CourseRequirementType,
    label,
  })),
];

export function ProgramCourseToolbar({
  filters,
  onFiltersChange,
  availableTerms,
  totalCount,
  filteredCount,
  totalCredits,
  filteredCredits,
  onResetFilters,
}: ProgramCourseToolbarProps) {
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.plannedTerm !== "all" ||
    filters.knowledgeBlock !== "all" ||
    filters.requirementType !== "all";
  const activeFilterBadges = [
    filters.search.trim()
      ? `Từ khóa: ${filters.search.trim()}`
      : null,
    filters.plannedTerm !== "all"
      ? `Kỳ: ${
          filters.plannedTerm === "unassigned"
            ? "Chưa gán kỳ"
            : `Kỳ ${filters.plannedTerm}`
        }`
      : null,
    filters.knowledgeBlock !== "all"
      ? `Khối: ${knowledgeBlockLabels[filters.knowledgeBlock as KnowledgeBlock]}`
      : null,
    filters.requirementType !== "all"
      ? `Loại: ${
          requirementTypeLabels[filters.requirementType as CourseRequirementType]
        }`
      : null,
  ].filter((badge): badge is string => Boolean(badge));

  function updateFilters(nextFilters: Partial<ProgramCourseFilters>) {
    onFiltersChange({
      ...filters,
      ...nextFilters,
    });
  }

  return (
    <div className="grid gap-3 rounded-lg border bg-background px-4 py-3 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(180px,1fr))_auto] lg:items-end">
        <div className="grid gap-2">
          <Label htmlFor="programCourseSearch">Tìm kiếm</Label>
          <Input
            id="programCourseSearch"
            value={filters.search}
            onChange={(event) => updateFilters({ search: event.target.value })}
            placeholder="Tìm theo tên hoặc mã học phần..."
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="programCourseTermFilter">Kỳ kế hoạch</Label>
          <Select
            value={filters.plannedTerm}
            onValueChange={(value) => updateFilters({ plannedTerm: value })}
          >
            <SelectTrigger id="programCourseTermFilter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kỳ</SelectItem>
              {availableTerms.map((term) => (
                <SelectItem key={term} value={String(term)}>
                  Kỳ {term}
                </SelectItem>
              ))}
              <SelectItem value="unassigned">Chưa gán kỳ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="programCourseBlockFilter">Khối kiến thức</Label>
          <Select
            value={filters.knowledgeBlock}
            onValueChange={(value) => updateFilters({ knowledgeBlock: value })}
          >
            <SelectTrigger id="programCourseBlockFilter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {knowledgeBlockOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="programCourseTypeFilter">Loại học phần</Label>
          <Select
            value={filters.requirementType}
            onValueChange={(value) => updateFilters({ requirementType: value })}
          >
            <SelectTrigger id="programCourseTypeFilter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {requirementTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant={hasActiveFilters ? "default" : "outline"}
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
        >
          Xóa bộ lọc
        </Button>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Đang áp dụng bộ lọc</span>
          {activeFilterBadges.map((badge) => (
            <Badge key={badge} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {filteredCount} đang hiển thị / {totalCount} học phần, {" "}
        {filteredCredits} tín chỉ trong khung
        {filteredCredits !== totalCredits
          ? ` / ${totalCredits} tín chỉ toàn bộ khung`
          : ""}
      </p>
    </div>
  );
}
