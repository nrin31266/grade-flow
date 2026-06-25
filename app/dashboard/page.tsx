"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { EditProgramCourseDialog } from "@/components/courses/EditProgramCourseDialog";
import { ProgramCourseDialog } from "@/components/courses/ProgramCourseDialog";
import { ProgramCourseImportDialog } from "@/components/courses/ProgramCourseImportDialog";
import { ProgramCourseList } from "@/components/courses/ProgramCourseList";
import { ProgramCourseStats } from "@/components/courses/ProgramCourseStats";
import { ProgramCourseToolbar } from "@/components/courses/ProgramCourseToolbar";
import { DataStatusCards } from "@/components/dashboard/DataStatusCards";
import { DeleteEnrollmentDialog } from "@/components/enrollments/DeleteEnrollmentDialog";
import { EditEnrollmentDialog } from "@/components/enrollments/EditEnrollmentDialog";
import { EnrollmentDialog } from "@/components/enrollments/EnrollmentDialog";
import { EnrollmentTermSections } from "@/components/enrollments/EnrollmentTermSections";
import { GpaOverviewCards } from "@/components/gpa/GpaOverviewCards";
import { TermGpaTable } from "@/components/gpa/TermGpaTable";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AcademicRulesDialog } from "@/components/settings/AcademicRulesDialog";
import {
  ResetWorkspaceDialog,
  type ResetWorkspaceScope,
} from "@/components/settings/ResetWorkspaceDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  clearCourseEnrollments,
  getCourseEnrollments,
  saveCourseEnrollments,
} from "@/lib/course-enrollment-storage";
import { calculateDashboardDataStatus } from "@/lib/dashboard-data-status";
import { resolveEffectiveEnrollments } from "@/lib/effective-enrollments";
import { getGradeScaleResult } from "@/lib/grade-scale";
import {
  groupEnrollmentsWithSummaries,
  type EnrollmentTermGroup,
} from "@/lib/enrollment-view";
import {
  calculateCumulativeGpaSummariesFromEffective,
  calculateOverallGpaSummaryFromEffective,
} from "@/lib/gpa";
import {
  clearProgramCourses,
  getProgramCourses,
  saveProgramCourses,
} from "@/lib/program-course-storage";
import type { ProgramCourseImportSummary } from "@/lib/program-course-import-merge";
import {
  clearUserProfile,
  getUserProfile,
  saveUserProfile,
} from "@/lib/profile-storage";
import { getEffectiveRetakeSettings } from "@/lib/retake-settings";
import { mergeProfileWithAcademicDefaults } from "@/lib/school-academic-rules";
import {
  defaultProgramCourseFilters,
  filterProgramCourses,
  getAvailablePlannedTerms,
  getProgramCourseStats,
  sortProgramCourses,
  type ProgramCourseFilters,
} from "@/lib/program-course-view";
import type {
  CourseEnrollment,
  StudyProgramCourse,
  TermCode,
} from "@/types/academic";
import type { UserProfile } from "@/types/profile";

export default function DashboardPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [programCourses, setProgramCourses] = useState<StudyProgramCourse[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [filters, setFilters] = useState<ProgramCourseFilters>(
    defaultProgramCourseFilters,
  );
  const [isProgramCourseDialogOpen, setIsProgramCourseDialogOpen] =
    useState(false);
  const [isProgramCourseImportDialogOpen, setIsProgramCourseImportDialogOpen] =
    useState(false);
  const [isClearProgramCoursesDialogOpen, setIsClearProgramCoursesDialogOpen] =
    useState(false);
  const [coursePendingRemoval, setCoursePendingRemoval] =
    useState<StudyProgramCourse | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<StudyProgramCourse | null>(
    null,
  );
  const [isEditProgramCourseDialogOpen, setIsEditProgramCourseDialogOpen] =
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
  const filteredCourseStats = useMemo(
    () => getProgramCourseStats(filteredCourses),
    [filteredCourses],
  );
  const visibleCourses = useMemo(
    () => sortProgramCourses(filteredCourses),
    [filteredCourses],
  );
  const retakeSettings = useMemo(
    () => getEffectiveRetakeSettings(profile),
    [profile],
  );
  const effectiveEnrollmentResult = useMemo(
    () => resolveEffectiveEnrollments(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const overallGpaSummary = useMemo(
    () =>
      calculateOverallGpaSummaryFromEffective(
        enrollments,
        profile?.graduationCredits,
        retakeSettings,
      ),
    [enrollments, profile?.graduationCredits, retakeSettings],
  );
  const cumulativeGpaSummaries = useMemo(
    () => calculateCumulativeGpaSummariesFromEffective(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const enrollmentGroups: EnrollmentTermGroup[] = useMemo(
    () => groupEnrollmentsWithSummaries(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const dashboardDataStatus = useMemo(
    () => calculateDashboardDataStatus(programCourses, enrollments),
    [enrollments, programCourses],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const storedProfile = getUserProfile();

      setIsHydrated(true);

      if (!storedProfile) {
        router.replace("/onboarding");
        return;
      }

      const normalizedProfile = mergeProfileWithAcademicDefaults(storedProfile);

      if (
        JSON.stringify(normalizedProfile.retakeSettings) !==
          JSON.stringify(storedProfile.retakeSettings) ||
        storedProfile.gradeScale.length === 0
      ) {
        saveUserProfile(normalizedProfile);
      }

      setProfile(normalizedProfile);
      setProgramCourses(getProgramCourses());
      setEnrollments(getCourseEnrollments());
    });
  }, [router]);

  function handleSaveProfile(updatedProfile: UserProfile) {
    setProfile(updatedProfile);
    saveUserProfile(updatedProfile);
  }

  function handleConfirmResetWorkspace(scope: ResetWorkspaceScope) {
    if (scope === "all") {
      clearUserProfile();
      clearProgramCourses();
      clearCourseEnrollments();
      router.push("/onboarding");
      return;
    }

    if (scope === "profile_only") {
      clearUserProfile();
      router.push("/onboarding");
      return;
    }

    if (scope === "program_courses_only") {
      setProgramCourses([]);
      clearProgramCourses();
      setFilters(defaultProgramCourseFilters);
      setImportFeedback(null);
      return;
    }

    setEnrollments([]);
    clearCourseEnrollments();
  }

  function handleAddProgramCourse(course: StudyProgramCourse) {
    const nextCourses = [...programCourses, course];

    setProgramCourses(nextCourses);
    saveProgramCourses(nextCourses);
    setImportFeedback(null);
  }

  function handleImportProgramCourses(
    courses: StudyProgramCourse[],
    summary: ProgramCourseImportSummary,
  ) {
    setProgramCourses(courses);
    saveProgramCourses(courses);
    setImportFeedback(
      `Đã xử lý ${summary.totalParsed} học phần: thêm ${summary.added}, bỏ qua ${summary.skipped}, cập nhật ${summary.replaced}.`,
    );
  }

  function handleRemoveProgramCourse(course: StudyProgramCourse) {
    const nextCourses = programCourses.filter(
      (programCourse) => programCourse.id !== course.id,
    );

    setProgramCourses(nextCourses);
    saveProgramCourses(nextCourses);
    setCoursePendingRemoval(null);
    setImportFeedback(null);
  }

  function handleRequestEditCourse(course: StudyProgramCourse) {
    setCourseToEdit(course);
    setIsEditProgramCourseDialogOpen(true);
  }

  function handleSaveProgramCourse(updatedCourse: StudyProgramCourse) {
    const nextCourses = programCourses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course,
    );

    setProgramCourses(nextCourses);
    saveProgramCourses(nextCourses);
    setCourseToEdit(null);
    setIsEditProgramCourseDialogOpen(false);
    setImportFeedback(null);
  }

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
    const normalizedEnrollment: CourseEnrollment = {
      ...enrollment,
      letterGrade: gradeScaleResult.letterGrade,
      gpa4: gradeScaleResult.gpa4,
    };
    const nextEnrollments = [...enrollments, normalizedEnrollment];

    setEnrollments(nextEnrollments);
    saveCourseEnrollments(nextEnrollments);
    setSelectedProgramCourseForEnrollment(null);
    setDefaultEnrollmentAcademicYear(undefined);
    setDefaultEnrollmentTermCode(undefined);
    setIsEnrollmentDialogOpen(false);
  }

  function handleRequestRemoveEnrollment(enrollment: CourseEnrollment) {
    setEnrollmentToDelete(enrollment);
    setIsDeleteEnrollmentDialogOpen(true);
  }

  function handleRequestEditEnrollment(enrollment: CourseEnrollment) {
    setEnrollmentToEdit(enrollment);
    setIsEditEnrollmentDialogOpen(true);
  }

  function handleSaveEditedEnrollment(updatedEnrollment: CourseEnrollment) {
    const nextEnrollments = enrollments.map((enrollment) =>
      enrollment.id === updatedEnrollment.id ? updatedEnrollment : enrollment,
    );

    setEnrollments(nextEnrollments);
    saveCourseEnrollments(nextEnrollments);
    setEnrollmentToEdit(null);
    setIsEditEnrollmentDialogOpen(false);
  }

  function handleConfirmRemoveEnrollment(enrollmentId: string) {
    const nextEnrollments = enrollments.filter(
      (enrollment) => enrollment.id !== enrollmentId,
    );

    setEnrollments(nextEnrollments);
    saveCourseEnrollments(nextEnrollments);
    setEnrollmentToDelete(null);
    setIsDeleteEnrollmentDialogOpen(false);
  }

  function handleClearProgramCourses() {
    setProgramCourses([]);
    clearProgramCourses();
    setFilters(defaultProgramCourseFilters);
    setCoursePendingRemoval(null);
    setCourseToEdit(null);
    setIsEditProgramCourseDialogOpen(false);
    setImportFeedback(null);
    setIsClearProgramCoursesDialogOpen(false);
  }

  if (!isHydrated || !profile) {
    return (
      <DashboardShell>
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <section
        id="overview"
        className="flex scroll-mt-24 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Theo dõi bảng điểm thật, chương trình học và tiến độ tốt nghiệp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled
          >
            Import bảng điểm
            <span className="ml-2 text-xs opacity-70">Sắp có</span>
          </Button>
          <Button
            type="button"
            onClick={() => handleRequestAddEnrollment()}
          >
            Thêm lượt học
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAcademicRulesDialogOpen(true)}
          >
            Cấu hình học vụ
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                Hồ sơ học tập
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Xin chào, {profile.displayName}
              </h2>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Trường:</span>{" "}
                  {profile.schoolName}
                </p>
                {profile.graduationCredits ? (
                  <p>
                    <span className="font-medium text-foreground">
                      Tín chỉ tốt nghiệp dự kiến:
                    </span>{" "}
                    {profile.graduationCredits}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div id="settings" className="rounded-xl border bg-background p-5 shadow-sm">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Luật tính đang áp dụng
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              {profile.schoolShortName} ·{" "}
              {retakeSettings.policy === "highest"
                ? "lấy điểm cao nhất"
                : retakeSettings.policy === "latest"
                  ? "lấy lượt mới nhất"
                  : "tự chọn thủ công"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Thang GPA, tín chỉ tốt nghiệp và chính sách học lại/cải thiện nằm
              trong Cấu hình học vụ.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setIsAcademicRulesDialogOpen(true)}
            >
              Mở cấu hình học vụ
            </Button>
          </div>
        </div>
      </section>

      <DataStatusCards status={dashboardDataStatus} />

      <section id="learning-overview" className="grid scroll-mt-24 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Tổng quan học thật</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dựa trên các lượt học thật đã nhập, không tính từ khung chương
            trình.
          </p>
        </div>

        {dashboardDataStatus.isTranscriptEmpty ? (
          <div className="rounded-xl border border-dashed bg-muted/40 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Chưa có bảng điểm thật</p>
            <p className="mt-1">
              Hãy gán điểm cho một học phần hoặc import bảng điểm ở phase sau.
            </p>
          </div>
        ) : (
          <>
            {dashboardDataStatus.isTranscriptSparse ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                Dữ liệu bảng điểm thật còn ít. GPA hiện tại chỉ phản ánh các
                lượt học đã nhập thử, chưa phải GPA toàn bộ.
              </div>
            ) : null}

            <GpaOverviewCards
              summary={overallGpaSummary}
              graduationCredits={profile.graduationCredits}
            />
          </>
        )}
      </section>

      <section id="transcript" className="grid scroll-mt-24 gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Bảng điểm theo học kỳ</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Các lượt học thật được nhóm theo học kỳ đăng ký, giống cách hệ
              thống đào tạo hiển thị bảng điểm.
            </p>
          </div>
          <Button type="button" onClick={() => handleRequestAddEnrollment()}>
            Thêm lượt học
          </Button>
        </div>

        <EnrollmentTermSections
          groups={enrollmentGroups}
          effectStatusByEnrollmentId={
            effectiveEnrollmentResult.effectStatusByEnrollmentId
          }
          onRequestEditEnrollment={handleRequestEditEnrollment}
          onRequestRemoveEnrollment={handleRequestRemoveEnrollment}
          onRequestAddEnrollmentToTerm={handleRequestAddEnrollmentToTerm}
        />

        {cumulativeGpaSummaries.length > 0 ? (
          <details className="rounded-xl border bg-background p-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-medium">
              Bảng tổng kết theo kỳ
            </summary>
            <div className="mt-4">
              <TermGpaTable summaries={cumulativeGpaSummaries} />
            </div>
          </details>
        ) : null}

        <div className="grid gap-4">
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <h3 className="text-base font-semibold">
              Nhóm học lại/cải thiện
            </h3>
            <p className="mt-2 text-2xl font-semibold">
              {effectiveEnrollmentResult.repeatedCourseCount} môn
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {effectiveEnrollmentResult.repeatedRawCredits} tín chỉ lượt học ·
              Hiệu lực: {effectiveEnrollmentResult.repeatedEffectiveCredits} tín
              chỉ
            </p>
            {profile.graduationCredits ? (
              <div className="mt-2 grid gap-2 text-xs text-muted-foreground">
                <p>
                  Hiệu lực chiếm khoảng{" "}
                  {(
                    (effectiveEnrollmentResult.repeatedEffectiveCredits /
                      profile.graduationCredits) *
                    100
                  ).toFixed(1)}
                  % mục tiêu tốt nghiệp.
                </p>
                {retakeSettings.improvementCreditLimitPercent !== undefined &&
                (effectiveEnrollmentResult.repeatedEffectiveCredits /
                  profile.graduationCredits) *
                  100 >
                  retakeSettings.improvementCreditLimitPercent ? (
                  <p className="rounded-lg border border-yellow-300 bg-yellow-50 p-2 text-yellow-900 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100">
                    Vượt ngưỡng cấu hình{" "}
                    {retakeSettings.improvementCreditLimitPercent}%.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section id="program" className="grid scroll-mt-24 gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Chương trình học</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách học phần theo kế hoạch đào tạo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProgramCourseImportDialogOpen(true)}
            >
              Import JSON
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProgramCourseDialogOpen(true)}
            >
              Thêm học phần
            </Button>
            {programCourses.length > 0 ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setIsClearProgramCoursesDialogOpen(true)}
              >
                Xóa toàn bộ
              </Button>
            ) : null}
          </div>
        </div>

        {importFeedback ? (
          <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
            {importFeedback}
          </p>
        ) : null}

        <ProgramCourseStats
          stats={allCourseStats}
          graduationCredits={profile.graduationCredits}
        />

        <ProgramCourseToolbar
          filters={filters}
          onFiltersChange={setFilters}
          availableTerms={availableTerms}
          totalCount={programCourses.length}
          filteredCount={filteredCourses.length}
          totalCredits={allCourseStats.totalCredits}
          filteredCredits={filteredCourseStats.totalCredits}
          graduationCredits={profile.graduationCredits}
          onResetFilters={() => setFilters(defaultProgramCourseFilters)}
        />

        <ProgramCourseList
          courses={visibleCourses}
          hasAnyCourse={programCourses.length > 0}
          enrollments={enrollments}
          effectiveResult={effectiveEnrollmentResult}
          onRequestAddEnrollment={handleRequestAddEnrollment}
          onRequestEditCourse={handleRequestEditCourse}
          onRequestRemoveCourse={setCoursePendingRemoval}
        />
      </section>

      <ProgramCourseDialog
        open={isProgramCourseDialogOpen}
        onOpenChange={setIsProgramCourseDialogOpen}
        onAddCourse={handleAddProgramCourse}
      />
      <ProgramCourseImportDialog
        open={isProgramCourseImportDialogOpen}
        onOpenChange={setIsProgramCourseImportDialogOpen}
        existingCourses={programCourses}
        onImportCourses={handleImportProgramCourses}
      />
      <EditProgramCourseDialog
        key={courseToEdit?.id ?? "empty-edit-course"}
        course={courseToEdit}
        open={isEditProgramCourseDialogOpen}
        onOpenChange={(open) => {
          setIsEditProgramCourseDialogOpen(open);

          if (!open) {
            setCourseToEdit(null);
          }
        }}
        onSaveCourse={handleSaveProgramCourse}
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
        gradeScale={profile.gradeScale ?? []}
        onSaveEnrollment={handleSaveEnrollment}
      />
      <AcademicRulesDialog
        key={profile.updatedAt}
        open={isAcademicRulesDialogOpen}
        onOpenChange={setIsAcademicRulesDialogOpen}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onRequestResetWorkspace={() => setIsResetWorkspaceDialogOpen(true)}
      />
      <ResetWorkspaceDialog
        open={isResetWorkspaceDialogOpen}
        onOpenChange={setIsResetWorkspaceDialogOpen}
        onConfirmReset={handleConfirmResetWorkspace}
      />
      <DeleteEnrollmentDialog
        enrollment={enrollmentToDelete}
        open={isDeleteEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteEnrollmentDialogOpen(open);

          if (!open) {
            setEnrollmentToDelete(null);
          }
        }}
        onConfirm={handleConfirmRemoveEnrollment}
      />
      <EditEnrollmentDialog
        key={enrollmentToEdit?.id ?? "empty-edit-enrollment"}
        enrollment={enrollmentToEdit}
        open={isEditEnrollmentDialogOpen}
        onOpenChange={(open) => {
          setIsEditEnrollmentDialogOpen(open);

          if (!open) {
            setEnrollmentToEdit(null);
          }
        }}
        gradeScale={profile.gradeScale ?? []}
        onSaveEnrollment={handleSaveEditedEnrollment}
      />
      <Dialog
        open={Boolean(coursePendingRemoval)}
        onOpenChange={(open) => {
          if (!open) {
            setCoursePendingRemoval(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa học phần khỏi chương trình?</DialogTitle>
            <DialogDescription>
              Thao tác này chỉ xóa học phần &quot;{coursePendingRemoval?.name}&quot;
              khỏi khung chương trình học. Các lượt học thật đã gán điểm sẽ không
              bị xóa tự động.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCoursePendingRemoval(null)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (coursePendingRemoval) {
                  handleRemoveProgramCourse(coursePendingRemoval);
                }
              }}
            >
              Xóa khỏi khung
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isClearProgramCoursesDialogOpen}
        onOpenChange={setIsClearProgramCoursesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa toàn bộ chương trình học?</DialogTitle>
            <DialogDescription>
              Toàn bộ {programCourses.length} học phần trong chương trình học sẽ
              bị xóa khỏi trình duyệt này. Dữ liệu đã xóa không thể khôi phục từ
              GradeFlow.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            Chỉ tiếp tục nếu bạn chắc chắn muốn xóa sạch danh sách học phần hiện
            tại.
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClearProgramCoursesDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClearProgramCourses}
            >
              Tôi chắc chắn, xóa toàn bộ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
