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
            Chọn loại dữ liệu bạn muốn nhập vào GradeFlow.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
            <div>
              <h3 className="font-semibold">Import chương trình học</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng cho khung chương trình/kế hoạch đào tạo: mã học phần, tên,
                tín chỉ, kỳ kế hoạch, bắt buộc/tự chọn.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => openNextDialog(onOpenProgramImport)}
            >
              Import chương trình
            </Button>
          </div>

          <div className="grid gap-3 rounded-xl border bg-muted/20 p-4">
            <div>
              <h3 className="font-semibold">Import bảng điểm thật</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Dùng cho bảng điểm từ hệ thống đào tạo: học kỳ thật, lượt học,
                điểm hệ 10.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => openNextDialog(onOpenTranscriptImport)}
            >
              Import bảng điểm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
