"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { splitProgramCoursesByDuplicate } from "@/lib/program-course-dedupe";
import {
  aiProgramCoursePrompt,
  knowledgeBlockLabels,
  parseProgramCoursesJson,
  requirementTypeLabels,
  sampleProgramCoursesJson,
  type ProgramCourseImportResult,
} from "@/lib/program-course-import";
import {
  mergeProgramCourseImport,
  type ImportDuplicateStrategy,
  type ProgramCourseImportSummary,
} from "@/lib/program-course-import-merge";
import type { StudyProgramCourse } from "@/types/academic";

type ProgramCourseImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCourses: StudyProgramCourse[];
  onImportCourses: (
    courses: StudyProgramCourse[],
    summary: ProgramCourseImportSummary,
  ) => void;
};

const previewLimit = 10;

const duplicateStrategyOptions: Array<{
  value: ImportDuplicateStrategy;
  label: string;
  description: string;
}> = [
  {
    value: "skip",
    label: "Bỏ qua học phần trùng",
    description:
      "Chỉ import học phần mới. Các học phần đã tồn tại sẽ được bỏ qua.",
  },
  {
    value: "append",
    label: "Vẫn thêm tất cả",
    description:
      "Import cả học phần trùng. Chỉ nên dùng nếu bạn thật sự muốn tạo bản sao.",
  },
  {
    value: "replace",
    label: "Cập nhật học phần trùng",
    description:
      "Nếu học phần đã tồn tại, dùng dữ liệu mới để cập nhật học phần cũ.",
  },
];

export function ProgramCourseImportDialog({
  open,
  onOpenChange,
  existingCourses = [],
  onImportCourses,
}: ProgramCourseImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [importResult, setImportResult] =
    useState<ProgramCourseImportResult | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<ImportDuplicateStrategy>("skip");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const validCourses = importResult?.courses ?? [];
  const errors = importResult && !importResult.success ? importResult.errors : [];
  const warnings = importResult?.warnings ?? [];
  const duplicateSplit = splitProgramCoursesByDuplicate(
    validCourses,
    existingCourses,
  );
  const duplicateCourseIds = new Set(
    duplicateSplit.duplicateCourses.map(({ incoming }) => incoming.id),
  );
  const previewCourses = validCourses.slice(0, previewLimit);
  const hiddenPreviewCount = Math.max(validCourses.length - previewLimit, 0);
  const selectedStrategy = duplicateStrategyOptions.find(
    (option) => option.value === duplicateStrategy,
  );

  function resetDialog() {
    setJsonInput("");
    setImportResult(null);
    setDuplicateStrategy("skip");
    setCopyStatus(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetDialog();
    }

    onOpenChange(nextOpen);
  }

  function handleValidate() {
    setCopyStatus(null);
    setImportResult(parseProgramCoursesJson(jsonInput));
  }

  async function copyText(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(successMessage);
    } catch {
      setCopyStatus("Không thể copy tự động. Bạn hãy copy thủ công nhé.");
    }
  }

  function handleImport() {
    const nextResult = importResult ?? parseProgramCoursesJson(jsonInput);

    setImportResult(nextResult);

    if (nextResult.courses.length === 0) {
      return;
    }

    const { updatedCourses, summary } = mergeProgramCourseImport(
      existingCourses,
      nextResult.courses,
      duplicateStrategy,
    );

    onImportCourses(updatedCourses, summary);
    resetDialog();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Import chương trình học</DialogTitle>
          <DialogDescription>
            Dán JSON danh sách học phần theo chương trình đào tạo. Kỳ học thật
            và điểm sẽ được cập nhật sau.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="programCourseImportJson">Dữ liệu JSON</Label>
            <Textarea
              id="programCourseImportJson"
              value={jsonInput}
              onChange={(event) => {
                setJsonInput(event.target.value);
                setImportResult(null);
                setCopyStatus(null);
              }}
              placeholder={sampleProgramCoursesJson}
              className="min-h-72 font-mono text-sm"
            />
          </div>

          <div className="grid gap-2 rounded-xl border bg-muted/30 p-4">
            <Label htmlFor="programCourseDuplicateStrategy">
              Cách xử lý dữ liệu trùng
            </Label>
            <Select
              value={duplicateStrategy}
              onValueChange={(value) =>
                setDuplicateStrategy(value as ImportDuplicateStrategy)
              }
            >
              <SelectTrigger
                id="programCourseDuplicateStrategy"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {duplicateStrategyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStrategy ? (
              <p className="text-sm text-muted-foreground">
                {selectedStrategy.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setJsonInput(sampleProgramCoursesJson);
                setImportResult(null);
                setCopyStatus(null);
              }}
            >
              Dán JSON mẫu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                copyText(sampleProgramCoursesJson, "Đã copy JSON mẫu.")
              }
            >
              Copy JSON mẫu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                copyText(aiProgramCoursePrompt, "Đã copy prompt cho AI.")
              }
            >
              Copy prompt cho AI
            </Button>
            <Button type="button" onClick={handleValidate}>
              Kiểm tra dữ liệu
            </Button>
          </div>

          {copyStatus ? (
            <p className="text-sm text-muted-foreground">{copyStatus}</p>
          ) : null}

          {importResult ? (
            <div className="grid gap-3">
              {validCourses.length > 0 ? (
                <div className="grid gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                  <p>
                    Tìm thấy {validCourses.length} học phần hợp lệ:{" "}
                    {duplicateSplit.newCourses.length} học phần mới,{" "}
                    {duplicateSplit.duplicateCourses.length} học phần trùng.
                  </p>
                  {duplicateStrategy === "skip" &&
                  duplicateSplit.duplicateCourses.length > 0 ? (
                    <p>
                      Khi import, các học phần trùng sẽ được bỏ qua theo lựa
                      chọn hiện tại.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {errors.length > 0 ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <p className="font-medium">Cần kiểm tra lại:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {warnings.length > 0 ? (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300">
                  <p className="font-medium">Cảnh báo:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {previewCourses.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Preview trước khi import</h3>
              <div className="overflow-x-auto rounded-xl border bg-background">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-muted text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium">Kỳ</th>
                      <th className="px-4 py-3 font-medium">Mã</th>
                      <th className="px-4 py-3 font-medium">Tên học phần</th>
                      <th className="px-4 py-3 font-medium">Tín chỉ</th>
                      <th className="px-4 py-3 font-medium">Khối kiến thức</th>
                      <th className="px-4 py-3 font-medium">Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewCourses.map((course) => (
                      <tr key={course.id} className="border-t">
                        <td className="px-4 py-3">
                          {duplicateCourseIds.has(course.id) ? (
                            <Badge variant="outline">Trùng</Badge>
                          ) : (
                            <Badge>Mới</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {course.plannedTermNumber
                            ? `Kỳ ${course.plannedTermNumber}`
                            : "Chưa gán"}
                        </td>
                        <td className="px-4 py-3">{course.code || "—"}</td>
                        <td className="px-4 py-3 font-medium">{course.name}</td>
                        <td className="px-4 py-3">{course.credits}</td>
                        <td className="px-4 py-3">
                          {knowledgeBlockLabels[course.knowledgeBlock]}
                        </td>
                        <td className="px-4 py-3">
                          {requirementTypeLabels[course.requirementType]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hiddenPreviewCount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Và {hiddenPreviewCount} học phần khác...
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={validCourses.length === 0 && importResult !== null}
            onClick={handleImport}
          >
            Import {validCourses.length} học phần
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
