import { normalizeCourseIdentityText } from "@/lib/enrollment-identity";
import type { StudyProgramCourse } from "@/types/academic";

export type TranscriptCourseMatch = {
  programCourseId?: string;
  matchType: "code" | "name_credits" | "name" | "none";
  confidence: "high" | "medium" | "low" | "none";
  warning?: string;
};

function normalizeCode(value: string): string {
  return normalizeCourseIdentityText(value).replace(/\s+/g, "");
}

export function matchTranscriptCourseToProgramCourse(
  incoming: {
    code?: string;
    name: string;
    credits: number;
  },
  programCourses: StudyProgramCourse[],
): TranscriptCourseMatch {
  const incomingCode = incoming.code ? normalizeCode(incoming.code) : "";

  if (incomingCode) {
    const codeMatch = programCourses.find(
      (course) => course.code && normalizeCode(course.code) === incomingCode,
    );

    if (codeMatch) {
      return {
        programCourseId: codeMatch.id,
        matchType: "code",
        confidence: "high",
        warning:
          codeMatch.credits !== incoming.credits
            ? "Số tín chỉ khác với chương trình học."
            : undefined,
      };
    }
  }

  const incomingName = normalizeCourseIdentityText(incoming.name);
  const nameCreditMatch = programCourses.find(
    (course) =>
      normalizeCourseIdentityText(course.name) === incomingName &&
      course.credits === incoming.credits,
  );

  if (nameCreditMatch) {
    return {
      programCourseId: nameCreditMatch.id,
      matchType: "name_credits",
      confidence: "high",
    };
  }

  const nameMatch = programCourses.find(
    (course) => normalizeCourseIdentityText(course.name) === incomingName,
  );

  if (nameMatch) {
    return {
      programCourseId: nameMatch.id,
      matchType: "name",
      confidence: "medium",
      warning: "Số tín chỉ khác với chương trình học.",
    };
  }

  return {
    matchType: "none",
    confidence: "none",
  };
}
