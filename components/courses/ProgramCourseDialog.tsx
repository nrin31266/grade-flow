"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  CourseRequirementType,
  KnowledgeBlock,
  StudyProgramCourse,
} from "@/types/academic";

type ProgramCourseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCourse: (course: StudyProgramCourse) => void;
};

type FormErrors = {
  name?: string;
  credits?: string;
  plannedTermNumber?: string;
};

const knowledgeBlockOptions: { value: KnowledgeBlock; label: string }[] = [
  { value: "general", label: "Đại cương" },
  { value: "foundation", label: "Cơ sở ngành" },
  { value: "major", label: "Chuyên ngành" },
  { value: "specialized", label: "Chuyên sâu" },
  { value: "support", label: "Bổ trợ" },
  { value: "graduation", label: "Tốt nghiệp" },
  { value: "other", label: "Khác" },
];

const requirementTypeOptions: {
  value: CourseRequirementType;
  label: string;
}[] = [
  { value: "required", label: "Bắt buộc" },
  { value: "elective", label: "Tự chọn" },
];

export function ProgramCourseDialog({
  open,
  onOpenChange,
  onAddCourse,
}: ProgramCourseDialogProps) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [plannedTermNumber, setPlannedTermNumber] = useState("");
  const [code, setCode] = useState("");
  const [knowledgeBlock, setKnowledgeBlock] = useState<KnowledgeBlock>("other");
  const [requirementType, setRequirementType] =
    useState<CourseRequirementType>("required");
  const [note, setNote] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function resetForm() {
    setName("");
    setCredits("");
    setPlannedTermNumber("");
    setCode("");
    setKnowledgeBlock("other");
    setRequirementType("required");
    setNote("");
    setFormErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    const trimmedNote = note.trim();
    const parsedCredits = Number(credits);
    const parsedPlannedTermNumber =
      plannedTermNumber.trim() === "" ? undefined : Number(plannedTermNumber);
    const nextErrors: FormErrors = {};

    if (!trimmedName) {
      nextErrors.name = "Vui lòng nhập tên học phần.";
    }

    if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
      nextErrors.credits = "Số tín chỉ phải lớn hơn 0.";
    }

    if (
      parsedPlannedTermNumber !== undefined &&
      (!Number.isFinite(parsedPlannedTermNumber) || parsedPlannedTermNumber <= 0)
    ) {
      nextErrors.plannedTermNumber = "Kỳ kế hoạch phải lớn hơn 0.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const currentTime = new Date().toISOString();
    const course: StudyProgramCourse = {
      id: crypto.randomUUID?.() ?? Date.now().toString(),
      code: trimmedCode || undefined,
      name: trimmedName,
      credits: parsedCredits,
      plannedTermNumber: parsedPlannedTermNumber,
      knowledgeBlock,
      requirementType,
      tags: [],
      note: trimmedNote || undefined,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    onAddCourse(course);
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Thêm học phần vào chương trình</DialogTitle>
          <DialogDescription>
            Nhập thông tin học phần theo chương trình đào tạo. Kỳ học thật và
            điểm sẽ được cập nhật sau.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="programCourseName">Tên học phần</Label>
              <Input
                id="programCourseName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Lập trình Web"
              />
              {formErrors.name ? (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="programCourseCredits">Số tín chỉ</Label>
              <Input
                id="programCourseCredits"
                type="number"
                min="0.5"
                step="0.5"
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
                placeholder="Ví dụ: 3"
              />
              {formErrors.credits ? (
                <p className="text-sm text-destructive">{formErrors.credits}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="programPlannedTerm">Kỳ kế hoạch</Label>
              <Input
                id="programPlannedTerm"
                type="number"
                min="1"
                value={plannedTermNumber}
                onChange={(event) => setPlannedTermNumber(event.target.value)}
                placeholder="Ví dụ: 1, 2, 7..."
              />
              <p className="text-xs text-muted-foreground">
                Kỳ theo chương trình đào tạo, không phải kỳ bạn học thật.
              </p>
              {formErrors.plannedTermNumber ? (
                <p className="text-sm text-destructive">
                  {formErrors.plannedTermNumber}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="programKnowledgeBlock">Khối kiến thức</Label>
              <Select
                value={knowledgeBlock}
                onValueChange={(value) => setKnowledgeBlock(value as KnowledgeBlock)}
              >
                <SelectTrigger id="programKnowledgeBlock" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {knowledgeBlockOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="programRequirementType">Loại học phần</Label>
              <Select
                value={requirementType}
                onValueChange={(value) =>
                  setRequirementType(value as CourseRequirementType)
                }
              >
                <SelectTrigger id="programRequirementType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {requirementTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="programCourseCode">Mã học phần</Label>
              <Input
                id="programCourseCode"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Ví dụ: CS2008"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="programCourseNote">Ghi chú</Label>
              <Textarea
                id="programCourseNote"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ghi chú thêm nếu cần"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit">Thêm học phần</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
