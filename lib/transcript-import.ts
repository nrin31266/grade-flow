import { getGradeScaleResult } from "@/lib/grade-scale";
import {
  buildActualTermId,
  buildActualTermName,
} from "@/lib/semester";
import { normalizeCourseIdentityText } from "@/lib/enrollment-identity";
import { matchTranscriptCourseToProgramCourse } from "@/lib/transcript-course-match";
import type {
  CourseEnrollment,
  CourseStatus,
  StudyProgramCourse,
  TermCode,
} from "@/types/academic";
import type { GradeScaleItem } from "@/types/school";

export type TranscriptImportWarning = {
  row?: number;
  message: string;
};

export type TranscriptImportError = {
  row?: number;
  message: string;
};

export type TranscriptImportResult =
  | {
      success: true;
      enrollments: CourseEnrollment[];
      warnings: TranscriptImportWarning[];
    }
  | {
      success: false;
      enrollments: CourseEnrollment[];
      errors: TranscriptImportError[];
      warnings: TranscriptImportWarning[];
    };

type ParseOptions = {
  gradeScale: GradeScaleItem[];
  programCourses: StudyProgramCourse[];
};

type RawTranscriptRow = {
  rowNumber: number;
  academicYear?: unknown;
  termCode?: unknown;
  termName?: unknown;
  course: Record<string, unknown>;
};

type TranscriptInputShape = "terms" | "enrollments" | "array" | "invalid";

const academicYearKeys = ["academicYear", "namHoc", "nam_hoc", "year"];
const termCodeKeys = ["termCode", "hocKy", "hoc_ky", "semester", "ky"];
const termNameKeys = ["termName", "tenHocKy", "ten_hoc_ky", "hocKyText"];
const coursesKeys = [
  "courses",
  "courseEnrollments",
  "enrollments",
  "subjects",
  "monHoc",
  "mon_hoc",
];

const courseKeyAliases = {
  code: ["code", "courseCode", "maHocPhan", "ma_hp", "maLopHocPhan", "ma_lop_hoc_phan"],
  name: ["name", "courseName", "tenHocPhan", "tenLopHocPhan", "ten_hp", "ten_mon"],
  credits: ["credits", "credit", "soTinChi", "soTC", "so_tc", "tinChi"],
  attemptNumber: ["attemptNumber", "lanHoc", "lan_hoc", "attempt"],
  score10: ["score10", "diem10", "diemT10", "diem_t10", "diemHe10", "diem_he_10", "score"],
  note: ["note", "ghiChu", "ghi_chu"],
};

export const sampleTranscriptJson = JSON.stringify(
  {
    terms: [
      {
        academicYear: "2023-2024",
        termCode: "semester_1",
        courses: [
          {
            code: "CS2017",
            name: "Tiếng Anh chuyên ngành 1 IT",
            credits: 2,
            attemptNumber: 1,
            score10: 8.4,
          },
          {
            code: "NS1011",
            name: "Giải tích 1",
            credits: 2,
            attemptNumber: 1,
            score10: 5.4,
          },
        ],
      },
      {
        academicYear: "2024-2025",
        termCode: "semester_1",
        courses: [
          {
            code: "NS1011",
            name: "Giải tích 1",
            credits: 2,
            attemptNumber: 2,
            score10: 8.5,
          },
        ],
      },
    ],
  },
  null,
  2,
);

export const aiTranscriptPrompt = `Bạn là trợ lý trích xuất dữ liệu. Từ dữ liệu người dùng cung cấp (ảnh chụp bảng điểm, PDF từ hệ thống đào tạo, hoặc nội dung copy từ cổng thông tin đào tạo), hãy trích xuất thành JSON. CHỈ trả về JSON hợp lệ, không giải thích, không markdown.

Đây là BẢNG ĐIỂM THẬT, không phải chương trình đào tạo.
Chỉ lấy: học kỳ thật, mã học phần (nếu có), tên học phần, số tín chỉ, lần học, điểm tổng kết hệ 10.
Không lấy: điểm chữ, GPA hệ 4, điểm chuyên cần, bài tập, giữa kỳ, cuối kỳ, điểm thành phần.

QUAN TRỌNG — XỬ LÝ NHIỀU LẦN HỌC (HỌC LẠI/CẢI THIỆN):
- Một môn có thể xuất hiện nhiều lần trong bảng điểm (học lại, cải thiện).
- Mỗi lần học là một mục riêng trong đúng học kỳ nó được đăng ký.
- attemptNumber = lần học thứ mấy (1, 2, 3...). Dựa vào cột "Lần" hoặc "Số lần" trong bảng điểm.
  Nếu không có cột lần học, dựa vào thời gian: lần đầu tiên = 1, lần sau tăng dần.
- KHÔNG gộp các lần học của cùng một môn thành một mục duy nhất.
- Sắp xếp các học kỳ theo thứ tự thời gian tăng dần (cũ trước, mới sau).

Quy tắc chung:
- Mã học phần: để trống nếu không có
- Chưa có điểm: score10 = null (không bỏ môn)
- Học kỳ hè: termCode = "summer"
- Học kỳ riêng: termCode = "custom"
- Mỗi học kỳ một term riêng, không gộp

Format JSON:
{
  "terms": [
    {
      "academicYear": "2023-2024",
      "termCode": "semester_1",
      "courses": [
        { "code": "NS1011", "name": "Giải tích 1", "credits": 2, "attemptNumber": 1, "score10": 5.4 }
      ]
    },
    {
      "academicYear": "2024-2025",
      "termCode": "semester_1",
      "courses": [
        { "code": "NS1011", "name": "Giải tích 1", "credits": 2, "attemptNumber": 2, "score10": 8.5 }
      ]
    }
  ]
}

Lưu ý: GradeFlow tự quy đổi điểm chữ và GPA từ điểm hệ 10. KHÔNG thêm letterGrade, gpa4 hay điểm thành phần.`;

function getValue(record: Record<string, unknown>, keys: string[]): unknown {
  const matchedKey = keys.find((key) => record[key] !== undefined);

  return matchedKey ? record[matchedKey] : undefined;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function parsePositiveNumber(value: unknown): number | null {
  const parsedValue = parseOptionalNumber(value);

  return parsedValue !== null && parsedValue > 0 ? parsedValue : null;
}

function parseAcademicYear(value: unknown): string | null {
  const text = normalizeString(value);
  const match = text.match(/(\d{4})\s*-\s*(\d{4})/);

  return match ? `${match[1]}-${match[2]}` : null;
}

function parseTermCode(value: unknown): TermCode | null {
  const text = normalizeCourseIdentityText(String(value ?? ""));

  if (
    text === "1" ||
    text.includes("semester 1") ||
    text.includes("hk1") ||
    text.includes("hoc ky 1") ||
    text.includes("ky 1")
  ) {
    return "semester_1";
  }

  if (
    text === "2" ||
    text.includes("semester 2") ||
    text.includes("hk2") ||
    text.includes("hoc ky 2") ||
    text.includes("ky 2")
  ) {
    return "semester_2";
  }

  if (
    text.includes("summer") ||
    text === "he" ||
    text.includes("hoc ky he") ||
    text.includes("ky he")
  ) {
    return "summer";
  }

  if (
    text.includes("custom") ||
    text.includes("rieng") ||
    text.includes("hoc ky rieng") ||
    text.includes("ky rieng")
  ) {
    return "custom";
  }

  return null;
}

function getEnrollmentStatus(score10: number | null): CourseStatus {
  if (score10 === null) {
    return "pending";
  }

  return score10 < 4 ? "failed" : "completed";
}

function detectTranscriptInputShape(rawData: unknown): TranscriptInputShape {
  if (Array.isArray(rawData)) {
    return "array";
  }

  if (!rawData || typeof rawData !== "object") {
    return "invalid";
  }

  const root = rawData as Record<string, unknown>;

  if (Array.isArray(root.terms)) {
    return "terms";
  }

  if (Array.isArray(root.enrollments)) {
    return "enrollments";
  }

  return "invalid";
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeRawTranscriptRows(rawData: unknown): {
  rows: RawTranscriptRow[];
  warnings: TranscriptImportWarning[];
} {
  const shape = detectTranscriptInputShape(rawData);
  const warnings: TranscriptImportWarning[] = [];

  if (shape === "array") {
    return {
      rows: (rawData as unknown[]).flatMap((item, index) => {
        const course = toRecord(item);

        return course
          ? [
              {
                rowNumber: index + 1,
                academicYear: getValue(course, academicYearKeys),
                termCode: getValue(course, termCodeKeys),
                termName: getValue(course, termNameKeys),
                course,
              },
            ]
          : [];
      }),
      warnings,
    };
  }

  if (shape === "enrollments") {
    const root = rawData as Record<string, unknown>;
    const enrollments = root.enrollments as unknown[];

    return {
      rows: enrollments.flatMap((item, index) => {
        const course = toRecord(item);

        return course
          ? [
              {
                rowNumber: index + 1,
                academicYear: getValue(course, academicYearKeys),
                termCode: getValue(course, termCodeKeys),
                termName: getValue(course, termNameKeys),
                course,
              },
            ]
          : [];
      }),
      warnings,
    };
  }

  if (shape === "terms") {
    const root = rawData as Record<string, unknown>;
    let globalRowNumber = 0;
    const rows = (root.terms as unknown[]).flatMap((term, termIndex) => {
      const termRecord = toRecord(term);

      if (!termRecord) {
        warnings.push({
          row: termIndex + 1,
          message: "Học kỳ không hợp lệ, đã bỏ qua.",
        });
        return [];
      }

      const termAcademicYear = getValue(termRecord, academicYearKeys);
      const termCode = getValue(termRecord, termCodeKeys);
      const termName = getValue(termRecord, termNameKeys);
      const courses = getValue(termRecord, coursesKeys);

      if (!Array.isArray(courses) || courses.length === 0) {
        warnings.push({
          row: termIndex + 1,
          message: "Học kỳ không có danh sách học phần.",
        });
        return [];
      }

      return courses.flatMap((courseItem) => {
        const course = toRecord(courseItem);

        if (!course) {
          return [];
        }

        globalRowNumber += 1;
        return [
          {
            rowNumber: globalRowNumber,
            academicYear: getValue(course, academicYearKeys) ?? termAcademicYear,
            termCode: getValue(course, termCodeKeys) ?? termCode,
            termName: getValue(course, termNameKeys) ?? termName,
            course,
          },
        ];
      });
    });

    return { rows, warnings };
  }

  return { rows: [], warnings };
}

function createGroupedPendingWarning(count: number): TranscriptImportWarning[] {
  return count > 0
    ? [
        {
          message: `Có ${count} lượt học chưa có điểm hệ 10, các lượt này sẽ ở trạng thái chờ.`,
        },
      ]
    : [];
}

export function parseTranscriptJson(
  input: string,
  options: ParseOptions,
): TranscriptImportResult {
  const errors: TranscriptImportError[] = [];
  const warnings: TranscriptImportWarning[] = [];
  const enrollments: CourseEnrollment[] = [];
  let rawData: unknown;

  try {
    rawData = JSON.parse(input);
  } catch {
    return {
      success: false,
      enrollments: [],
      errors: [{ message: "JSON không hợp lệ." }],
      warnings: [],
    };
  }

  const normalizedRows = normalizeRawTranscriptRows(rawData);
  warnings.push(...normalizedRows.warnings);
  const rawRows = normalizedRows.rows;

  if (rawRows.length === 0) {
    return {
      success: false,
      enrollments: [],
      errors: [{ message: "Không tìm thấy lượt học nào trong JSON." }],
      warnings,
    };
  }

  let pendingScoreCount = 0;

  rawRows.forEach((rawRow) => {
    const row = rawRow.rowNumber;
    const rawEnrollment = rawRow.course;
    const academicYear =
      parseAcademicYear(rawRow.academicYear) ??
      parseAcademicYear(rawRow.termName);
    const termCode =
      parseTermCode(rawRow.termCode) ?? parseTermCode(rawRow.termName);
    const name = normalizeString(getValue(rawEnrollment, courseKeyAliases.name));
    const code = normalizeString(getValue(rawEnrollment, courseKeyAliases.code));
    const credits = parsePositiveNumber(
      getValue(rawEnrollment, courseKeyAliases.credits),
    );
    const score10 = parseOptionalNumber(
      getValue(rawEnrollment, courseKeyAliases.score10),
    );
    const attemptNumberRaw = parseOptionalNumber(
      getValue(rawEnrollment, courseKeyAliases.attemptNumber),
    );

    if (!academicYear) {
      errors.push({ row, message: "Không xác định được năm học thật." });
    }

    if (!termCode) {
      errors.push({ row, message: "Không xác định được học kỳ thật." });
    }

    if (!name) {
      errors.push({ row, message: "Thiếu tên học phần." });
    }

    if (!credits) {
      errors.push({ row, message: "Số tín chỉ phải lớn hơn 0." });
    }

    if (score10 !== null && (score10 < 0 || score10 > 10)) {
      errors.push({ row, message: "Điểm hệ 10 phải nằm trong 0 đến 10." });
    }

    if (attemptNumberRaw !== null && attemptNumberRaw < 1) {
      errors.push({ row, message: "Lần học phải lớn hơn hoặc bằng 1." });
    }

    if (!academicYear || !termCode || !name || !credits) {
      return;
    }

    const matchedCourse = matchTranscriptCourseToProgramCourse(
      { code: code || undefined, name, credits },
      options.programCourses,
    );
    const programCourse = matchedCourse.programCourseId
      ? options.programCourses.find(
          (course) => course.id === matchedCourse.programCourseId,
        )
      : undefined;

    if (matchedCourse.matchType === "none") {
      warnings.push({
        row,
        message:
          "Không tìm thấy học phần tương ứng trong chương trình, sẽ import như học phần ngoài chương trình.",
      });
    }

    if (matchedCourse.warning) {
      warnings.push({ row, message: matchedCourse.warning });
    }

    const gradeScaleResult = getGradeScaleResult(score10, options.gradeScale);

    if (score10 === null) {
      pendingScoreCount += 1;
    }

    const currentTime = new Date().toISOString();
    const finalCode = code || programCourse?.code || undefined;
    const attemptNumber =
      attemptNumberRaw === null ? undefined : Math.floor(attemptNumberRaw);
    const note = normalizeString(getValue(rawEnrollment, courseKeyAliases.note));

    enrollments.push({
      id: crypto.randomUUID?.() ?? `${Date.now()}-${row}`,
      programCourseId: matchedCourse.programCourseId,
      code: finalCode,
      name,
      credits,
      actualTermId: buildActualTermId(academicYear, termCode),
      actualTermName: buildActualTermName(academicYear, termCode),
      academicYear,
      termCode,
      plannedTermNumber: programCourse?.plannedTermNumber,
      score10,
      letterGrade: gradeScaleResult.letterGrade,
      gpa4: gradeScaleResult.gpa4,
      status: getEnrollmentStatus(score10),
      countsForGpa: true,
      countsForGraduation: true,
      isRetake: attemptNumber !== undefined && attemptNumber > 1,
      attemptNumber,
      tags: [],
      note: note || undefined,
      createdAt: currentTime,
      updatedAt: currentTime,
    });
  });

  warnings.push(...createGroupedPendingWarning(pendingScoreCount));

  return errors.length > 0 || enrollments.length === 0
    ? { success: false, enrollments, errors, warnings }
    : { success: true, enrollments, warnings };
}
