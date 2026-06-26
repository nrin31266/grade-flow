"use client";

import { useEffect, useMemo, useState } from "react";

import {
  clearAcademicGoal,
  getAcademicGoal,
  getDefaultAcademicGoal,
  saveAcademicGoal,
} from "@/lib/academic-goal-storage";
import {
  clearCourseEnrollments,
  getCourseEnrollments,
  saveCourseEnrollments,
} from "@/lib/course-enrollment-storage";
import {
  clearProgramCourses,
  getProgramCourses,
  saveProgramCourses,
} from "@/lib/program-course-storage";
import {
  clearUserProfile,
  getUserProfile,
  saveUserProfile,
} from "@/lib/profile-storage";
import { getEffectiveRetakeSettings } from "@/lib/retake-settings";
import { mergeProfileWithAcademicDefaults } from "@/lib/school-academic-rules";
import type { CourseEnrollment, StudyProgramCourse } from "@/types/academic";
import type { AcademicGoal } from "@/types/goals";
import type { RetakeSettings, UserProfile } from "@/types/profile";

export type ResetWorkspaceScope =
  | "all"
  | "profile_only"
  | "program_courses_only"
  | "enrollments_only";

export type GradeFlowWorkspace = {
  isHydrated: boolean;
  profile: UserProfile | null;
  programCourses: StudyProgramCourse[];
  enrollments: CourseEnrollment[];
  retakeSettings: RetakeSettings;
  academicGoal: AcademicGoal;
  setProfileAndSave: (profile: UserProfile) => void;
  setProgramCoursesAndSave: (courses: StudyProgramCourse[]) => void;
  setEnrollmentsAndSave: (enrollments: CourseEnrollment[]) => void;
  setAcademicGoalAndSave: (goal: AcademicGoal) => void;
  resetWorkspace: (scope: ResetWorkspaceScope) => void;
};

export function useGradeFlowWorkspace(): GradeFlowWorkspace {
  const [isHydrated, setIsHydrated] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [programCourses, setProgramCourses] = useState<StudyProgramCourse[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [academicGoal, setAcademicGoal] = useState<AcademicGoal>(
    getDefaultAcademicGoal(),
  );

  const retakeSettings = useMemo(
    () => getEffectiveRetakeSettings(profile),
    [profile],
  );

  useEffect(() => {
    queueMicrotask(() => {
      const storedProfile = getUserProfile();

      setIsHydrated(true);

      if (!storedProfile) {
        setProfile(null);
        return;
      }

      const normalizedProfile = mergeProfileWithAcademicDefaults(storedProfile);

      if (
        JSON.stringify(normalizedProfile.retakeSettings) !==
          JSON.stringify(storedProfile.retakeSettings) ||
        storedProfile.gradeScale.length === 0 ||
        normalizedProfile.graduationCredits !== storedProfile.graduationCredits ||
        normalizedProfile.requiredGraduationCredits !==
          storedProfile.requiredGraduationCredits ||
        normalizedProfile.electiveGraduationCredits !==
          storedProfile.electiveGraduationCredits
      ) {
        saveUserProfile(normalizedProfile);
      }

      setProfile(normalizedProfile);
      setProgramCourses(getProgramCourses());
      setEnrollments(getCourseEnrollments());
      setAcademicGoal(getAcademicGoal() ?? getDefaultAcademicGoal());
    });
  }, []);

  function setProfileAndSave(nextProfile: UserProfile) {
    setProfile(nextProfile);
    saveUserProfile(nextProfile);
  }

  function setProgramCoursesAndSave(nextCourses: StudyProgramCourse[]) {
    setProgramCourses(nextCourses);
    saveProgramCourses(nextCourses);
  }

  function setEnrollmentsAndSave(nextEnrollments: CourseEnrollment[]) {
    setEnrollments(nextEnrollments);
    saveCourseEnrollments(nextEnrollments);
  }

  function setAcademicGoalAndSave(nextGoal: AcademicGoal) {
    setAcademicGoal(nextGoal);
    saveAcademicGoal(nextGoal);
  }

  function resetWorkspace(scope: ResetWorkspaceScope) {
    if (scope === "all") {
      clearUserProfile();
      clearProgramCourses();
      clearCourseEnrollments();
      clearAcademicGoal();
      setProfile(null);
      setProgramCourses([]);
      setEnrollments([]);
      setAcademicGoal(getDefaultAcademicGoal());
      return;
    }

    if (scope === "profile_only") {
      clearUserProfile();
      clearAcademicGoal();
      setProfile(null);
      setAcademicGoal(getDefaultAcademicGoal());
      return;
    }

    if (scope === "program_courses_only") {
      clearProgramCourses();
      setProgramCourses([]);
      return;
    }

    clearCourseEnrollments();
    setEnrollments([]);
  }

  return {
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
  };
}
