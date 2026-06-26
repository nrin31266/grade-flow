"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { sampleProgramCoursesShort } from "@/lib/import-samples";
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
    if (nextResult.courses.length === 0) return;
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
            Dán JSON danh sách học phần theo chương trình đào tạo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Ô nhập JSON */}
          <div className="grid gap-2">
            <Label htmlFor="programCourseImportJson">Dữ liệu JSON</Label>
            <Textarea
              id="programCourseImportJson"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setImportResult(null);
                setCopyStatus(null);
              }}
              placeholder={sampleProgramCoursesShort}
              className="min-h-56 font-mono text-sm"
            />
          </div>

          {/* Xử lý trùng */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/40 dark:bg-sky-950/10">
            <Label htmlFor="programCourseDuplicateStrategy" className="text-sm font-medium">
              Cách xử lý dữ liệu trùng
            </Label>
            <Select
              value={duplicateStrategy}
              onValueChange={(v) => setDuplicateStrategy(v as ImportDuplicateStrategy)}
            >
              <SelectTrigger id="programCourseDuplicateStrategy" className="mt-1.5 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {duplicateStrategyOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedStrategy && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {selectedStrategy.description}
              </p>
            )}
          </div>

          {/* Hướng dẫn tạo JSON bằng AI */}
          <details open className="group rounded-lg border border-dashed border-sky-200 bg-sky-50/30 px-4 py-2 dark:border-sky-800 dark:bg-sky-950/10">
            <summary className="cursor-pointer text-xs font-medium text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200">
              🤖 Hướng dẫn tạo JSON bằng AI (DeepSeek / ChatGPT / Gemini)
            </summary>
            <ol className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">1</span>
                <span>Bấm nút <strong className="text-foreground">🤖 Copy prompt cho AI</strong> bên dưới để copy hướng dẫn.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">2</span>
                <span>Mở DeepSeek / ChatGPT / Gemini và <strong className="text-foreground">dán prompt</strong> vào.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">3</span>
                <span>Copy nội dung <strong className="text-foreground">chương trình đào tạo</strong> từ cổng thông tin / ảnh chụp / PDF và gửi cho AI.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">4</span>
                <span>AI trả về JSON — bấm <strong className="text-foreground">Copy</strong>, quay lại đây và <strong className="text-foreground">dán vào ô JSON</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">5</span>
                <span>Bấm <strong className="text-foreground">Kiểm tra</strong> để xác nhận dữ liệu hợp lệ, rồi <strong className="text-foreground">Import</strong>.</span>
              </li>
            </ol>
          </details>

          {/* Thanh công cụ */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setJsonInput(sampleProgramCoursesJson); setImportResult(null); setCopyStatus(null); }}>
              📋 Dán JSON mẫu
            </Button>
            <Button size="sm" variant="secondary" onClick={() => copyText(sampleProgramCoursesJson, "Đã copy JSON mẫu.")}>
              Copy JSON mẫu
            </Button>
            <Button size="sm" variant="default" className="bg-sky-600 hover:bg-sky-700" onClick={() => copyText(aiProgramCoursePrompt, "Đã copy prompt cho AI.")}>
              🤖 Copy prompt cho AI
            </Button>
            <Button size="sm" onClick={handleValidate}>
              ✅ Kiểm tra
            </Button>
          </div>

          {copyStatus && (
            <p className="text-xs text-muted-foreground">{copyStatus}</p>
          )}

          {/* Kết quả kiểm tra */}
          {importResult && (
            <div className="grid gap-3">
              {validCourses.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                  ✅ {validCourses.length} học phần hợp lệ: {duplicateSplit.newCourses.length} mới · {duplicateSplit.duplicateCourses.length} trùng
                </div>
              )}
              {errors.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="font-medium">❌ Cần sửa:</p>
                  <ul className="mt-1 list-disc pl-4 text-xs">
                    {errors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                  <p className="font-medium">⚠️ Cảnh báo:</p>
                  <ul className="mt-1 list-disc pl-4 text-xs">
                    {warnings.map((w) => <li key={w}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewCourses.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-medium">Xem trước</h3>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-sky-50 text-left text-muted-foreground dark:bg-sky-950/20">
                    <tr>
                      <th className="px-3 py-2 font-medium">Trạng thái</th>
                      <th className="px-3 py-2 font-medium">Kỳ</th>
                      <th className="px-3 py-2 font-medium">Mã</th>
                      <th className="px-3 py-2 font-medium">Tên</th>
                      <th className="px-3 py-2 font-medium">TC</th>
                      <th className="px-3 py-2 font-medium">Khối</th>
                      <th className="px-3 py-2 font-medium">Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewCourses.map((course) => (
                      <tr key={course.id} className="border-t">
                        <td className="px-3 py-2">
                          {duplicateCourseIds.has(course.id) ? (
                            <span className="text-xs font-semibold text-amber-600">Trùng</span>
                          ) : (
                            <span className="text-xs font-semibold text-emerald-600">Mới</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {course.plannedTermNumber
                            ? `Kỳ ${course.plannedTermNumber}`
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{course.code || "—"}</td>
                        <td className="px-3 py-2 font-medium">{course.name}</td>
                        <td className="px-3 py-2">{course.credits}</td>
                        <td className="px-3 py-2">
                          {knowledgeBlockLabels[course.knowledgeBlock]}
                        </td>
                        <td className="px-3 py-2">
                          {requirementTypeLabels[course.requirementType]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {hiddenPreviewCount > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Và {hiddenPreviewCount} học phần khác...
                </p>
              )}
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
