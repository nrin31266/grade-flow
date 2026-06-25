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
import { getDefaultAcademicRulesForSchool } from "@/lib/school-academic-rules";
import { getEffectiveRetakeSettings } from "@/lib/retake-settings";
import type {
  RetakePolicy,
  RetakeSettings,
  RetakeTriggerMode,
  UserProfile,
} from "@/types/profile";

type AcademicRulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onRequestResetWorkspace: () => void;
};

type FormErrors = {
  displayName?: string;
  graduationCredits?: string;
  retakeScoreThreshold?: string;
  improvementCreditLimitPercent?: string;
  retakeCreditLimitPercent?: string;
};

function optionalNumberToString(value?: number): string {
  return value === undefined ? "" : String(value);
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function AcademicRulesDialog({
  open,
  onOpenChange,
  profile,
  onSaveProfile,
  onRequestResetWorkspace,
}: AcademicRulesDialogProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [graduationCredits, setGraduationCredits] = useState(
    optionalNumberToString(profile.graduationCredits),
  );
  const [retakeSettings, setRetakeSettings] = useState<RetakeSettings>(
    getEffectiveRetakeSettings(profile),
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function updateRetakeSettings(nextSettings: Partial<RetakeSettings>) {
    setRetakeSettings((currentSettings) => ({
      ...currentSettings,
      ...nextSettings,
    }));
  }

  function handleRestorePreset() {
    const rules = getDefaultAcademicRulesForSchool(profile.schoolId);

    setRetakeSettings(rules.retakeSettings);
    onSaveProfile({
      ...profile,
      gradeScale: rules.gradeScale,
      retakeSettings: rules.retakeSettings,
      updatedAt: new Date().toISOString(),
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const parsedGraduationCredits = Number(graduationCredits);
    const nextErrors: FormErrors = {};

    if (!trimmedDisplayName) {
      nextErrors.displayName = "Vui lòng nhập họ tên hiển thị.";
    }

    if (
      graduationCredits.trim() !== "" &&
      (!Number.isFinite(parsedGraduationCredits) || parsedGraduationCredits <= 0)
    ) {
      nextErrors.graduationCredits = "Tín chỉ tốt nghiệp phải lớn hơn 0.";
    }

    if (
      !Number.isFinite(retakeSettings.retakeScoreThreshold) ||
      retakeSettings.retakeScoreThreshold < 0 ||
      retakeSettings.retakeScoreThreshold > 10
    ) {
      nextErrors.retakeScoreThreshold = "Ngưỡng điểm phải nằm trong 0 đến 10.";
    }

    if (
      retakeSettings.improvementCreditLimitPercent !== undefined &&
      retakeSettings.improvementCreditLimitPercent < 0
    ) {
      nextErrors.improvementCreditLimitPercent =
        "Ngưỡng tín chỉ cải thiện không được âm.";
    }

    if (
      retakeSettings.retakeCreditLimitPercent !== undefined &&
      retakeSettings.retakeCreditLimitPercent < 0
    ) {
      nextErrors.retakeCreditLimitPercent =
        "Ngưỡng tín chỉ học lại không được âm.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    onSaveProfile({
      ...profile,
      displayName: trimmedDisplayName,
      graduationCredits:
        graduationCredits.trim() === "" ? undefined : parsedGraduationCredits,
      retakeSettings,
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Cấu hình học vụ</DialogTitle>
          <DialogDescription>
            Quản lý thang điểm, chính sách học lại/cải thiện và mục tiêu tốt
            nghiệp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <section className="grid gap-4 rounded-xl border bg-muted/20 p-4">
            <div>
              <h3 className="font-semibold">Hồ sơ</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tín chỉ tốt nghiệp phụ thuộc ngành/chương trình, không chỉ phụ
                thuộc vào trường.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="academicDisplayName">Họ tên hiển thị</Label>
                <Input
                  id="academicDisplayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
                {formErrors.displayName ? (
                  <p className="text-sm text-destructive">
                    {formErrors.displayName}
                  </p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label>Trường</Label>
                <div className="rounded-lg border bg-background px-3 py-2 text-sm">
                  {profile.schoolShortName} - {profile.schoolName}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="academicGraduationCredits">
                  Tín chỉ tốt nghiệp mục tiêu
                </Label>
                <Input
                  id="academicGraduationCredits"
                  type="number"
                  min="1"
                  value={graduationCredits}
                  onChange={(event) => setGraduationCredits(event.target.value)}
                  placeholder="Ví dụ: 160"
                />
                {formErrors.graduationCredits ? (
                  <p className="text-sm text-destructive">
                    {formErrors.graduationCredits}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="grid gap-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-semibold">Thang quy đổi GPA</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Đang dùng preset: {profile.schoolShortName}. Chỉnh sửa chi tiết
                  sẽ bổ sung sau.
                </p>
              </div>
              <Button type="button" variant="outline" onClick={handleRestorePreset}>
                Khôi phục preset theo trường
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-background">
              <table className="w-full min-w-80 text-sm">
                <thead className="bg-muted text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Điểm chữ</th>
                    <th className="px-4 py-3 font-medium">Hệ 10</th>
                    <th className="px-4 py-3 font-medium">Hệ 4</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.gradeScale.map((grade) => (
                    <tr key={grade.letter} className="border-t">
                      <td className="px-4 py-3 font-medium">{grade.letter}</td>
                      <td className="px-4 py-3">
                        {grade.minScore10} - {grade.maxScore10}
                      </td>
                      <td className="px-4 py-3">{grade.gpa4}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-4 rounded-xl border bg-muted/20 p-4">
            <div>
              <h3 className="font-semibold">Học lại / cải thiện</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Với preset VKU, GradeFlow mặc định lấy điểm cao nhất khi có
                nhiều lượt cùng môn.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label>Cách chọn lượt hiệu lực</Label>
                <Select
                  value={retakeSettings.policy}
                  onValueChange={(value) =>
                    updateRetakeSettings({ policy: value as RetakePolicy })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest">Lấy điểm cao nhất</SelectItem>
                    <SelectItem value="latest">Lấy lượt học mới nhất</SelectItem>
                    <SelectItem value="manual">Tự chọn thủ công</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Khi nào được xem là học lại?</Label>
                <Select
                  value={retakeSettings.retakeTriggerMode}
                  onValueChange={(value) =>
                    updateRetakeSettings({
                      retakeTriggerMode: value as RetakeTriggerMode,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="failed_only">Chỉ khi không đạt/F</SelectItem>
                    <SelectItem value="below_score">Khi điểm dưới ngưỡng</SelectItem>
                    <SelectItem value="manual">Tự đánh dấu thủ công</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="retakeScoreThreshold">
                  Ngưỡng điểm học lại
                </Label>
                <Input
                  id="retakeScoreThreshold"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  disabled={retakeSettings.retakeTriggerMode !== "below_score"}
                  value={retakeSettings.retakeScoreThreshold}
                  onChange={(event) =>
                    updateRetakeSettings({
                      retakeScoreThreshold: Number(event.target.value),
                    })
                  }
                />
                {formErrors.retakeScoreThreshold ? (
                  <p className="text-sm text-destructive">
                    {formErrors.retakeScoreThreshold}
                  </p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={retakeSettings.improvementEnabled}
                  onChange={(event) =>
                    updateRetakeSettings({
                      improvementEnabled: event.target.checked,
                    })
                  }
                />
                Cho phép học cải thiện môn đã đạt
              </label>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={retakeSettings.countFailedAttemptCredits ?? false}
                  onChange={(event) =>
                    updateRetakeSettings({
                      countFailedAttemptCredits: event.target.checked,
                    })
                  }
                />
                Tính tín chỉ lượt không đạt vào thống kê
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="improvementLimit">
                  Ngưỡng tín chỉ cải thiện tham khảo (%)
                </Label>
                <Input
                  id="improvementLimit"
                  type="number"
                  min="0"
                  step="0.5"
                  value={optionalNumberToString(
                    retakeSettings.improvementCreditLimitPercent,
                  )}
                  onChange={(event) =>
                    updateRetakeSettings({
                      improvementCreditLimitPercent: parseOptionalNumber(
                        event.target.value,
                      ),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="retakeLimit">
                  Ngưỡng tín chỉ học lại tham khảo (%)
                </Label>
                <Input
                  id="retakeLimit"
                  type="number"
                  min="0"
                  step="0.5"
                  value={optionalNumberToString(
                    retakeSettings.retakeCreditLimitPercent,
                  )}
                  onChange={(event) =>
                    updateRetakeSettings({
                      retakeCreditLimitPercent: parseOptionalNumber(
                        event.target.value,
                      ),
                    })
                  }
                />
              </div>
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <h3 className="font-semibold text-destructive">Vùng nguy hiểm</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thao tác này có thể xóa hồ sơ, chương trình học và bảng điểm thật
                đã nhập.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="w-fit"
              onClick={onRequestResetWorkspace}
            >
              Thiết lập lại workspace
            </Button>
          </section>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu cấu hình</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
