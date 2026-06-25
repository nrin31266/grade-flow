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

export type ResetWorkspaceScope =
  | "all"
  | "profile_only"
  | "program_courses_only"
  | "enrollments_only";

type ResetWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReset: (scope: ResetWorkspaceScope) => void;
};

const resetOptions: Array<{
  value: ResetWorkspaceScope;
  label: string;
  description: string;
}> = [
  {
    value: "all",
    label: "Xóa toàn bộ",
    description: "Xóa hồ sơ, chương trình học và bảng điểm thật.",
  },
  {
    value: "enrollments_only",
    label: "Chỉ xóa bảng điểm thật",
    description: "Xóa các lượt học thật, giữ hồ sơ và chương trình học.",
  },
  {
    value: "program_courses_only",
    label: "Chỉ xóa chương trình học",
    description: "Xóa khung chương trình, giữ hồ sơ và bảng điểm thật.",
  },
  {
    value: "profile_only",
    label: "Chỉ đặt lại hồ sơ",
    description: "Xóa hồ sơ và quay lại onboarding.",
  },
];

export function ResetWorkspaceDialog({
  open,
  onOpenChange,
  onConfirmReset,
}: ResetWorkspaceDialogProps) {
  const [scope, setScope] = useState<ResetWorkspaceScope>("enrollments_only");
  const [confirmation, setConfirmation] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmation("");
      setScope("enrollments_only");
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thiết lập lại workspace?</DialogTitle>
          <DialogDescription>
            Chọn dữ liệu bạn muốn xóa. Thao tác này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {resetOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-xl border bg-background p-3 text-sm"
            >
              <input
                type="radio"
                name="resetScope"
                value={option.value}
                checked={scope === option.value}
                onChange={() => setScope(option.value)}
              />
              <span>
                <span className="block font-medium">{option.label}</span>
                <span className="mt-1 block text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Nhập <span className="font-semibold text-foreground">XOA</span> để
            xác nhận.
          </p>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="XOA"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={confirmation !== "XOA"}
            onClick={() => {
              onConfirmReset(scope);
              handleOpenChange(false);
            }}
          >
            Xóa dữ liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
