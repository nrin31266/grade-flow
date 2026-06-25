import type { StudyProgramCourse } from "@/types/academic";

const PROGRAM_COURSES_STORAGE_KEY = "gradeflow:program-courses";

export function getProgramCourses(): StudyProgramCourse[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedCourses = localStorage.getItem(PROGRAM_COURSES_STORAGE_KEY);

    if (!storedCourses) {
      return [];
    }

    const parsedCourses = JSON.parse(storedCourses);

    return Array.isArray(parsedCourses)
      ? (parsedCourses as StudyProgramCourse[])
      : [];
  } catch {
    return [];
  }
}

export function saveProgramCourses(courses: StudyProgramCourse[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PROGRAM_COURSES_STORAGE_KEY, JSON.stringify(courses));
}

export function addProgramCourse(course: StudyProgramCourse): void {
  const courses = getProgramCourses();

  saveProgramCourses([...courses, course]);
}

export function removeProgramCourse(courseId: string): void {
  const courses = getProgramCourses();

  saveProgramCourses(courses.filter((course) => course.id !== courseId));
}

export function clearProgramCourses(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(PROGRAM_COURSES_STORAGE_KEY);
}