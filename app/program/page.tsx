"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EditProgramCourseDialog } from "@/components/courses/EditProgramCourseDialog";
import { ProgramCourseDialog } from "@/components/courses/ProgramCourseDialog";
import { ProgramCourseImportDialog } from "@/components/courses/ProgramCourseImportDialog";
import { ProgramCourseList } from "@/components/courses/ProgramCourseList";
import { ProgramCourseStats } from "@/components/courses/ProgramCourseStats";
import { ProgramCourseToolbar } from "@/components/courses/ProgramCourseToolbar";
import { EnrollmentDialog } from "@/components/enrollments/EnrollmentDialog";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AcademicRulesDialog } from "@/components/settings/AcademicRulesDialog";
import { ResetWorkspaceDialog } from "@/components/settings/ResetWorkspaceDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveEffectiveEnrollments } from "@/lib/effective-enrollments";
import type { ProgramCourseImportSummary } from "@/lib/program-course-import-merge";import { matchTranscriptCourseToProgramCourse } from "@/lib/transcript-course-match";import {
  defaultProgramCourseFilters,
  filterProgramCourses,
  getAvailablePlannedTerms,
  getProgramCourseStats,
  sortProgramCourses,
  type ProgramCourseFilters,
} from "@/lib/program-course-view";
import {
  useGradeFlowWorkspace,
  type ResetWorkspaceScope,
} from "@/hooks/useGradeFlowWorkspace";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";

type DeleteProgramCourseDialogProps = {
  course: StudyProgramCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (courseId: string) => void;
};

function DeleteProgramCourseDialog({
  course,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProgramCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa học phần khỏi chương trình?</DialogTitle>
          <DialogDescription>
            Bảng điểm thật đã nhập sẽ được giữ nguyên. Thao tác này chỉ xóa học
            phần khỏi khung chương trình học.
          </DialogDescription>
        </DialogHeader>

        {course ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{course.name}</p>
            <p className="mt-1 text-muted-foreground">
              {course.code ? `${course.code} · ` : ""}
              {course.credits} tín chỉ
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!course}
            onClick={() => {
              if (course) onConfirm(course.id);
            }}
          >
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ClearProgramCoursesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseCount: number;
  onConfirm: () => void;
};

function ClearProgramCoursesDialog({
  open,
  onOpenChange,
  courseCount,
  onConfirm,
}: ClearProgramCoursesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa toàn bộ chương trình học?</DialogTitle>
          <DialogDescription>
            Thao tác này xóa {courseCount} học phần khỏi khung chương trình.
            Bảng điểm thật vẫn được giữ nguyên.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Xóa toàn bộ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProgramPage() {
  const router = useRouter();
  const {
    isHydrated,
    profile,
    programCourses,
    enrollments,
    retakeSettings,
    setProfileAndSave,
    setProgramCoursesAndSave,
    setEnrollmentsAndSave,
    resetWorkspace,
  } = useGradeFlowWorkspace();
  const [filters, setFilters] = useState<ProgramCourseFilters>(
    defaultProgramCourseFilters,
  );
  const [isProgramImportDialogOpen, setIsProgramImportDialogOpen] =
    useState(false);
  const [isProgramCourseDialogOpen, setIsProgramCourseDialogOpen] =
    useState(false);
  const [courseToEdit, setCourseToEdit] = useState<StudyProgramCourse | null>(
    null,
  );
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] =
    useState<StudyProgramCourse | null>(null);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] =
    useState(false);
  const [isClearCoursesDialogOpen, setIsClearCoursesDialogOpen] =
    useState(false);
  const [selectedProgramCourseForEnrollment, setSelectedProgramCourseForEnrollment] =
    useState<StudyProgramCourse | null>(null);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [isAcademicRulesDialogOpen, setIsAcademicRulesDialogOpen] =
    useState(false);
  const [isResetWorkspaceDialogOpen, setIsResetWorkspaceDialogOpen] =
    useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const availableTerms = useMemo(
    () => getAvailablePlannedTerms(programCourses),
    [programCourses],
  );
  const allCourseStats = useMemo(
    () => getProgramCourseStats(programCourses),
    [programCourses],
  );
  const filteredCourses = useMemo(
    () => filterProgramCourses(programCourses, filters),
    [filters, programCourses],
  );
  const sortedCourses = useMemo(
    () => sortProgramCourses(filteredCourses),
    [filteredCourses],
  );
  const filteredCourseStats = useMemo(
    () => getProgramCourseStats(filteredCourses),
    [filteredCourses],
  );
  const effectiveResult = useMemo(
    () => resolveEffectiveEnrollments(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );

  useEffect(() => {
    if (isHydrated && !profile) {
      router.replace("/onboarding");
    }
  }, [isHydrated, profile, router]);

  function handleImportProgramCourses(
    courses: StudyProgramCourse[],
    summary: ProgramCourseImportSummary,
  ) {
    setProgramCoursesAndSave(courses);

    // Match existing enrollments with newly imported program courses
    let matchedCount = 0;
    const updatedEnrollments = enrollments.map((enrollment) => {
      // Skip if already matched
      if (enrollment.programCourseId) return enrollment;

      const match = matchTranscriptCourseToProgramCourse(
        {
          code: enrollment.code,
          name: enrollment.name,
          credits: enrollment.credits,
        },
        courses,
      );

      if (match.matchType !== "none" && match.programCourseId) {
        matchedCount++;
        return { ...enrollment, programCourseId: match.programCourseId };
      }

      return enrollment;
    });

    if (matchedCount > 0) {
      setEnrollmentsAndSave(updatedEnrollments);
      setFeedback(
        `Đã xử lý ${summary.totalParsed} học phần: thêm ${summary.added}, bỏ qua ${summary.skipped}, cập nhật ${summary.replaced}. Đã liên kết ${matchedCount} lượt học với kế hoạch học tập.`,
      );
    } else {
      setFeedback(
        `Đã xử lý ${summary.totalParsed} học phần: thêm ${summary.added}, bỏ qua ${summary.skipped}, cập nhật ${summary.replaced}.`,
      );
    }
  }

  function handleAddCourse(course: StudyProgramCourse) {
    setProgramCoursesAndSave([...programCourses, course]);
    setFeedback("Đã thêm học phần vào chương trình.");
  }

  function handleSaveEditedCourse(updatedCourse: StudyProgramCourse) {
    setProgramCoursesAndSave(
      programCourses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course,
      ),
    );
    setCourseToEdit(null);
    setIsEditCourseDialogOpen(false);
    setFeedback("Đã cập nhật học phần.");
  }

  function handleConfirmDeleteCourse(courseId: string) {
    setProgramCoursesAndSave(
      programCourses.filter((course) => course.id !== courseId),
    );
    setCourseToDelete(null);
    setIsDeleteCourseDialogOpen(false);
    setFeedback("Đã xóa học phần khỏi chương trình.");
  }

  function handleClearProgramCourses() {
    setProgramCoursesAndSave([]);
    setFilters(defaultProgramCourseFilters);
    setFeedback("Đã xóa toàn bộ chương trình học.");
  }

  function handleRequestAddEnrollment(course: StudyProgramCourse) {
    setSelectedProgramCourseForEnrollment(course);
    setIsEnrollmentDialogOpen(true);
  }

  function handleSaveEnrollment(enrollment: CourseEnrollment) {
    setEnrollmentsAndSave([...enrollments, enrollment]);
    setSelectedProgramCourseForEnrollment(null);
    setIsEnrollmentDialogOpen(false);
    setFeedback("Đã thêm lượt học. Xem trong Bảng điểm thật.");
  }

  function handleConfirmResetWorkspace(scope: ResetWorkspaceScope) {
    resetWorkspace(scope);

    if (scope === "program_courses_only" || scope === "all") {
      setFilters(defaultProgramCourseFilters);
    }

    if (scope === "all" || scope === "profile_only") {
      router.push("/onboarding");
    }
  }

  if (!isHydrated || !profile) {
    return (
      <DashboardShell title="Chương trình học">
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Kế hoạch học tập"
      description="Danh sách học phần trong chương trình đào tạo, dùng để đối chiếu với bảng điểm và theo dõi môn còn thiếu."
      actions={
        <>
          <Button type="button" onClick={() => setIsProgramCourseDialogOpen(true)}>
            Thêm học phần
          </Button>
          <Button
            type="button"
            onClick={() => setIsProgramImportDialogOpen(true)}
            className="bg-sky-600 hover:bg-sky-700"
          >
            📥 Import kế hoạch học tập
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAcademicRulesDialogOpen(true)}
          >
            Cấu hình
          </Button>
          {programCourses.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearCoursesDialogOpen(true)}
            >
              Xóa khung
            </Button>
          ) : null}
        </>
      }
    >
      {feedback ? (
        <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{feedback}</span>
          {feedback.includes("Bảng điểm thật") ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/transcript">Mở bảng điểm</Link>
            </Button>
          ) : null}
        </div>
      ) : null}

      <ProgramCourseStats
        stats={allCourseStats}
        graduationCredits={profile.graduationCredits}
        requiredGraduationCredits={profile.requiredGraduationCredits}
        electiveGraduationCredits={profile.electiveGraduationCredits}
      />

      <ProgramCourseToolbar
        filters={filters}
        onFiltersChange={setFilters}
        availableTerms={availableTerms}
        totalCount={programCourses.length}
        filteredCount={filteredCourses.length}
        totalCredits={allCourseStats.totalCredits}
        filteredCredits={filteredCourseStats.totalCredits}
        onResetFilters={() => setFilters(defaultProgramCourseFilters)}
      />

      <ProgramCourseList
        courses={sortedCourses}
        hasAnyCourse={programCourses.length > 0}
        enrollments={enrollments}
        effectiveResult={effectiveResult}
        onRequestAddEnrollment={handleRequestAddEnrollment}
        onRequestEditCourse={(course) => {
          setCourseToEdit(course);
          setIsEditCourseDialogOpen(true);
        }}
        onRequestRemoveCourse={(course) => {
          setCourseToDelete(course);
          setIsDeleteCourseDialogOpen(true);
        }}
      />

      <ProgramCourseImportDialog
        open={isProgramImportDialogOpen}
        onOpenChange={setIsProgramImportDialogOpen}
        existingCourses={programCourses}
        existingEnrollments={enrollments}
        onImportCourses={handleImportProgramCourses}
      />
      <ProgramCourseDialog
        open={isProgramCourseDialogOpen}
        onOpenChange={setIsProgramCourseDialogOpen}
        onAddCourse={handleAddCourse}
      />
      <EditProgramCourseDialog
        key={courseToEdit?.id ?? "empty-edit-course"}
        course={courseToEdit}
        open={isEditCourseDialogOpen}
        onOpenChange={(open) => {
          setIsEditCourseDialogOpen(open);
          if (!open) setCourseToEdit(null);
        }}
        onSaveCourse={handleSaveEditedCourse}
      />
      <DeleteProgramCourseDialog
        course={courseToDelete}
        open={isDeleteCourseDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteCourseDialogOpen(open);
          if (!open) setCourseToDelete(null);
        }}
        onConfirm={handleConfirmDeleteCourse}
      />
      <ClearProgramCoursesDialog
        open={isClearCoursesDialogOpen}
        onOpenChange={setIsClearCoursesDialogOpen}
        courseCount={programCourses.length}
        onConfirm={handleClearProgramCourses}
      />
      <EnrollmentDialog
        key={selectedProgramCourseForEnrollment?.id ?? "program-enrollment"}
        open={isEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsEnrollmentDialogOpen(open);
          if (!open) setSelectedProgramCourseForEnrollment(null);
        }}
        programCourses={programCourses}
        selectedProgramCourse={selectedProgramCourseForEnrollment}
        existingEnrollments={enrollments}
        retakeSettings={retakeSettings}
        gradeScale={profile.gradeScale}
        onSaveEnrollment={handleSaveEnrollment}
      />
      <AcademicRulesDialog
        key={profile.updatedAt}
        open={isAcademicRulesDialogOpen}
        onOpenChange={setIsAcademicRulesDialogOpen}
        profile={profile}
        onSaveProfile={setProfileAndSave}
        onRequestResetWorkspace={() => setIsResetWorkspaceDialogOpen(true)}
      />
      <ResetWorkspaceDialog
        open={isResetWorkspaceDialogOpen}
        onOpenChange={setIsResetWorkspaceDialogOpen}
        onConfirmReset={handleConfirmResetWorkspace}
      />
    </DashboardShell>
  );
}
