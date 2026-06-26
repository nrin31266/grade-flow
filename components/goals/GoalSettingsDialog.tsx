"use client";

import { useState } from "react";

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
import type { AcademicGoal } from "@/types/goals";
import { getDefaultAcademicGoal } from "@/types/goals";

type GoalSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: AcademicGoal;
  profileGraduationCredits?: number;
  onSaveGoal: (goal: AcademicGoal) => void;
};

export function GoalSettingsDialog({
  open,
  onOpenChange,
  goal,
  profileGraduationCredits,
  onSaveGoal,
}: GoalSettingsDialogProps) {
  const [targetGpa4, setTargetGpa4] = useState<string>(
    goal.targetGpa4 !== null ? String(goal.targetGpa4) : "",
  );
  const [targetGpa10, setTargetGpa10] = useState<string>(
    goal.targetGpa10 !== null ? String(goal.targetGpa10) : "",
  );
  const [targetCredits, setTargetCredits] = useState<string>(
    goal.targetGraduationCredits !== null
      ? String(goal.targetGraduationCredits)
      : "",
  );
  const [preferredScale, setPreferredScale] = useState<string>(
    goal.preferredTargetScale,
  );
  const [note, setNote] = useState<string>(goal.note ?? "");
  const [targetImproveGpa4, setTargetImproveGpa4] = useState<string>(
    goal.assumedImprovementGpa4 !== undefined
      ? String(goal.assumedImprovementGpa4)
      : "4.00",
  );
  const [targetImproveScore10, setTargetImproveScore10] = useState<string>(
    goal.assumedImprovementScore10 !== undefined
      ? String(goal.assumedImprovementScore10)
      : "8.50",
  );

  function handleSave() {
    const parsedGpa4 = targetGpa4 === "" ? null : Number(targetGpa4);
    const parsedGpa10 = targetGpa10 === "" ? null : Number(targetGpa10);
    const parsedCredits = targetCredits === "" ? null : Number(targetCredits);
    const parsedImproveGpa4 = targetImproveGpa4 === "" ? 4.0 : Number(targetImproveGpa4);
    const parsedImproveScore10 = targetImproveScore10 === "" ? 8.5 : Number(targetImproveScore10);

    onSaveGoal({
      targetGpa4:
        parsedGpa4 !== null && !isNaN(parsedGpa4) && parsedGpa4 >= 0 && parsedGpa4 <= 4
          ? parsedGpa4
          : null,
      targetGpa10:
        parsedGpa10 !== null && !isNaN(parsedGpa10) && parsedGpa10 >= 0 && parsedGpa10 <= 10
          ? parsedGpa10
          : null,
      targetGraduationCredits:
        parsedCredits !== null && !isNaN(parsedCredits) && parsedCredits > 0
          ? parsedCredits
          : null,
      preferredTargetScale: preferredScale as AcademicGoal["preferredTargetScale"],
      assumedImprovementGpa4:
        !isNaN(parsedImproveGpa4) && parsedImproveGpa4 >= 0 && parsedImproveGpa4 <= 4
          ? parsedImproveGpa4
          : 4.0,
      assumedImprovementScore10:
        !isNaN(parsedImproveScore10) && parsedImproveScore10 >= 0 && parsedImproveScore10 <= 10
          ? parsedImproveScore10
          : 8.5,
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  }

  function handleClear() {
    onSaveGoal(getDefaultAcademicGoal());
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chỉnh mục tiêu học tập</DialogTitle>
          <DialogDescription>
            Thiết lập mục tiêu GPA và tín chỉ để GradeFlow ước tính mức điểm cần đạt.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Hàng 1: GPA 4 + GPA 10 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="target-gpa4">Mục tiêu GPA hệ 4</Label>
              <Input
                id="target-gpa4"
                type="number"
                min={0}
                max={4}
                step={0.01}
                placeholder="Ví dụ: 3.60"
                value={targetGpa4}
                onChange={(e) => setTargetGpa4(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-gpa10">Mục tiêu GPA hệ 10</Label>
              <Input
                id="target-gpa10"
                type="number"
                min={0}
                max={10}
                step={0.01}
                placeholder="Ví dụ: 8.50"
                value={targetGpa10}
                onChange={(e) => setTargetGpa10(e.target.value)}
              />
            </div>
          </div>

          {/* Hàng 2: TC + Thang ưu tiên */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="target-credits">Tín chỉ tốt nghiệp mục tiêu</Label>
              <Input
                id="target-credits"
                type="number"
                min={1}
                placeholder={profileGraduationCredits ? String(profileGraduationCredits) : "Nhập số tín chỉ"}
                value={targetCredits}
                onChange={(e) => setTargetCredits(e.target.value)}
              />
              {profileGraduationCredits && (
                <p className="text-xs text-muted-foreground">
                  Để trống = mặc định theo hồ sơ: {profileGraduationCredits} TC
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="preferred-scale">Thang ưu tiên</Label>
              <Select value={preferredScale} onValueChange={setPreferredScale}>
                <SelectTrigger id="preferred-scale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpa4">Hệ 4</SelectItem>
                  <SelectItem value="gpa10">Hệ 10</SelectItem>
                  <SelectItem value="both">Cả hai</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Hai mục tiêu được đánh giá độc lập.
              </p>
            </div>
          </div>

          {/* Nâng cao — accordion */}
          <details className="group rounded-lg border border-dashed border-slate-200 px-3 py-2 dark:border-slate-800">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Tùy chọn nâng cao
            </summary>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="improve-gpa4">Giả định GPA hệ 4 sau cải thiện</Label>
                <Input
                  id="improve-gpa4"
                  type="number"
                  min={0}
                  max={4}
                  step={0.01}
                  placeholder="4.00"
                  value={targetImproveGpa4}
                  onChange={(e) => setTargetImproveGpa4(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="improve-score10">Giả định điểm hệ 10 sau cải thiện</Label>
                <Input
                  id="improve-score10"
                  type="number"
                  min={0}
                  max={10}
                  step={0.01}
                  placeholder="8.50"
                  value={targetImproveScore10}
                  onChange={(e) => setTargetImproveScore10(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-note">Ghi chú</Label>
                <Textarea
                  id="goal-note"
                  placeholder="Ghi chú cá nhân (không bắt buộc)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </details>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={handleClear}>
            Xóa mục tiêu
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleSave}>
              Lưu mục tiêu
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
