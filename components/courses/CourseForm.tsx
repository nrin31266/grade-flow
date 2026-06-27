"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildActualTermId,
  buildActualTermName,
  termOptions,
} from "@/lib/semester";
import type {
  CourseEnrollment,
  CourseStatus,
  TermCode,
} from "@/types/academic";

type CourseFormProps = {
  onAddEnrollment: (enrollment: CourseEnrollment) => void;
};

type FormErrors = {
  name?: string;
  credits?: string;
  academicYear?: string;
  termCode?: string;
  plannedTermNumber?: string;
  score10?: string;
};

export function CourseForm({ onAddEnrollment }: CourseFormProps) {
  const [academicYear, setAcademicYear] = useState("");
  const [termCode, setTermCode] = useState<TermCode | "">("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [plannedTermNumber, setPlannedTermNumber] = useState("");
  const [score10, setScore10] = useState("");
  const [countsForGpa, setCountsForGpa] = useState(true);
  const [countsForGraduation, setCountsForGraduation] = useState(true);
  const [isRetake, setIsRetake] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAcademicYear = academicYear.trim();
    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const parsedCredits = Number(credits);
    const parsedPlannedTermNumber =
      plannedTermNumber.trim() === "" ? undefined : Number(plannedTermNumber);
    const parsedScore10 = score10.trim() === "" ? null : Number(score10);
    const nextErrors: FormErrors = {};

    if (!trimmedAcademicYear) nextErrors.academicYear = "Vui lòng nhập năm học.";
    if (!termCode) nextErrors.termCode = "Vui lòng chọn học kỳ thật.";
    if (!trimmedName) nextErrors.name = "Vui lòng nhập tên học phần.";
    if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
      nextErrors.credits = "Số tín chỉ phải lớn hơn 0.";
    }
    if (
      parsedPlannedTermNumber !== undefined &&
      (!Number.isFinite(parsedPlannedTermNumber) || parsedPlannedTermNumber <= 0)
    ) {
      nextErrors.plannedTermNumber = "Kỳ kế hoạch phải lớn hơn 0.";
    }
    if (
      parsedScore10 !== null &&
      (!Number.isFinite(parsedScore10) || parsedScore10 < 0 || parsedScore10 > 10)
    ) {
      nextErrors.score10 = "Điểm hệ 10 phải nằm trong khoảng 0 đến 10.";
    }

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !termCode) return;

    const status: CourseStatus =
      parsedScore10 === null ? "pending" : parsedScore10 >= 4 ? "completed" : "failed";
    const currentTime = new Date().toISOString();
    const enrollment: CourseEnrollment = {
      id: crypto.randomUUID(),
      code: trimmedCode || undefined,
      name: trimmedName,
      credits: parsedCredits,
      actualTermId: buildActualTermId(trimmedAcademicYear, termCode),
      actualTermName: buildActualTermName(trimmedAcademicYear, termCode),
      academicYear: trimmedAcademicYear,
      termCode,
      plannedTermNumber: parsedPlannedTermNumber,
      score10: parsedScore10,
      letterGrade: null,
      gpa4: null,
      status,
      countsForGpa,
      countsForGraduation,
      isRetake,
      attemptNumber: isRetake ? 2 : 1,
      tags: [],
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    onAddEnrollment(enrollment);
    setCode("");
    setName("");
    setCredits("");
    setPlannedTermNumber("");
    setScore10("");
    setFormErrors({});
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Thêm lượt học</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Nhập học phần theo kỳ học thật để dữ liệu GPA không bị lệch kỳ.
        </p>
      </div>

      <div className="grid gap-6">
        <fieldset className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-medium">Kỳ học thật</legend>
          <div className="grid gap-2">
            <Label htmlFor="academicYear">Năm học</Label>
            <Input id="academicYear" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} placeholder="Ví dụ: 2025-2026" />
            {formErrors.academicYear ? <p className="text-sm text-destructive">{formErrors.academicYear}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="termCode">Học kỳ</Label>
            <Select value={termCode} onValueChange={(value) => setTermCode(value as TermCode)}>
              <SelectTrigger id="termCode" className="w-full"><SelectValue placeholder="Chọn học kỳ" /></SelectTrigger>
              <SelectContent>{termOptions.map((term) => <SelectItem key={term.value} value={term.value}>{term.label}</SelectItem>)}</SelectContent>
            </Select>
            {formErrors.termCode ? <p className="text-sm text-destructive">{formErrors.termCode}</p> : null}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-medium">Thông tin học phần</legend>
          <div className="grid gap-2">
            <Label htmlFor="courseCode">Mã học phần</Label>
            <Input id="courseCode" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Ví dụ: WEB101" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="courseName">Tên học phần</Label>
            <Input id="courseName" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Lập trình Web" />
            {formErrors.name ? <p className="text-sm text-destructive">{formErrors.name}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="courseCredits">Số tín chỉ</Label>
            <Input id="courseCredits" type="number" min="1" inputMode="numeric" value={credits} onChange={(event) => setCredits(event.target.value)} placeholder="Ví dụ: 3" />
            {formErrors.credits ? <p className="text-sm text-destructive">{formErrors.credits}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="plannedTermNumber">Kỳ kế hoạch</Label>
            <Input id="plannedTermNumber" type="number" min="1" inputMode="numeric" value={plannedTermNumber} onChange={(event) => setPlannedTermNumber(event.target.value)} placeholder="Ví dụ: 1, 2, 7..." />
            {formErrors.plannedTermNumber ? <p className="text-sm text-destructive">{formErrors.plannedTermNumber}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="courseScore10">Điểm hệ 10</Label>
            <Input id="courseScore10" type="number" min="0" max="10" step="0.01" inputMode="decimal" value={score10} onChange={(event) => setScore10(event.target.value)} placeholder="Để trống nếu chưa có điểm" />
            {formErrors.score10 ? <p className="text-sm text-destructive">{formErrors.score10}</p> : null}
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <legend className="px-1 text-sm font-medium">Tùy chọn tính điểm</legend>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={countsForGpa} onChange={(event) => setCountsForGpa(event.target.checked)} /> Tính vào GPA</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={countsForGraduation} onChange={(event) => setCountsForGraduation(event.target.checked)} /> Tính vào tín chỉ tốt nghiệp</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isRetake} onChange={(event) => setIsRetake(event.target.checked)} /> Học lại/cải thiện</label>
        </fieldset>
      </div>

      <Button type="submit" className="mt-6">Thêm học phần</Button>
    </form>
  );
}
