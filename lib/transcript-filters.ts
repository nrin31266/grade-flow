import type { EnrollmentEffectStatus } from "@/lib/effective-enrollments";
import type { EnrollmentTermGroup } from "@/lib/enrollment-view";

export type TranscriptViewFilter =
  | "all"
  | "pending"
  | "failed"
  | "retake"
  | "improvement"
  | "not_counted"
  | "effective_only";

export type TranscriptViewMode = "compact" | "comfortable";

export type TranscriptFilterState = {
  searchQuery: string;
  selectedFilter: TranscriptViewFilter;
  selectedTermId: string;
  showOldAttempts: boolean;
  showPending: boolean;
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d");
}

function matchesSearch(
  enrollment: { name: string; code?: string },
  query: string,
): boolean {
  if (!query) return true;
  const normalized = normalizeText(query);
  return (
    normalizeText(enrollment.name).includes(normalized) ||
    (enrollment.code != null &&
      normalizeText(enrollment.code).includes(normalized))
  );
}

function matchesFilter(
  enrollment: {
    score10: number | null;
    gpa4?: number | null;
    status: string;
    isRetake: boolean;
    countsForGpa: boolean;
    countsForGraduation: boolean;
  },
  effectStatus: EnrollmentEffectStatus | undefined,
  filter: TranscriptViewFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pending":
      return (
        enrollment.score10 === null ||
        enrollment.status === "pending" ||
        enrollment.status === "in_progress"
      );
    case "failed":
      return (
        enrollment.status === "failed" ||
        (enrollment.score10 !== null && enrollment.score10 < 4)
      );
    case "retake":
      return enrollment.isRetake === true;
    case "improvement":
      return enrollment.isRetake === true;
    case "not_counted":
      return (
        effectStatus?.isEffectiveForGpa === false &&
        enrollment.score10 !== null
      );
    case "effective_only":
      return effectStatus?.isEffectiveForGpa === true;
    default:
      return true;
  }
}

export function filterEnrollmentTermGroups(params: {
  groups: EnrollmentTermGroup[];
  effectStatusByEnrollmentId: Record<string, EnrollmentEffectStatus>;
  filterState: TranscriptFilterState;
}): EnrollmentTermGroup[] {
  const { groups, effectStatusByEnrollmentId, filterState } = params;

  return groups
    .map((group) => {
      // Filter by selectedTermId
      if (
        filterState.selectedTermId !== "all" &&
        group.actualTermId !== filterState.selectedTermId
      ) {
        return null;
      }

      const filteredEnrollments = group.enrollments.filter((enrollment) => {
        const effectStatus = effectStatusByEnrollmentId[enrollment.id];

        // Search
        if (
          !matchesSearch(enrollment, filterState.searchQuery)
        ) {
          return false;
        }

        // Filter type
        if (
          !matchesFilter(enrollment, effectStatus, filterState.selectedFilter)
        ) {
          return false;
        }

        // Show/hide old attempts
        if (!filterState.showOldAttempts) {
          if (
            effectStatus?.reason === "duplicate_lower_score"
          ) {
            return false;
          }
        }

        // Show/hide pending
        if (!filterState.showPending) {
          if (
            enrollment.score10 === null ||
            enrollment.status === "pending" ||
            enrollment.status === "in_progress"
          ) {
            return false;
          }
        }

        return true;
      });

      if (filteredEnrollments.length === 0) {
        return null;
      }

      return {
        ...group,
        enrollments: filteredEnrollments,
      };
    })
    .filter((group): group is EnrollmentTermGroup => group !== null);
}
