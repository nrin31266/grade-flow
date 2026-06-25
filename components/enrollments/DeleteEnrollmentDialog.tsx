import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CourseEnrollment } from "@/types/academic";

type DeleteEnrollmentDialogProps = {
  enrollment: CourseEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (enrollmentId: string) => void;
};

export function DeleteEnrollmentDialog({
  enrollment,
  open,
  onOpenChange,
  onConfirm,
}: DeleteEnrollmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa lượt học?</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa lượt học này không? Thao tác này không thể hoàn
            tác.
          </DialogDescription>
        </DialogHeader>

        {enrollment ? (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="font-medium">{enrollment.name}</p>
            <p className="mt-1 text-muted-foreground">
              {enrollment.actualTermName}
            </p>
            <p className="mt-1 text-muted-foreground">
              Điểm:{" "}
              {enrollment.score10 === null
                ? "Chưa có điểm"
                : enrollment.score10}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (enrollment) {
                onConfirm(enrollment.id);
              }
            }}
          >
            Xóa lượt học
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
