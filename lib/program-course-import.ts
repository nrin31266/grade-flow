import type {
  CourseRequirementType,
  KnowledgeBlock,
  StudyProgramCourse,
} from "@/types/academic";
export {
  knowledgeBlockLabels,
  requirementTypeLabels,
} from "@/lib/program-course-labels";

export type ProgramCourseImportResult =
  | {
      success: true;
      courses: StudyProgramCourse[];
      warnings: string[];
    }
  | {
      success: false;
      courses: StudyProgramCourse[];
      errors: string[];
      warnings: string[];
    };

export const sampleProgramCoursesJson = JSON.stringify(
  {
    courses: [
      {
        code: "CS2008",
        name: "Thiết kế web",
        credits: 3,
        plannedTermNumber: 2,
        knowledgeBlock: "foundation",
        requirementType: "required",
        note: "",
      },
      {
        name: "Học máy",
        credits: 3,
        plannedTermNumber: 6,
        knowledgeBlock: "major",
        requirementType: "required",
        note: "",
      },
      {
        name: "Lập trình Python",
        credits: 3,
        plannedTermNumber: 8,
        knowledgeBlock: "major",
        requirementType: "elective",
        note: "",
      },
    ],
  },
  null,
  2,
);

export const aiProgramCoursePrompt = `Hãy đọc bảng chương trình học / điều kiện tốt nghiệp trong ảnh hoặc PDF và trích xuất danh sách học phần thành JSON. Chỉ trả về JSON hợp lệ, không giải thích. Không thêm markdown.

Đây là chương trình học / kế hoạch đào tạo, không phải bảng điểm.
Không cần năm học thật, học kỳ thật, điểm hệ 10, điểm chữ hoặc GPA.
Nếu không thấy mã học phần thì bỏ trống code.
Nếu không rõ kỳ kế hoạch thì bỏ trống plannedTermNumber.
Nếu không rõ khối kiến thức thì dùng "other".
Nếu không rõ bắt buộc/tự chọn thì dùng "required".

Format:
{
  "courses": [
    {
      "code": "CS2008",
      "name": "Thiết kế web",
      "credits": 3,
      "plannedTermNumber": 2,
      "knowledgeBlock": "foundation",
      "requirementType": "required",
      "note": ""
    }
  ]
}`;

const fieldAliases = {
  code: ["code", "courseCode", "maHocPhan", "ma_hp"],
  name: ["name", "courseName", "tenHocPhan", "ten_hp"],
  credits: ["credits", "credit", "soTinChi", "so_tc", "tinChi"],
  plannedTermNumber: [
    "plannedTermNumber",
    "plannedTerm",
    "hocKyKeHoach",
    "hoc_ky",
    "ky",
  ],
  knowledgeBlock: ["knowledgeBlock", "khoiKienThuc", "khoi_kien_thuc"],
  requirementType: [
    "requirementType",
    "loaiHocPhan",
    "batBuocTuChon",
    "tuChonBatBuoc",
  ],
  note: ["note", "ghiChu", "ghi_chu"],
} as const;

function getAliasedValue(
  item: Record<string, unknown>,
  aliases: readonly string[],
): unknown {
  for (const alias of aliases) {
    if (alias in item) {
      return item[alias];
    }
  }

  return undefined;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue || undefined;
}

function normalizeNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsedValue = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function normalizeVietnameseText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

function normalizeKnowledgeBlock(value: unknown): {
  value: KnowledgeBlock;
  wasUnrecognized: boolean;
} {
  if (typeof value !== "string" || !value.trim()) {
    return { value: "other", wasUnrecognized: false };
  }

  const normalizedValue = normalizeVietnameseText(value);
  const mappedValues: Record<string, KnowledgeBlock> = {
    general: "general",
    "dai cuong": "general",
    "giao duc dai cuong": "general",
    foundation: "foundation",
    "co so nganh": "foundation",
    major: "major",
    "chuyen nganh": "major",
    specialized: "specialized",
    "chuyen sau": "specialized",
    support: "support",
    "bo tro": "support",
    graduation: "graduation",
    "tot nghiep": "graduation",
    other: "other",
    khac: "other",
  };

  const mappedValue = mappedValues[normalizedValue];

  return mappedValue
    ? { value: mappedValue, wasUnrecognized: false }
    : { value: "other", wasUnrecognized: true };
}

function normalizeRequirementType(value: unknown): {
  value: CourseRequirementType;
  wasUnrecognized: boolean;
} {
  if (typeof value !== "string" || !value.trim()) {
    return { value: "required", wasUnrecognized: false };
  }

  const normalizedValue = normalizeVietnameseText(value);
  const mappedValues: Record<string, CourseRequirementType> = {
    required: "required",
    "bat buoc": "required",
    elective: "elective",
    "tu chon": "elective",
  };

  const mappedValue = mappedValues[normalizedValue];

  return mappedValue
    ? { value: mappedValue, wasUnrecognized: false }
    : { value: "required", wasUnrecognized: true };
}

function createCourseId(index: number): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${index}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseProgramCoursesJson(input: string): ProgramCourseImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const courses: StudyProgramCourse[] = [];
  let parsedInput: unknown;

  try {
    parsedInput = JSON.parse(input);
  } catch {
    return {
      success: false,
      courses,
      errors: ["JSON không hợp lệ. Vui lòng kiểm tra lại cú pháp."],
      warnings,
    };
  }

  const rawCourses = Array.isArray(parsedInput)
    ? parsedInput
    : isRecord(parsedInput) && Array.isArray(parsedInput.courses)
      ? parsedInput.courses
      : null;

  if (!rawCourses) {
    return {
      success: false,
      courses,
      errors: ["Dữ liệu phải là object có trường courses array hoặc array học phần."],
      warnings,
    };
  }

  if (rawCourses.length === 0) {
    return {
      success: false,
      courses,
      errors: ["Danh sách học phần không được rỗng."],
      warnings,
    };
  }

  rawCourses.forEach((rawCourse, index) => {
    const rowNumber = index + 1;

    if (!isRecord(rawCourse)) {
      errors.push(`Dòng ${rowNumber}: Dữ liệu học phần không hợp lệ.`);
      return;
    }

    const name = normalizeOptionalString(
      getAliasedValue(rawCourse, fieldAliases.name),
    );
    const credits = normalizeNumber(getAliasedValue(rawCourse, fieldAliases.credits));
    const plannedTermNumber = normalizeNumber(
      getAliasedValue(rawCourse, fieldAliases.plannedTermNumber),
    );

    if (!name) {
      errors.push(`Dòng ${rowNumber}: Thiếu tên học phần.`);
    }

    if (credits === undefined || credits <= 0) {
      errors.push(`Dòng ${rowNumber}: Số tín chỉ không hợp lệ.`);
    }

    if (plannedTermNumber !== undefined && plannedTermNumber <= 0) {
      errors.push(`Dòng ${rowNumber}: Kỳ kế hoạch phải lớn hơn 0.`);
    }

    if (!name || credits === undefined || credits <= 0) {
      return;
    }

    if (plannedTermNumber !== undefined && plannedTermNumber <= 0) {
      return;
    }

    if (plannedTermNumber === undefined) {
      warnings.push(
        `Dòng ${rowNumber}: Chưa có kỳ kế hoạch, học phần sẽ được xếp vào nhóm Chưa gán.`,
      );
    }

    const knowledgeBlock = normalizeKnowledgeBlock(
      getAliasedValue(rawCourse, fieldAliases.knowledgeBlock),
    );
    const requirementType = normalizeRequirementType(
      getAliasedValue(rawCourse, fieldAliases.requirementType),
    );

    if (knowledgeBlock.wasUnrecognized) {
      warnings.push(
        `Dòng ${rowNumber}: Khối kiến thức không nhận diện được, đã đặt là Khác.`,
      );
    }

    if (requirementType.wasUnrecognized) {
      warnings.push(
        `Dòng ${rowNumber}: Loại học phần không nhận diện được, đã đặt là Bắt buộc.`,
      );
    }

    const currentTime = new Date().toISOString();

    courses.push({
      id: createCourseId(index),
      code: normalizeOptionalString(getAliasedValue(rawCourse, fieldAliases.code)),
      name,
      credits,
      plannedTermNumber,
      knowledgeBlock: knowledgeBlock.value,
      requirementType: requirementType.value,
      tags: [],
      note: normalizeOptionalString(getAliasedValue(rawCourse, fieldAliases.note)),
      createdAt: currentTime,
      updatedAt: currentTime,
    });
  });

  if (courses.length === 0) {
    return { success: false, courses, errors, warnings };
  }

  if (errors.length > 0) {
    return { success: false, courses, errors, warnings };
  }

  return { success: true, courses, warnings };
}
