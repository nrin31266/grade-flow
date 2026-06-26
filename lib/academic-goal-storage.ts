import type { AcademicGoal } from "@/types/goals";
import { getDefaultAcademicGoal } from "@/types/goals";

const STORAGE_KEY = "gradeflow:academic-goal";

export function getAcademicGoal(): AcademicGoal | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.updatedAt === "string" &&
      parsed.preferredTargetScale
    ) {
      return parsed as AcademicGoal;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveAcademicGoal(goal: AcademicGoal): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
  } catch {
    // Silently fail — quota exceeded or storage unavailable.
  }
}

export function clearAcademicGoal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail.
  }
}

export { getDefaultAcademicGoal };
