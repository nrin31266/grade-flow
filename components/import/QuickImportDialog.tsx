"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type QuickImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenProgramImport: () => void;
  onOpenTranscriptImport: () => void;
};

export function QuickImportDialog({
  open,
  onOpenChange,
  onOpenProgramImport,
  onOpenTranscriptImport,
}: QuickImportDialogProps) {
  function openNextDialog(callback: () => void) {
    onOpenChange(false);
    queueMicrotask(callback);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import dữ liệu</DialogTitle>
          <DialogDescription>
            Bạn có thể import bảng điểm trước để tính GPA ngay. Kế hoạch học tập
            có thể import sau để đối chiếu môn còn thiếu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Bảng điểm */}
          <div className="grid gap-3 rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-950/20">
            <div>
              <h3 className="font-semibold">Import bảng điểm</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng để tính GPA, tín chỉ đã đạt, học lại/cải thiện, biểu đồ và
                mục tiêu học tập.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => openNextDialog(onOpenTranscriptImport)}
            >
              Import bảng điểm
            </Button>
          </div>

          {/* Kế hoạch học tập — có thể làm sau */}
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Import kế hoạch học tập</h3>
                <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Có thể làm sau
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng để biết môn nào đã học, môn nào còn thiếu trong chương
                trình đào tạo.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => openNextDialog(onOpenProgramImport)}
            >
              Import kế hoạch
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
