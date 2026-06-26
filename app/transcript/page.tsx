"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DeleteEnrollmentDialog } from "@/components/enrollments/DeleteEnrollmentDialog";
import { EditEnrollmentDialog } from "@/components/enrollments/EditEnrollmentDialog";
import { EnrollmentDialog } from "@/components/enrollments/EnrollmentDialog";
import { EnrollmentTermSections } from "@/components/enrollments/EnrollmentTermSections";
import { TranscriptImportDialog } from "@/components/enrollments/TranscriptImportDialog";
import { TermSummaryPanel } from "@/components/gpa/TermSummaryPanel";
import { TranscriptStatsStrip } from "@/components/transcript/TranscriptStatsStrip";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AcademicRulesDialog } from "@/components/settings/AcademicRulesDialog";
import { ResetWorkspaceDialog } from "@/components/settings/ResetWorkspaceDialog";
import { Button } from "@/components/ui/button";
import { calculateDashboardDataStatus } from "@/lib/dashboard-data-status";
import { resolveEffectiveEnrollments } from "@/lib/effective-enrollments";
import {
  groupEnrollmentsWithSummaries,
  type EnrollmentTermGroup,
} from "@/lib/enrollment-view";
import { getGradeScaleResult } from "@/lib/grade-scale";
import {
  calculateCumulativeGpaSummariesFromEffective,
} from "@/lib/gpa";
import {
  mergeTranscriptImport,
  type TranscriptImportDuplicateStrategy,
} from "@/lib/transcript-import-merge";
import {
  useGradeFlowWorkspace,
  type ResetWorkspaceScope,
} from "@/hooks/useGradeFlowWorkspace";
import type { CourseEnrollment, StudyProgramCourse, TermCode } from "@/types/academic";

export default function TranscriptPage() {
  const router = useRouter();
  const {
    isHydrated,
    profile,
    programCourses,
    enrollments,
    retakeSettings,
    setProfileAndSave,
    setEnrollmentsAndSave,
    resetWorkspace,
  } = useGradeFlowWorkspace();
  const [isTranscriptImportDialogOpen, setIsTranscriptImportDialogOpen] =
    useState(false);
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [defaultEnrollmentAcademicYear, setDefaultEnrollmentAcademicYear] =
    useState<string | undefined>(undefined);
  const [defaultEnrollmentTermCode, setDefaultEnrollmentTermCode] =
    useState<TermCode | undefined>(undefined);
  const [selectedProgramCourseForEnrollment, setSelectedProgramCourseForEnrollment] =
    useState<StudyProgramCourse | null>(null);
  const [enrollmentToDelete, setEnrollmentToDelete] =
    useState<CourseEnrollment | null>(null);
  const [isDeleteEnrollmentDialogOpen, setIsDeleteEnrollmentDialogOpen] =
    useState(false);
  const [enrollmentToEdit, setEnrollmentToEdit] =
    useState<CourseEnrollment | null>(null);
  const [isEditEnrollmentDialogOpen, setIsEditEnrollmentDialogOpen] =
    useState(false);
  const [isAcademicRulesDialogOpen, setIsAcademicRulesDialogOpen] =
    useState(false);
  const [isResetWorkspaceDialogOpen, setIsResetWorkspaceDialogOpen] =
    useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [collapsedTermIds, setCollapsedTermIds] = useState<string[]>([]);

  const dashboardDataStatus = useMemo(
    () => calculateDashboardDataStatus(programCourses, enrollments),
    [enrollments, programCourses],
  );
  const effectiveEnrollmentResult = useMemo(
    () => resolveEffectiveEnrollments(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const cumulativeGpaSummaries = useMemo(
    () => calculateCumulativeGpaSummariesFromEffective(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const enrollmentGroups: EnrollmentTermGroup[] = useMemo(
    () => groupEnrollmentsWithSummaries(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );

  // Stats for transcript view
  const transcriptStats = useMemo(() => {
    const pendingCount = enrollments.filter(
      (e) => e.score10 === null || e.status === "pending" || e.status === "in_progress",
    ).length;
    const failedCount = enrollments.filter(
      (e) => e.status === "failed" || (e.score10 !== null && e.score10 < 4),
    ).length;
    const retakeCount = enrollments.filter((e) => e.isRetake).length;
    const notCountedCount = enrollments.filter(
      (e) => {
        const s = effectiveEnrollmentResult.effectStatusByEnrollmentId[e.id];
        return s?.isEffectiveForGpa === false && e.score10 !== null;
      },
    ).length;
    return { pendingCount, failedCount, retakeCount, notCountedCount };
  }, [enrollments, effectiveEnrollmentResult.effectStatusByEnrollmentId]);

  useEffect(() => {
    if (isHydrated && !profile) {
      router.replace("/onboarding");
    }
  }, [isHydrated, profile, router]);

  function handleRequestAddEnrollment(course?: StudyProgramCourse) {
    setDefaultEnrollmentAcademicYear(undefined);
    setDefaultEnrollmentTermCode(undefined);
    setSelectedProgramCourseForEnrollment(course ?? null);
    setIsEnrollmentDialogOpen(true);
  }

  function handleRequestAddEnrollmentToTerm(term: {
    academicYear: string;
    termCode: TermCode;
  }) {
    setSelectedProgramCourseForEnrollment(null);
    setDefaultEnrollmentAcademicYear(term.academicYear);
    setDefaultEnrollmentTermCode(term.termCode);
    setIsEnrollmentDialogOpen(true);
  }

  function handleSaveEnrollment(enrollment: CourseEnrollment) {
    const gradeScaleResult = getGradeScaleResult(
      enrollment.score10,
      profile?.gradeScale ?? [],
    );
    const nextEnrollments = [
      ...enrollments,
      {
        ...enrollment,
        letterGrade: gradeScaleResult.letterGrade,
        gpa4: gradeScaleResult.gpa4,
      },
    ];

    setEnrollmentsAndSave(nextEnrollments);
    setSelectedProgramCourseForEnrollment(null);
    setDefaultEnrollmentAcademicYear(undefined);
    setDefaultEnrollmentTermCode(undefined);
    setIsEnrollmentDialogOpen(false);
  }

  function handleImportTranscriptEnrollments(
    incomingEnrollments: CourseEnrollment[],
    strategy: TranscriptImportDuplicateStrategy,
  ) {
    const { enrollments: nextEnrollments, summary } = mergeTranscriptImport(
      enrollments,
      incomingEnrollments,
      strategy,
    );

    setEnrollmentsAndSave(nextEnrollments);
    setImportFeedback(
      `Đã xử lý ${summary.totalParsed} lượt học: thêm ${summary.added}, bỏ qua ${summary.skipped}, cập nhật ${summary.replaced}.`,
    );
  }

  function handleSaveEditedEnrollment(updatedEnrollment: CourseEnrollment) {
    setEnrollmentsAndSave(
      enrollments.map((enrollment) =>
        enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment,
      ),
    );
    setEnrollmentToEdit(null);
    setIsEditEnrollmentDialogOpen(false);
  }

  function handleConfirmRemoveEnrollment(enrollmentId: string) {
    setEnrollmentsAndSave(
      enrollments.filter((enrollment) => enrollment.id !== enrollmentId),
    );
    setEnrollmentToDelete(null);
    setIsDeleteEnrollmentDialogOpen(false);
  }

  function handleConfirmResetWorkspace(scope: ResetWorkspaceScope) {
    resetWorkspace(scope);

    if (scope === "all" || scope === "profile_only") {
      router.push("/onboarding");
    }
  }

  if (!isHydrated || !profile) {
    return (
      <DashboardShell title="Bảng điểm thật">
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Bảng điểm thật"
      description="Kiểm tra bảng điểm theo học kỳ, GPA kỳ và các lượt học cần chú ý."
      actions={
        <>
          <Button type="button" onClick={() => handleRequestAddEnrollment()}>
            Thêm lượt học
          </Button>
          <Button
            type="button"
            onClick={() => setIsTranscriptImportDialogOpen(true)}
            className="bg-sky-600 hover:bg-sky-700"
          >
            📥 Import bảng điểm
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAcademicRulesDialogOpen(true)}
          >
            Cấu hình học vụ
          </Button>
        </>
      }
    >
      {programCourses.length === 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Nên import chương trình học trước để GradeFlow liên kết điểm với môn
            trong khung.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/program">Mở chương trình học</Link>
          </Button>
        </div>
      ) : null}

      {dashboardDataStatus.isTranscriptSparse ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
          Dữ liệu bảng điểm thật còn ít. GPA hiện tại chỉ phản ánh các lượt học
          đã nhập.
        </div>
      ) : null}

      {importFeedback ? (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {importFeedback}
        </p>
      ) : null}

      {/* ─── Bảng tổng kết học kỳ ─── */}
      {cumulativeGpaSummaries.length > 0 ? (
        <TermSummaryPanel summaries={cumulativeGpaSummaries} />
      ) : null}

      {/* ─── Tình trạng bảng điểm ─── */}
      {enrollmentGroups.length > 0 ? (
        <TranscriptStatsStrip
          totalEnrollments={enrollments.length}
          pendingEnrollments={transcriptStats.pendingCount}
          failedEnrollments={transcriptStats.failedCount}
          retakeCourseCount={transcriptStats.retakeCount}
          notCountedEnrollments={transcriptStats.notCountedCount}
        />
      ) : null}

      {/* ─── Chi tiết học phần theo học kỳ ─── */}
      <EnrollmentTermSections
        groups={enrollmentGroups}
        effectStatusByEnrollmentId={
          effectiveEnrollmentResult.effectStatusByEnrollmentId
        }
        collapsedTermIds={collapsedTermIds}
        onToggleTerm={(termId) =>
          setCollapsedTermIds((currentTermIds) =>
            currentTermIds.includes(termId)
              ? currentTermIds.filter((currentTermId) => currentTermId !== termId)
              : [...currentTermIds, termId],
          )
        }
        onExpandAll={() => setCollapsedTermIds([])}
        onCollapseAll={() =>
          setCollapsedTermIds(enrollmentGroups.map((group) => group.actualTermId))
        }
        onRequestEditEnrollment={(enrollment) => {
          setEnrollmentToEdit(enrollment);
          setIsEditEnrollmentDialogOpen(true);
        }}
        onRequestRemoveEnrollment={(enrollment) => {
          setEnrollmentToDelete(enrollment);
          setIsDeleteEnrollmentDialogOpen(true);
        }}
        onRequestAddEnrollmentToTerm={handleRequestAddEnrollmentToTerm}
      />

      <EnrollmentDialog
        key={
          [
            selectedProgramCourseForEnrollment?.id ?? "outside-program",
            defaultEnrollmentAcademicYear ?? "default-year",
            defaultEnrollmentTermCode ?? "default-term",
          ].join(":")
        }
        open={isEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsEnrollmentDialogOpen(open);
          if (!open) {
            setSelectedProgramCourseForEnrollment(null);
            setDefaultEnrollmentAcademicYear(undefined);
            setDefaultEnrollmentTermCode(undefined);
          }
        }}
        programCourses={programCourses}
        selectedProgramCourse={selectedProgramCourseForEnrollment}
        defaultAcademicYear={defaultEnrollmentAcademicYear}
        defaultTermCode={defaultEnrollmentTermCode}
        existingEnrollments={enrollments}
        retakeSettings={retakeSettings}
        gradeScale={profile.gradeScale}
        onSaveEnrollment={handleSaveEnrollment}
      />
      <TranscriptImportDialog
        open={isTranscriptImportDialogOpen}
        onOpenChange={setIsTranscriptImportDialogOpen}
        gradeScale={profile.gradeScale}
        programCourses={programCourses}
        existingEnrollments={enrollments}
        onImportEnrollments={handleImportTranscriptEnrollments}
      />
      <DeleteEnrollmentDialog
        enrollment={enrollmentToDelete}
        open={isDeleteEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteEnrollmentDialogOpen(open);
          if (!open) setEnrollmentToDelete(null);
        }}
        onConfirm={handleConfirmRemoveEnrollment}
      />
      <EditEnrollmentDialog
        key={enrollmentToEdit?.id ?? "empty-edit-enrollment"}
        enrollment={enrollmentToEdit}
        open={isEditEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsEditEnrollmentDialogOpen(open);
          if (!open) setEnrollmentToEdit(null);
        }}
        gradeScale={profile.gradeScale}
        onSaveEnrollment={handleSaveEditedEnrollment}
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
