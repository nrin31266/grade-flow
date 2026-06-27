"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProgramCourseImportDialog } from "@/components/courses/ProgramCourseImportDialog";
import { TranscriptImportDialog } from "@/components/enrollments/TranscriptImportDialog";
import { GoalProjectionCard } from "@/components/goals/GoalProjectionCard";
import { GoalSettingsDialog } from "@/components/goals/GoalSettingsDialog";
import {
  DashboardHeroSummary,
  type RetakeImprovementHeroSummary,
} from "@/components/dashboard/DashboardHeroSummary";
import { CreditProgressChart } from "@/components/charts/CreditProgressChart";
import { GradeDistributionChart } from "@/components/charts/GradeDistributionChart";
import { GpaTrendChart } from "@/components/charts/GpaTrendChart";
import { TermPerformanceChart } from "@/components/charts/TermPerformanceChart";
import { QuickImportDialog } from "@/components/import/QuickImportDialog";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AcademicRulesDialog } from "@/components/settings/AcademicRulesDialog";
import { ResetWorkspaceDialog } from "@/components/settings/ResetWorkspaceDialog";
import { Button } from "@/components/ui/button";
import {
  buildCreditTrendData,
  buildGradeDistribution,
  buildGpaTrendData,
} from "@/lib/dashboard-charts";
import { calculateDashboardDataStatus } from "@/lib/dashboard-data-status";
import {
  groupEnrollmentsWithSummaries,
  type EnrollmentTermGroup,
} from "@/lib/enrollment-view";
import { calculateCumulativeGpaSummariesFromEffective } from "@/lib/gpa";
import { calculateOverallGpaSummaryFromEffective } from "@/lib/gpa";
import { resolveEffectiveEnrollments } from "@/lib/effective-enrollments";
import { calculateGpaGoalProjection } from "@/lib/gpa-goals";
import type { ProgramCourseImportSummary } from "@/lib/program-course-import-merge";
import { getProgramCourseStats } from "@/lib/program-course-view";
import { buildRetakeKindByEnrollmentId } from "@/lib/retake-kind";

import {
  mergeTranscriptImport,
  type TranscriptImportDuplicateStrategy,
} from "@/lib/transcript-import-merge";
import {
  useGradeFlowWorkspace,
  type ResetWorkspaceScope,
} from "@/hooks/useGradeFlowWorkspace";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";

export default function DashboardPage() {
  const router = useRouter();
  const workspace = useGradeFlowWorkspace();
  const {
    isHydrated,
    profile,
    programCourses,
    enrollments,
    retakeSettings,
    academicGoal,
    setProfileAndSave,
    setProgramCoursesAndSave,
    setEnrollmentsAndSave,
    setAcademicGoalAndSave,
    resetWorkspace,
  } = workspace;
  const [isQuickImportDialogOpen, setIsQuickImportDialogOpen] = useState(false);
  const [isProgramCourseImportDialogOpen, setIsProgramCourseImportDialogOpen] =
    useState(false);
  const [isTranscriptImportDialogOpen, setIsTranscriptImportDialogOpen] =
    useState(false);
  const [isAcademicRulesDialogOpen, setIsAcademicRulesDialogOpen] =
    useState(false);
  const [isResetWorkspaceDialogOpen, setIsResetWorkspaceDialogOpen] =
    useState(false);
  const [isGoalSettingsOpen, setIsGoalSettingsOpen] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const dashboardDataStatus = useMemo(
    () => calculateDashboardDataStatus(programCourses, enrollments),
    [enrollments, programCourses],
  );
  const allCourseStats = useMemo(
    () => getProgramCourseStats(programCourses),
    [programCourses],
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
  const effectiveEnrollmentResult = useMemo(
    () => resolveEffectiveEnrollments(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const retakeImprovementSummary = useMemo<RetakeImprovementHeroSummary>(() => {
    const kindByEnrollmentId = buildRetakeKindByEnrollmentId(
      enrollments,
      retakeSettings,
    );
    const sumCredits = (kind: "retake" | "improvement" | "retake_or_improvement") =>
      enrollments
        .filter((enrollment) => kindByEnrollmentId[enrollment.id] === kind)
        .reduce((total, enrollment) => total + enrollment.credits, 0);
    const retakeCredits = sumCredits("retake");
    const improvementCredits = sumCredits("improvement");
    const uncertainCredits = sumCredits("retake_or_improvement");
    const targetCredits = profile?.graduationCredits;
    const getPercent = (credits: number) =>
      targetCredits && targetCredits > 0 ? (credits / targetCredits) * 100 : null;
    const retakePercent = getPercent(retakeCredits);
    const improvementPercent = getPercent(improvementCredits);
    const uncertainPercent = getPercent(uncertainCredits);
    const getWarningLevel = (
      percent: number | null,
      threshold: number | undefined,
      mode: "off" | "info" | "affects_classification" | undefined,
    ): RetakeImprovementHeroSummary["retakeWarningLevel"] => {
      if (percent === null || threshold === undefined || percent <= threshold || mode === "off") {
        return "normal";
      }

      return mode === "affects_classification" ? "danger" : "warning";
    };
    const effectiveCredits = overallGpaSummary.earnedGraduationCredits;

    return {
      effectiveCredits,
      retakeCredits,
      retakePercent,
      retakeWarningLevel: getWarningLevel(
        retakePercent,
        retakeSettings.retakeCreditWarningPercent,
        retakeSettings.retakeCreditWarningMode,
      ),
      improvementCredits,
      improvementPercent,
      improvementWarningLevel: getWarningLevel(
        improvementPercent,
        retakeSettings.improvementCreditWarningPercent,
        retakeSettings.improvementCreditWarningMode,
      ),
      uncertainCredits,
      uncertainPercent,
    };
  }, [enrollments, overallGpaSummary.earnedGraduationCredits, profile?.graduationCredits, retakeSettings]);
  const enrollmentGroups: EnrollmentTermGroup[] = useMemo(
    () => groupEnrollmentsWithSummaries(enrollments, retakeSettings),
    [enrollments, retakeSettings],
  );
  const latestTerm = enrollmentGroups[0];

  const goalProjection = useMemo(
    () =>
      calculateGpaGoalProjection({
        overallSummary: overallGpaSummary,
        goal: academicGoal,
        profileGraduationCredits: profile?.graduationCredits,
        effectiveEnrollments: effectiveEnrollmentResult.effectiveEnrollments,
      }),
    [overallGpaSummary, academicGoal, profile?.graduationCredits, effectiveEnrollmentResult.effectiveEnrollments],
  );

  const gpaTrendData = useMemo(
    () => buildGpaTrendData(cumulativeGpaSummaries),
    [cumulativeGpaSummaries],
  );
  const creditTrendData = useMemo(
    () => buildCreditTrendData(cumulativeGpaSummaries),
    [cumulativeGpaSummaries],
  );
  const gradeDistribution = useMemo(
    () => buildGradeDistribution(effectiveEnrollmentResult.effectiveEnrollments),
    [effectiveEnrollmentResult.effectiveEnrollments],
  );

  useEffect(() => {
    if (isHydrated && !profile) {
      router.replace("/onboarding");
    }
  }, [isHydrated, profile, router]);

  // Auto-open import dialog if user has no data at all (runs once after mount)
  const hasOpenedImport = useRef(false);
  useEffect(() => {
    if (
      !hasOpenedImport.current &&
      isHydrated &&
      profile &&
      enrollments.length === 0 &&
      programCourses.length === 0
    ) {
      hasOpenedImport.current = true;
      setIsQuickImportDialogOpen(true);
    }
  }, [isHydrated, profile, enrollments.length, programCourses.length]);

  function handleImportProgramCourses(
    courses: StudyProgramCourse[],
    summary: ProgramCourseImportSummary,
  ) {
    setProgramCoursesAndSave(courses);
    setImportFeedback(
      `Đã xử lý ${summary.totalParsed} học phần: thêm ${summary.added}, bỏ qua ${summary.skipped}, cập nhật ${summary.replaced}.`,
    );
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

  function handleConfirmResetWorkspace(scope: ResetWorkspaceScope) {
    resetWorkspace(scope);

    if (scope === "all" || scope === "profile_only") {
      router.push("/onboarding");
    }
  }

  if (!isHydrated || !profile) {
    return (
      <DashboardShell title="Bảng điều khiển">
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Bảng điều khiển"
      description="Tổng quan nhanh về GPA, tín chỉ, mục tiêu và dữ liệu học tập."
      actions={
        <>
          <Button
            type="button"
            onClick={() => setIsQuickImportDialogOpen(true)}
            className="bg-sky-600 hover:bg-sky-700"
          >
            📥 Import dữ liệu
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
      {/* ─── Import feedback ─── */}
      {importFeedback ? (
        <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
          {importFeedback}
        </p>
      ) : null}

      {/* ─── Hero ─── */}
      <DashboardHeroSummary
        profile={profile}
        overallSummary={overallGpaSummary}
        graduationCredits={profile.graduationCredits}
        retakeSettings={retakeSettings}
        retakeImprovementSummary={retakeImprovementSummary}
      />

      {/* ─── Goal ─── */}
      <GoalProjectionCard
        projection={goalProjection}
        onOpenGoalSettings={() => setIsGoalSettingsOpen(true)}
      />

      {/* ─── Charts ─── */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold">Phân tích học tập</h2>
        </div>
        <div className="grid gap-4">
          <div className="min-w-0"><GpaTrendChart data={gpaTrendData} /></div>
          <div className="grid gap-4 md:grid-cols-2 min-w-0">
            <div className="min-w-0">
              <CreditProgressChart
                data={creditTrendData}
                effectiveCredits={overallGpaSummary.earnedGraduationCredits}
              />
            </div>
            <div className="min-w-0"><TermPerformanceChart data={gpaTrendData} /></div>
          </div>
          <div className="min-w-0"><GradeDistributionChart data={gradeDistribution} /></div>
        </div>
      </section>

      {/* ─── Preview areas ─── */}
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border bg-background px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Bảng điểm gần đây</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {latestTerm
                  ? `${latestTerm.actualTermName}, ${latestTerm.rawSummary.enrollmentCount} lượt học`
                  : "Chưa có học kỳ thật nào."}
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/transcript">Mở bảng điểm</Link>
            </Button>
          </div>
          {latestTerm ? (
            <div className="mt-3 grid gap-2 text-sm">
              {latestTerm.enrollments.slice(0, 5).map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                >
                  <span className="min-w-0 truncate font-medium">
                    {enrollment.name}
                  </span>
                  <span className="shrink-0 text-muted-foreground">
                    {enrollment.score10 ?? "Chờ điểm"}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border bg-background px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Kế hoạch học tập</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {allCourseStats.courseCount} học phần, {" "}
                {allCourseStats.totalCredits} tín chỉ trong kế hoạch.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {dashboardDataStatus.programCoursesWithoutGradeCount} học phần
                chưa có điểm.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/program">Mở kế hoạch</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Dialogs ─── */}
      <GoalSettingsDialog
        key={`goal-settings-${isGoalSettingsOpen}-${academicGoal.updatedAt}`}
        open={isGoalSettingsOpen}
        onOpenChange={setIsGoalSettingsOpen}
        goal={academicGoal}
        profileGraduationCredits={profile.graduationCredits}
        onSaveGoal={setAcademicGoalAndSave}
      />
      <QuickImportDialog
        open={isQuickImportDialogOpen}
        onOpenChange={setIsQuickImportDialogOpen}
        onOpenProgramImport={() => setIsProgramCourseImportDialogOpen(true)}
        onOpenTranscriptImport={() => setIsTranscriptImportDialogOpen(true)}
      />
      <ProgramCourseImportDialog
        open={isProgramCourseImportDialogOpen}
        onOpenChange={setIsProgramCourseImportDialogOpen}
        existingCourses={programCourses}
        onImportCourses={handleImportProgramCourses}
      />
      <TranscriptImportDialog
        open={isTranscriptImportDialogOpen}
        onOpenChange={setIsTranscriptImportDialogOpen}
        gradeScale={profile.gradeScale}
        programCourses={programCourses}
        existingEnrollments={enrollments}
        onImportEnrollments={handleImportTranscriptEnrollments}
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
