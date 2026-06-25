"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getAcademicYearOptions } from "@/lib/academic-year";
import { getGradeScaleResult, normalizeScore10Input } from "@/lib/grade-scale";
import {
  buildActualTermId,
  buildActualTermName,
  termOptions,
} from "@/lib/semester";
import type { CourseEnrollment, CourseStatus, TermCode } from "@/types/academic";
import type { GradeScaleItem } from "@/types/school";

type EditEnrollmentDialogProps = {
  enrollment: CourseEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gradeScale: GradeScaleItem[];
  onSaveEnrollment: (enrollment: CourseEnrollment) => void;
};

type FormErrors = {
  academicYear?: string;
  score10?: string;
};

function getEnrollmentStatus(score10: number | null): CourseStatus {
  if (score10 === null) {
    return "pending";
  }

  return score10 < 4 ? "failed" : "completed";
}

export function EditEnrollmentDialog({
  enrollment,
  open,
  onOpenChange,
  gradeScale,
  onSaveEnrollment,
}: EditEnrollmentDialogProps) {
  const academicYearOptions = getAcademicYearOptions(10);
  const [academicYear, setAcademicYear] = useState(
    enrollment?.academicYear ?? academicYearOptions[0],
  );
  const [termCode, setTermCode] = useState<TermCode>(
    enrollment?.termCode ?? "semester_1",
  );
  const [score10, setScore10] = useState(
    enrollment?.score10 === null || enrollment?.score10 === undefined
      ? ""
      : String(enrollment.score10),
  );
  const [countsForGpa, setCountsForGpa] = useState(
    enrollment?.countsForGpa ?? true,
  );
  const [countsForGraduation, setCountsForGraduation] = useState(
    enrollment?.countsForGraduation ?? true,
  );
  const [isRetake, setIsRetake] = useState(enrollment?.isRetake ?? false);
  const [note, setNote] = useState(enrollment?.note ?? "");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const parsedScore10 =
    score10.trim() === "" ? null : normalizeScore10Input(score10);
  const gradeScaleResult = getGradeScaleResult(parsedScore10, gradeScale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!enrollment) {
      return;
    }

    const trimmedAcademicYear = academicYear.trim();
    const nextErrors: FormErrors = {};

    if (!trimmedAcademicYear) {
      nextErrors.academicYear = "Vui lòng chọn năm học thật.";
    }

    if (score10.trim() !== "" && parsedScore10 === null) {
      nextErrors.score10 = "Điểm hệ 10 phải là số hợp lệ.";
    } else if (
      parsedScore10 !== null &&
      (parsedScore10 < 0 || parsedScore10 > 10)
    ) {
      nextErrors.score10 = "Điểm hệ 10 phải nằm trong khoảng 0 đến 10.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSaveEnrollment({
      ...enrollment,
      actualTermId: buildActualTermId(trimmedAcademicYear, termCode),
      actualTermName: buildActualTermName(trimmedAcademicYear, termCode),
      academicYear: trimmedAcademicYear,
      termCode,
      score10: parsedScore10,
      letterGrade: gradeScaleResult.letterGrade,
      gpa4: gradeScaleResult.gpa4,
      status: getEnrollmentStatus(parsedScore10),
      countsForGpa,
      countsForGraduation,
      isRetake,
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa lượt học</DialogTitle>
          <DialogDescription>
            Cập nhật học kỳ thật và điểm hệ 10. Điểm chữ và hệ 4 sẽ được tự quy
            đổi lại.
          </DialogDescription>
        </DialogHeader>

        {enrollment ? (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="rounded-xl border bg-muted/30 p-4 text-sm">
              <p className="font-medium text-foreground">{enrollment.name}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                {enrollment.code ? <span>Mã: {enrollment.code}</span> : null}
                <span>{enrollment.credits} tín chỉ</span>
                <span>
                  {enrollment.plannedTermNumber
                    ? `Kỳ kế hoạch ${enrollment.plannedTermNumber}`
                    : "Chưa gán kỳ kế hoạch"}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="editEnrollmentAcademicYear">Năm học thật</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger
                    id="editEnrollmentAcademicYear"
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYearOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.academicYear ? (
                  <p className="text-sm text-destructive">
                    {formErrors.academicYear}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editEnrollmentTermCode">Học kỳ thật</Label>
                <Select
                  value={termCode}
                  onValueChange={(value) => setTermCode(value as TermCode)}
                >
                  <SelectTrigger id="editEnrollmentTermCode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {termOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editEnrollmentScore10">Điểm hệ 10</Label>
                <Input
                  id="editEnrollmentScore10"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={score10}
                  onChange={(event) => setScore10(event.target.value)}
                />
                {formErrors.score10 ? (
                  <p className="text-sm text-destructive">
                    {formErrors.score10}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              {score10.trim() === "" ? (
                <p>Chưa có điểm, lượt học sẽ ở trạng thái chờ.</p>
              ) : gradeScaleResult.letterGrade && gradeScaleResult.gpa4 !== null ? (
                <p>
                  Quy đổi:{" "}
                  <span className="font-medium text-foreground">
                    {gradeScaleResult.letterGrade}
                  </span>{" "}
                  · hệ 4:{" "}
                  <span className="font-medium text-foreground">
                    {gradeScaleResult.gpa4}
                  </span>
                </p>
              ) : (
                <p>Chưa quy đổi được điểm này.</p>
              )}
            </div>

            <div className="grid gap-4 rounded-xl border bg-background p-4">
              <p className="text-sm font-medium">Tùy chọn nâng cao</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={countsForGpa}
                    onChange={(event) => setCountsForGpa(event.target.checked)}
                  />
                  Tính vào GPA
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={countsForGraduation}
                    onChange={(event) =>
                      setCountsForGraduation(event.target.checked)
                    }
                  />
                  Tính vào tín chỉ tốt nghiệp
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={isRetake}
                    onChange={(event) => setIsRetake(event.target.checked)}
                  />
                  Học lại / cải thiện
                </label>
              </div>

              {enrollment.attemptNumber ? (
                <p className="text-xs text-muted-foreground">
                  Lần học được GradeFlow ghi nhận: {enrollment.attemptNumber}
                </p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="editEnrollmentNote">Ghi chú</Label>
                <Textarea
                  id="editEnrollmentNote"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu thay đổi</Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
