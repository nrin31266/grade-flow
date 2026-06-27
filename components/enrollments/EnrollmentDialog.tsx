"use client";

import { FormEvent, useMemo, useState } from "react";

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
import { getAcademicYearOptions, getCurrentAcademicYear } from "@/lib/academic-year";
import { getEnrollmentCourseIdentity } from "@/lib/enrollment-identity";
import { getGradeScaleResult, normalizeScore10Input } from "@/lib/grade-scale";
import {
  buildActualTermId,
  buildActualTermName,
  termOptions,
} from "@/lib/semester";
import type {
  CourseEnrollment,
  CourseStatus,
  StudyProgramCourse,
  TermCode,
} from "@/types/academic";
import type { RetakeSettings } from "@/types/profile";
import type { GradeScaleItem } from "@/types/school";

type EnrollmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programCourses: StudyProgramCourse[];
  selectedProgramCourse?: StudyProgramCourse | null;
  defaultAcademicYear?: string;
  defaultTermCode?: TermCode;
  existingEnrollments: CourseEnrollment[];
  retakeSettings: RetakeSettings;
  gradeScale: GradeScaleItem[];
  onSaveEnrollment: (enrollment: CourseEnrollment) => void;
};

type FormErrors = {
  name?: string;
  credits?: string;
  score10?: string;
};

const outsideProgramValue = "__outside_program__";

function getEnrollmentStatus(score10: number | null): CourseStatus {
  if (score10 === null) {
    return "pending";
  }

  return score10 < 4 ? "failed" : "completed";
}

function getCourseSelectValue(
  selectedProgramCourse?: StudyProgramCourse | null,
): string {
  return selectedProgramCourse?.id ?? outsideProgramValue;
}

function CourseSummary({ course }: { course: StudyProgramCourse }) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4 text-sm">
      <p className="font-medium text-foreground">{course.name}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
        {course.code ? <span>Mã: {course.code}</span> : null}
        <span>{course.credits} tín chỉ</span>
        <span>
          {course.plannedTermNumber
            ? `Kỳ kế hoạch ${course.plannedTermNumber}`
            : "Chưa gán kỳ kế hoạch"}
        </span>
      </div>
    </div>
  );
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  programCourses,
  selectedProgramCourse,
  defaultAcademicYear,
  defaultTermCode,
  existingEnrollments,
  retakeSettings,
  gradeScale,
  onSaveEnrollment,
}: EnrollmentDialogProps) {
  const academicYearOptions = useMemo(() => getAcademicYearOptions(10), []);
  const [selectedCourseId, setSelectedCourseId] = useState(
    getCourseSelectValue(selectedProgramCourse),
  );
  const [selectedCourse, setSelectedCourse] =
    useState<StudyProgramCourse | null>(selectedProgramCourse ?? null);
  const [outsideName, setOutsideName] = useState("");
  const [outsideCode, setOutsideCode] = useState("");
  const [outsideCredits, setOutsideCredits] = useState("");
  const [academicYear, setAcademicYear] = useState(
    defaultAcademicYear ?? getCurrentAcademicYear(),
  );
  const [termCode, setTermCode] = useState<TermCode>(
    defaultTermCode ?? "semester_1",
  );
  const [score10, setScore10] = useState("");
  const [countsForGpa, setCountsForGpa] = useState(true);
  const [countsForGraduation, setCountsForGraduation] = useState(true);
  const [isRetake, setIsRetake] = useState(
    selectedProgramCourse
      ? existingEnrollments.some(
          (enrollment) => enrollment.programCourseId === selectedProgramCourse.id,
        )
      : false,
  );
  const [note, setNote] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const parsedScore10 =
    score10.trim() === "" ? null : normalizeScore10Input(score10);
  const gradeScaleResult = getGradeScaleResult(parsedScore10, gradeScale);
  const isOutsideProgram = selectedCourseId === outsideProgramValue;
  const detectedExistingAttemptCount = selectedCourse
    ? existingEnrollments.filter(
        (enrollment) => enrollment.programCourseId === selectedCourse.id,
      ).length
    : 0;
  const detectedPreviousEnrollments = selectedCourse
    ? existingEnrollments.filter(
        (enrollment) => enrollment.programCourseId === selectedCourse.id,
      )
    : [];
  function isRetakeCandidate(enrollment: CourseEnrollment): boolean {
    if (enrollment.score10 === null) {
      return false;
    }

    if (retakeSettings.retakeTriggerMode === "manual") {
      return enrollment.isRetake;
    }

    if (retakeSettings.retakeTriggerMode === "below_score") {
      return enrollment.score10 < retakeSettings.retakeScoreThreshold;
    }

    return (
      enrollment.status === "failed" ||
      enrollment.score10 < retakeSettings.retakeScoreThreshold
    );
  }

  const hasFailedPreviousEnrollment = detectedPreviousEnrollments.some(
    (enrollment) => isRetakeCandidate(enrollment),
  );
  const hasPassedPreviousEnrollment = detectedPreviousEnrollments.some(
    (enrollment) =>
      enrollment.score10 !== null &&
      enrollment.score10 >= retakeSettings.retakeScoreThreshold &&
      enrollment.status !== "failed",
  );
  const detectedAttemptMessage =
    detectedExistingAttemptCount === 0
      ? null
      : hasFailedPreviousEnrollment
        ? "GradeFlow phát hiện đây là lượt học lại."
        : hasPassedPreviousEnrollment && retakeSettings.improvementEnabled
          ? "GradeFlow phát hiện đây là lượt học cải thiện."
          : "Môn này đã có lượt học trước. Cấu hình hiện tại không bật cải thiện, lượt này có thể không được tính tùy chính sách.";

  function resetForm() {
    setSelectedCourseId(getCourseSelectValue(selectedProgramCourse));
    setSelectedCourse(selectedProgramCourse ?? null);
    setOutsideName("");
    setOutsideCode("");
    setOutsideCredits("");
    setAcademicYear(defaultAcademicYear ?? getCurrentAcademicYear());
    setTermCode(defaultTermCode ?? "semester_1");
    setScore10("");
    setCountsForGpa(true);
    setCountsForGraduation(true);
    setIsRetake(
      selectedProgramCourse
        ? existingEnrollments.some(
            (enrollment) =>
              enrollment.programCourseId === selectedProgramCourse.id,
          )
        : false,
    );
    setNote("");
    setFormErrors({});
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleSelectCourse(courseId: string) {
    setSelectedCourseId(courseId);

    if (courseId === outsideProgramValue) {
      setSelectedCourse(null);
      return;
    }

    const nextSelectedCourse =
      programCourses.find((course) => course.id === courseId) ?? null;

    setSelectedCourse(nextSelectedCourse);
    setIsRetake(
      nextSelectedCourse
        ? existingEnrollments.some(
            (enrollment) =>
              enrollment.programCourseId === nextSelectedCourse.id,
          )
        : false,
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedOutsideName = outsideName.trim();
    const trimmedOutsideCode = outsideCode.trim();
    const parsedOutsideCredits = Number(outsideCredits);
    const nextErrors: FormErrors = {};

    if (!selectedCourse && !trimmedOutsideName) {
      nextErrors.name = "Vui lòng nhập tên học phần.";
    }

    if (
      !selectedCourse &&
      (!Number.isFinite(parsedOutsideCredits) || parsedOutsideCredits <= 0)
    ) {
      nextErrors.credits = "Số tín chỉ phải lớn hơn 0.";
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

    const currentTime = new Date().toISOString();
    const finalScore10 = parsedScore10;
    const draftEnrollment: CourseEnrollment = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      programCourseId: selectedCourse?.id,
      code: selectedCourse?.code ?? (trimmedOutsideCode || undefined),
      name: selectedCourse?.name ?? trimmedOutsideName,
      credits: selectedCourse?.credits ?? parsedOutsideCredits,
      actualTermId: buildActualTermId(academicYear, termCode),
      actualTermName: buildActualTermName(academicYear, termCode),
      academicYear,
      termCode,
      plannedTermNumber: selectedCourse?.plannedTermNumber,
      score10: finalScore10,
      letterGrade: gradeScaleResult.letterGrade,
      gpa4: gradeScaleResult.gpa4,
      status: getEnrollmentStatus(finalScore10),
      countsForGpa,
      countsForGraduation,
      isRetake,
      tags: [],
      note: note.trim() || undefined,
      createdAt: currentTime,
      updatedAt: currentTime,
    };
    const draftIdentity = getEnrollmentCourseIdentity(draftEnrollment);
    const existingAttemptCount = existingEnrollments.filter(
      (enrollment) => getEnrollmentCourseIdentity(enrollment) === draftIdentity,
    ).length;
    const enrollment: CourseEnrollment = {
      ...draftEnrollment,
      isRetake: existingAttemptCount > 0 ? true : isRetake,
      attemptNumber: existingAttemptCount + 1,
    };

    onSaveEnrollment(enrollment);
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedProgramCourse ? "Gán điểm học phần" : "Thêm lượt học thật"}
          </DialogTitle>
          <DialogDescription>
            Cập nhật học kỳ thật và điểm hệ 10. Điểm chữ và hệ 4 sẽ được tự quy
            đổi theo thang điểm đang dùng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4">
            {selectedProgramCourse ? (
              <CourseSummary course={selectedProgramCourse} />
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="enrollmentProgramCourse">Học phần</Label>
                <Select
                  value={selectedCourseId}
                  onValueChange={handleSelectCourse}
                >
                  <SelectTrigger id="enrollmentProgramCourse" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}, {course.credits} tín chỉ, {" "}
                        {course.plannedTermNumber
                          ? `Kỳ kế hoạch ${course.plannedTermNumber}`
                          : "Chưa gán kỳ"}
                      </SelectItem>
                    ))}
                    <SelectItem value={outsideProgramValue}>
                      Học phần ngoài chương trình
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!selectedProgramCourse && selectedCourse ? (
              <CourseSummary course={selectedCourse} />
            ) : null}

            {isOutsideProgram ? (
              <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="outsideEnrollmentName">Tên học phần</Label>
                  <Input
                    id="outsideEnrollmentName"
                    value={outsideName}
                    onChange={(event) => setOutsideName(event.target.value)}
                  />
                  {formErrors.name ? (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="outsideEnrollmentCode">Mã học phần</Label>
                  <Input
                    id="outsideEnrollmentCode"
                    value={outsideCode}
                    onChange={(event) => setOutsideCode(event.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="outsideEnrollmentCredits">Số tín chỉ</Label>
                  <Input
                    id="outsideEnrollmentCredits"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={outsideCredits}
                    onChange={(event) => setOutsideCredits(event.target.value)}
                  />
                  {formErrors.credits ? (
                    <p className="text-sm text-destructive">
                      {formErrors.credits}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="enrollmentAcademicYear">Năm học thật</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger id="enrollmentAcademicYear" className="w-full">
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="enrollmentTermCode">Học kỳ thật</Label>
                <Select
                  value={termCode}
                  onValueChange={(value) => setTermCode(value as TermCode)}
                >
                  <SelectTrigger id="enrollmentTermCode" className="w-full">
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
                <Label htmlFor="enrollmentScore10">Điểm hệ 10</Label>
                <Input
                  id="enrollmentScore10"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  value={score10}
                  onChange={(event) => setScore10(event.target.value)}
                  placeholder="Để trống nếu chưa có điểm"
                  className="font-medium"
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
                  , hệ 4:{" "}
                  <span className="font-medium text-foreground">
                    {gradeScaleResult.gpa4}
                  </span>
                </p>
              ) : (
                <p>Chưa quy đổi được điểm này.</p>
              )}
            </div>

            {detectedAttemptMessage ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                {detectedAttemptMessage} GradeFlow đã ghi nhận{" "}
                {detectedExistingAttemptCount} lượt học trước.
              </div>
            ) : null}

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
                  Học lại/cải thiện
                </label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="enrollmentNote">Ghi chú</Label>
                <Textarea
                  id="enrollmentNote"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu lượt học</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
