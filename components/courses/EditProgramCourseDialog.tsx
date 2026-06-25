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
import {
  knowledgeBlockLabels,
  requirementTypeLabels,
} from "@/lib/program-course-labels";
import type {
  CourseRequirementType,
  KnowledgeBlock,
  StudyProgramCourse,
} from "@/types/academic";

type EditProgramCourseDialogProps = {
  course: StudyProgramCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveCourse: (course: StudyProgramCourse) => void;
};

type FormErrors = {
  name?: string;
  credits?: string;
  plannedTermNumber?: string;
};

const knowledgeBlockOptions = Object.entries(knowledgeBlockLabels).map(
  ([value, label]) => ({
    value: value as KnowledgeBlock,
    label,
  }),
);

const requirementTypeOptions = Object.entries(requirementTypeLabels).map(
  ([value, label]) => ({
    value: value as CourseRequirementType,
    label,
  }),
);

export function EditProgramCourseDialog({
  course,
  open,
  onOpenChange,
  onSaveCourse,
}: EditProgramCourseDialogProps) {
  const [name, setName] = useState(course?.name ?? "");
  const [credits, setCredits] = useState(
    course ? String(course.credits) : "",
  );
  const [plannedTermNumber, setPlannedTermNumber] = useState(
    course?.plannedTermNumber ? String(course.plannedTermNumber) : "",
  );
  const [code, setCode] = useState(course?.code ?? "");
  const [knowledgeBlock, setKnowledgeBlock] = useState<KnowledgeBlock>(
    course?.knowledgeBlock ?? "other",
  );
  const [requirementType, setRequirementType] =
    useState<CourseRequirementType>(course?.requirementType ?? "required");
  const [note, setNote] = useState(course?.note ?? "");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!course) {
      return;
    }

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

    onSaveCourse({
      ...course,
      code: trimmedCode || undefined,
      name: trimmedName,
      credits: parsedCredits,
      plannedTermNumber: parsedPlannedTermNumber,
      knowledgeBlock,
      requirementType,
      tags: course.tags ?? [],
      note: trimmedNote || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa học phần</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin học phần trong chương trình đào tạo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="editProgramCourseName">Tên học phần</Label>
              <Input
                id="editProgramCourseName"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {formErrors.name ? (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editProgramCourseCredits">Số tín chỉ</Label>
              <Input
                id="editProgramCourseCredits"
                type="number"
                min="0.5"
                step="0.5"
                value={credits}
                onChange={(event) => setCredits(event.target.value)}
              />
              {formErrors.credits ? (
                <p className="text-sm text-destructive">{formErrors.credits}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="editProgramPlannedTerm">Kỳ kế hoạch</Label>
              <Input
                id="editProgramPlannedTerm"
                type="number"
                min="1"
                value={plannedTermNumber}
                onChange={(event) => setPlannedTermNumber(event.target.value)}
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
              <Label htmlFor="editProgramKnowledgeBlock">Khối kiến thức</Label>
              <Select
                value={knowledgeBlock}
                onValueChange={(value) =>
                  setKnowledgeBlock(value as KnowledgeBlock)
                }
              >
                <SelectTrigger id="editProgramKnowledgeBlock" className="w-full">
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
              <Label htmlFor="editProgramRequirementType">Loại học phần</Label>
              <Select
                value={requirementType}
                onValueChange={(value) =>
                  setRequirementType(value as CourseRequirementType)
                }
              >
                <SelectTrigger id="editProgramRequirementType" className="w-full">
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
              <Label htmlFor="editProgramCourseCode">Mã học phần</Label>
              <Input
                id="editProgramCourseCode"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="editProgramCourseNote">Ghi chú</Label>
              <Textarea
                id="editProgramCourseNote"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
