"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { sampleTranscriptShort } from "@/lib/import-samples";
import { formatScore } from "@/lib/number-format";
import {
  aiTranscriptPrompt,
  parseTranscriptJson,
  sampleTranscriptJson,
  type TranscriptImportResult,
} from "@/lib/transcript-import";
import { splitTranscriptEnrollmentsByDuplicate } from "@/lib/transcript-import-dedupe";
import type { TranscriptImportDuplicateStrategy } from "@/lib/transcript-import-merge";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";
import type { GradeScaleItem } from "@/types/school";

type TranscriptImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeScale: GradeScaleItem[];
  programCourses: StudyProgramCourse[];
  existingEnrollments: CourseEnrollment[];
  onImportEnrollments: (
    incomingEnrollments: CourseEnrollment[],
    strategy: TranscriptImportDuplicateStrategy,
  ) => void;
};

const previewLimit = 12;

const duplicateStrategyOptions: Array<{
  value: TranscriptImportDuplicateStrategy;
  label: string;
  description: string;
}> = [
  {
    value: "skip",
    label: "Bỏ qua lượt học trùng",
    description: "Chỉ import lượt học mới. Các lượt đã tồn tại sẽ được bỏ qua.",
  },
  {
    value: "append",
    label: "Vẫn thêm tất cả",
    description: "Import cả lượt học trùng. Chỉ dùng khi bạn muốn tạo bản sao.",
  },
  {
    value: "replace",
    label: "Cập nhật lượt học trùng",
    description: "Nếu lượt học đã tồn tại, dùng dữ liệu mới để cập nhật.",
  },
];

function getMatchLabel(enrollment: CourseEnrollment): string {
  return enrollment.programCourseId ? "Khớp chương trình" : "Ngoài chương trình";
}

export function TranscriptImportDialog({
  open,
  onOpenChange,
  gradeScale,
  programCourses,
  existingEnrollments,
  onImportEnrollments,
}: TranscriptImportDialogProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [importResult, setImportResult] =
    useState<TranscriptImportResult | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] =
    useState<TranscriptImportDuplicateStrategy>("skip");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const validEnrollments = importResult?.enrollments ?? [];
  const errors = importResult && !importResult.success ? importResult.errors : [];
  const visibleErrors = errors.slice(0, 20);
  const hiddenErrorCount = Math.max(errors.length - visibleErrors.length, 0);
  const warnings = importResult?.warnings ?? [];
  const duplicateSplit = splitTranscriptEnrollmentsByDuplicate(
    validEnrollments,
    existingEnrollments,
  );
  const duplicateEnrollmentIds = new Set(
    duplicateSplit.duplicateEnrollments.map(({ incoming }) => incoming.id),
  );
  const previewEnrollments = validEnrollments.slice(0, previewLimit);
  const hiddenPreviewCount = Math.max(validEnrollments.length - previewLimit, 0);
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
    if (!nextOpen) resetDialog();
    onOpenChange(nextOpen);
  }

  function parseInput(): TranscriptImportResult {
    return parseTranscriptJson(jsonInput, { gradeScale, programCourses });
  }

  function handleValidate() {
    setCopyStatus(null);
    setImportResult(parseInput());
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
    const nextResult = importResult ?? parseInput();
    setImportResult(nextResult);
    if (nextResult.enrollments.length === 0) return;
    if (
      duplicateStrategy === "skip" &&
      splitTranscriptEnrollmentsByDuplicate(
        nextResult.enrollments,
        existingEnrollments,
      ).newEnrollments.length === 0
    ) return;
    onImportEnrollments(nextResult.enrollments, duplicateStrategy);
    resetDialog();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Import bảng điểm</DialogTitle>
          <DialogDescription>
            Dán JSON bảng điểm đã được AI chuẩn hóa. Dữ liệu này dùng để tính GPA.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          {/* Ô nhập JSON */}
          <div className="grid gap-2">
            <Label htmlFor="transcriptImportJson">Dữ liệu bảng điểm JSON</Label>
            <Textarea
              id="transcriptImportJson"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setImportResult(null);
                setCopyStatus(null);
              }}
              placeholder={sampleTranscriptShort}
              className="min-h-56 font-mono text-sm"
            />
          </div>

          {/* Xử lý trùng */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/40 dark:bg-sky-950/10">
            <Label htmlFor="transcriptDuplicateStrategy" className="text-sm font-medium">
              Cách xử lý dữ liệu trùng
            </Label>
            <Select
              value={duplicateStrategy}
              onValueChange={(v) => setDuplicateStrategy(v as TranscriptImportDuplicateStrategy)}
            >
              <SelectTrigger id="transcriptDuplicateStrategy" className="mt-1.5 w-full">
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
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">1</span>
                <span>Mở trang <strong className="text-foreground">bảng điểm cá nhân</strong> trên cổng thông tin đào tạo của trường.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">2</span>
                <span>Lấy dữ liệu bảng điểm:<br/>
                  • <strong className="text-foreground">Máy tính:</strong> Copy text (Ctrl+C) hoặc Ctrl+P → Lưu PDF<br/>
                  • <strong className="text-foreground">Điện thoại:</strong> Chụp ảnh màn hình hoặc dùng In → Lưu PDF</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">3</span>
                <span>Bấm nút <strong className="text-foreground">🤖 Copy prompt cho AI</strong> bên dưới.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">4</span>
                <span>Mở DeepSeek / ChatGPT / Gemini, <strong className="text-foreground">dán prompt</strong>, gửi kèm dữ liệu bảng điểm (text/ảnh/PDF).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">5</span>
                <span>AI trả về JSON — <strong className="text-foreground">copy</strong> toàn bộ, dán vào ô JSON bên trên.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[10px] font-bold text-sky-800 dark:bg-sky-800 dark:text-sky-200">6</span>
                <span>Bấm <strong className="text-foreground">Kiểm tra</strong> → <strong className="text-foreground">Import</strong>.</span>
              </div>
              <p className="mt-1 rounded bg-white/60 px-2 py-1 text-xs text-amber-700 dark:bg-slate-900/60 dark:text-amber-300">
                ⚠️ GradeFlow không tự đọc ảnh/PDF. Bạn tự dùng AI bên ngoài. Dữ liệu không gửi lên máy chủ.
              </p>
            </div>
          </details>

          {/* Thanh công cụ */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setJsonInput(sampleTranscriptJson); setImportResult(null); setCopyStatus(null); }}>
              📋 Dán JSON mẫu
            </Button>
            <Button size="sm" variant="secondary" onClick={() => copyText(sampleTranscriptJson, "Đã copy JSON mẫu.")}>
              Copy JSON mẫu
            </Button>
            <Button size="sm" variant="default" className="animate-shimmer bg-gradient-to-r from-sky-600 via-sky-400 to-sky-600 bg-[length:200%_100%] text-white hover:from-sky-700 hover:via-sky-500 hover:to-sky-700" onClick={() => copyText(aiTranscriptPrompt, "Đã copy prompt cho AI.")}>
              🤖 Copy prompt cho AI
            </Button>
            <Button size="sm" onClick={handleValidate}>
              ✅ Kiểm tra
            </Button>
          </div>

          {copyStatus && <p className="text-xs text-muted-foreground">{copyStatus}</p>}

          {/* Kết quả kiểm tra */}
          {importResult && (
            <div className="grid gap-3">
              {validEnrollments.length > 0 && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                  ✅ {validEnrollments.length} lượt học hợp lệ
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                    · {validEnrollments.filter(e => e.score10 !== null).length} có điểm
                    · {validEnrollments.filter(e => e.programCourseId).length} khớp CT
                    · {duplicateSplit.duplicateEnrollments.length} trùng
                  </span>
                </div>
              )}
              {errors.length > 0 && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                  <p className="font-medium">❌ Cần sửa:</p>
                  <ul className="mt-1 list-disc pl-4 text-xs">
                    {visibleErrors.map((err, i) => (
                      <li key={i}>{err.row ? `Dòng ${err.row}: ` : ""}{err.message}</li>
                    ))}
                    {hiddenErrorCount > 0 && <li>Và {hiddenErrorCount} lỗi khác...</li>}
                  </ul>
                </div>
              )}
              {warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                  ⚠️ {warnings.length} học phần không tìm thấy tương ứng trong chương trình, sẽ import như học phần ngoài chương trình.
                </div>
              )}
            </div>
          )}

          {previewEnrollments.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Preview trước khi import</h3>
              <div className="overflow-x-auto rounded-xl border bg-background">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-muted text-left text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Trạng thái</th>
                      <th className="px-4 py-3 font-medium">Kỳ thật</th>
                      <th className="px-4 py-3 font-medium">Mã</th>
                      <th className="px-4 py-3 font-medium">Tên học phần</th>
                      <th className="px-4 py-3 font-medium">Tín chỉ</th>
                      <th className="px-4 py-3 font-medium">Điểm 10</th>
                      <th className="px-4 py-3 font-medium">Điểm chữ</th>
                      <th className="px-4 py-3 font-medium">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewEnrollments.map((enrollment) => {
                      const isDuplicate = duplicateEnrollmentIds.has(
                        enrollment.id,
                      );

                      return (
                        <tr key={enrollment.id} className="border-t">
                          <td className="px-4 py-3">
                            <Badge variant={isDuplicate ? "outline" : "default"}>
                              {!isDuplicate
                                ? "Mới"
                                : duplicateStrategy === "skip"
                                  ? "Trùng"
                                  : duplicateStrategy === "replace"
                                    ? "Cập nhật"
                                    : "Thêm bản sao"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {enrollment.actualTermName}
                          </td>
                          <td className="px-4 py-3">{enrollment.code || "—"}</td>
                          <td className="px-4 py-3 font-medium">
                            {enrollment.name}
                          </td>
                          <td className="px-4 py-3">{enrollment.credits}</td>
                          <td className="px-4 py-3">
                            {formatScore(enrollment.score10)}
                          </td>
                          <td className="px-4 py-3">
                            {enrollment.letterGrade || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {getMatchLabel(enrollment)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hiddenPreviewCount > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Và {hiddenPreviewCount} lượt học khác...
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
            disabled={validEnrollments.length === 0}
            onClick={handleImport}
          >
            {duplicateStrategy === "append"
              ? "Import tất cả"
              : duplicateStrategy === "replace"
                ? "Import và cập nhật"
                : "Import bảng điểm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
