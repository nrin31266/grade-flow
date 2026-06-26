"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
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
import { schoolOptions } from "@/data/school-options";
import { saveUserProfile } from "@/lib/profile-storage";
import { getDefaultAcademicRulesForSchool } from "@/lib/school-academic-rules";
import type {
  CreditWarningMode,
  RetakePolicy,
  RetakeSettings,
  RetakeTriggerMode,
  UserProfile,
} from "@/types/profile";

type FormErrors = {
  displayName?: string;
  schoolId?: string;
  graduationCredits?: string;
  requiredGraduationCredits?: string;
  electiveGraduationCredits?: string;
  retakeScoreThreshold?: string;
  retakeCreditWarningPercent?: string;
  improvementCreditWarningPercent?: string;
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

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [graduationCredits, setGraduationCredits] = useState("");
  const [requiredGraduationCredits, setRequiredGraduationCredits] =
    useState("");
  const [electiveGraduationCredits, setElectiveGraduationCredits] =
    useState("");
  const [retakeSettings, setRetakeSettings] = useState<RetakeSettings | null>(
    null,
  );
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const selectedSchool = schoolOptions.find((school) => school.id === schoolId);
  const selectedRules = selectedSchool
    ? getDefaultAcademicRulesForSchool(selectedSchool.id)
    : null;
  const currentRetakeSettings = retakeSettings ?? selectedRules?.retakeSettings;

  function handleSelectSchool(nextSchoolId: string) {
    setSchoolId(nextSchoolId);

    const rules = getDefaultAcademicRulesForSchool(nextSchoolId);

    if (rules.graduationCredits) {
      setGraduationCredits(String(rules.graduationCredits));
    }

    if (rules.requiredGraduationCredits !== undefined) {
      setRequiredGraduationCredits(String(rules.requiredGraduationCredits));
    }

    if (rules.electiveGraduationCredits !== undefined) {
      setElectiveGraduationCredits(String(rules.electiveGraduationCredits));
    }

    setRetakeSettings(rules.retakeSettings);
  }

  function updateRetakeSettings(nextSettings: Partial<RetakeSettings>) {
    setRetakeSettings((currentSettings) => ({
      ...(currentSettings ??
        selectedRules?.retakeSettings ??
        getDefaultAcademicRulesForSchool("custom").retakeSettings),
      ...nextSettings,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const parsedGraduationCredits = Number(graduationCredits);
    const parsedRequiredGraduationCredits = Number(requiredGraduationCredits);
    const parsedElectiveGraduationCredits = Number(electiveGraduationCredits);
    const finalRetakeSettings =
      retakeSettings ??
      selectedRules?.retakeSettings ??
      getDefaultAcademicRulesForSchool("custom").retakeSettings;
    const nextErrors: FormErrors = {};

    if (!trimmedDisplayName) {
      nextErrors.displayName = "Vui lòng nhập họ tên hiển thị.";
    }

    if (!selectedSchool) {
      nextErrors.schoolId = "Vui lòng chọn trường đại học.";
    }

    if (!Number.isFinite(parsedGraduationCredits) || parsedGraduationCredits <= 0) {
      nextErrors.graduationCredits =
        "Vui lòng nhập tổng tín chỉ tốt nghiệp lớn hơn 0.";
    }

    if (
      requiredGraduationCredits.trim() !== "" &&
      (!Number.isFinite(parsedRequiredGraduationCredits) ||
        parsedRequiredGraduationCredits < 0)
    ) {
      nextErrors.requiredGraduationCredits =
        "Tín chỉ bắt buộc không được âm.";
    }

    if (
      electiveGraduationCredits.trim() !== "" &&
      (!Number.isFinite(parsedElectiveGraduationCredits) ||
        parsedElectiveGraduationCredits < 0)
    ) {
      nextErrors.electiveGraduationCredits = "Tín chỉ tự chọn không được âm.";
    }

    if (
      graduationCredits.trim() !== "" &&
      requiredGraduationCredits.trim() !== "" &&
      electiveGraduationCredits.trim() !== "" &&
      Number.isFinite(parsedGraduationCredits) &&
      Number.isFinite(parsedRequiredGraduationCredits) &&
      Number.isFinite(parsedElectiveGraduationCredits) &&
      parsedRequiredGraduationCredits + parsedElectiveGraduationCredits !==
        parsedGraduationCredits
    ) {
      nextErrors.graduationCredits =
        "Tổng tín chỉ nên bằng tín chỉ bắt buộc + tín chỉ tự chọn.";
    }

    if (
      !Number.isFinite(finalRetakeSettings.retakeScoreThreshold) ||
      finalRetakeSettings.retakeScoreThreshold < 0 ||
      finalRetakeSettings.retakeScoreThreshold > 10
    ) {
      nextErrors.retakeScoreThreshold = "Ngưỡng điểm phải nằm trong 0 đến 10.";
    }

    if (
      finalRetakeSettings.retakeCreditWarningPercent !== undefined &&
      (finalRetakeSettings.retakeCreditWarningPercent < 0 ||
        finalRetakeSettings.retakeCreditWarningPercent > 100)
    ) {
      nextErrors.retakeCreditWarningPercent =
        "Ngưỡng học lại phải nằm trong 0 đến 100%.";
    }

    if (
      finalRetakeSettings.improvementCreditWarningPercent !== undefined &&
      (finalRetakeSettings.improvementCreditWarningPercent < 0 ||
        finalRetakeSettings.improvementCreditWarningPercent > 100)
    ) {
      nextErrors.improvementCreditWarningPercent =
        "Ngưỡng cải thiện phải nằm trong 0 đến 100%.";
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedSchool) {
      return;
    }

    const currentTime = new Date().toISOString();
    const academicRules = getDefaultAcademicRulesForSchool(selectedSchool.id);
    const profile: UserProfile = {
      displayName: trimmedDisplayName,
      schoolId: selectedSchool.id,
      schoolName: selectedSchool.name,
      schoolShortName: selectedSchool.shortName,
      graduationCredits: parsedGraduationCredits,
      requiredGraduationCredits:
        requiredGraduationCredits.trim() === ""
          ? academicRules.requiredGraduationCredits
          : parsedRequiredGraduationCredits,
      electiveGraduationCredits:
        electiveGraduationCredits.trim() === ""
          ? academicRules.electiveGraduationCredits
          : parsedElectiveGraduationCredits,
      gradeScale: academicRules.gradeScale,
      retakeSettings: finalRetakeSettings,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    saveUserProfile(profile);
    router.push("/program");
  }

  return (
    <AppShell>
      <section className="mx-auto flex max-w-4xl flex-col gap-5 py-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Thiết lập hồ sơ học tập
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Nhập thông tin cơ bản để GradeFlow cấu hình không gian học tập phù
            hợp với bạn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="displayName">Họ tên hiển thị</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Nhập họ tên của bạn"
                />
                {formErrors.displayName ? (
                  <p className="text-sm text-destructive">
                    {formErrors.displayName}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="school">Trường đại học</Label>
                <Select value={schoolId} onValueChange={handleSelectSchool}>
                  <SelectTrigger id="school" className="w-full">
                    <SelectValue placeholder="Chọn trường đại học" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolOptions.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.shortName} - {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.schoolId ? (
                  <p className="text-sm text-destructive">
                    {formErrors.schoolId}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 rounded-lg border bg-muted/20 p-3">
              <div>
                <p className="text-sm font-medium">Tín chỉ tốt nghiệp</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Chọn trường để tự điền mẫu, rồi sửa lại theo ngành/chương
                  trình của bạn.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="graduationCredits">Tổng</Label>
                  <Input
                    id="graduationCredits"
                    name="graduationCredits"
                    type="number"
                    min="1"
                    inputMode="numeric"
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

                <div className="grid gap-2">
                  <Label htmlFor="requiredGraduationCredits">Bắt buộc</Label>
                  <Input
                    id="requiredGraduationCredits"
                    type="number"
                    min="0"
                    value={requiredGraduationCredits}
                    onChange={(event) =>
                      setRequiredGraduationCredits(event.target.value)
                    }
                    placeholder="Ví dụ: 154"
                  />
                  {formErrors.requiredGraduationCredits ? (
                    <p className="text-sm text-destructive">
                      {formErrors.requiredGraduationCredits}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="electiveGraduationCredits">Tự chọn</Label>
                  <Input
                    id="electiveGraduationCredits"
                    type="number"
                    min="0"
                    value={electiveGraduationCredits}
                    onChange={(event) =>
                      setElectiveGraduationCredits(event.target.value)
                    }
                    placeholder="Ví dụ: 6"
                  />
                  {formErrors.electiveGraduationCredits ? (
                    <p className="text-sm text-destructive">
                      {formErrors.electiveGraduationCredits}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {selectedSchool && selectedRules ? (
              <div className="grid gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold">
                      Cấu hình sẽ áp dụng cho {selectedSchool.shortName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedSchool.academicRulePreset?.note ??
                        "Bạn có thể chỉnh lại trong Cấu hình học vụ."}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-right">
                    Tổng: {graduationCredits || "—"} · Bắt buộc:{" "}
                    {requiredGraduationCredits || "—"} · Tự chọn:{" "}
                    {electiveGraduationCredits || "—"}
                  </p>
                </div>

                {currentRetakeSettings ? (
                  <div className="grid gap-3 rounded-md border bg-background p-3">
                    <div>
                      <p className="text-sm font-medium">Học lại / cải thiện</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Các giá trị này cũng chỉ là autofill từ preset, có thể
                        sửa trước khi tạo hồ sơ.
                      </p>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>Cách chọn lượt hiệu lực</Label>
                        <Select
                          value={currentRetakeSettings.policy}
                          onValueChange={(value) =>
                            updateRetakeSettings({
                              policy: value as RetakePolicy,
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="highest">
                              Lấy điểm cao nhất
                            </SelectItem>
                            <SelectItem value="latest">
                              Lấy lượt mới nhất
                            </SelectItem>
                            <SelectItem value="manual">
                              Tự chọn thủ công
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Khi nào là học lại?</Label>
                        <Select
                          value={currentRetakeSettings.retakeTriggerMode}
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
                            <SelectItem value="failed_only">
                              Chỉ khi không đạt/F
                            </SelectItem>
                            <SelectItem value="below_score">
                              Khi điểm dưới ngưỡng
                            </SelectItem>
                            <SelectItem value="manual">
                              Tự đánh dấu thủ công
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="onboardingRetakeThreshold">
                          Ngưỡng điểm
                        </Label>
                        <Input
                          id="onboardingRetakeThreshold"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          disabled={
                            currentRetakeSettings.retakeTriggerMode !==
                            "below_score"
                          }
                          value={currentRetakeSettings.retakeScoreThreshold}
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
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={currentRetakeSettings.improvementEnabled}
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
                          checked={
                            currentRetakeSettings.countFailedAttemptCredits ??
                            false
                          }
                          onChange={(event) =>
                            updateRetakeSettings({
                              countFailedAttemptCredits: event.target.checked,
                            })
                          }
                        />
                        Tính tín chỉ lượt không đạt vào thống kê
                      </label>
                    </div>

                    <details className="rounded-md border bg-muted/20 p-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Cảnh báo tín chỉ học lại/cải thiện
                      </summary>
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>Cảnh báo học lại</Label>
                          <Select
                            value={
                              currentRetakeSettings.retakeCreditWarningMode ??
                              "off"
                            }
                            onValueChange={(value) =>
                              updateRetakeSettings({
                                retakeCreditWarningMode:
                                  value as CreditWarningMode,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="off">Tắt cảnh báo</SelectItem>
                              <SelectItem value="info">
                                Chỉ nhắc thông tin
                              </SelectItem>
                              <SelectItem value="affects_classification">
                                Có thể ảnh hưởng xếp loại
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            disabled={
                              (currentRetakeSettings.retakeCreditWarningMode ??
                                "off") === "off"
                            }
                            value={optionalNumberToString(
                              currentRetakeSettings.retakeCreditWarningPercent,
                            )}
                            onChange={(event) =>
                              updateRetakeSettings({
                                retakeCreditWarningPercent:
                                  parseOptionalNumber(event.target.value),
                              })
                            }
                            placeholder="Ngưỡng %"
                          />
                          {formErrors.retakeCreditWarningPercent ? (
                            <p className="text-sm text-destructive">
                              {formErrors.retakeCreditWarningPercent}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-2">
                          <Label>Cảnh báo cải thiện</Label>
                          <Select
                            value={
                              currentRetakeSettings.improvementCreditWarningMode ??
                              "off"
                            }
                            onValueChange={(value) =>
                              updateRetakeSettings({
                                improvementCreditWarningMode:
                                  value as CreditWarningMode,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="off">Tắt cảnh báo</SelectItem>
                              <SelectItem value="info">
                                Chỉ nhắc thông tin
                              </SelectItem>
                              <SelectItem value="affects_classification">
                                Có thể ảnh hưởng xếp loại
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            disabled={
                              (currentRetakeSettings.improvementCreditWarningMode ??
                                "off") === "off"
                            }
                            value={optionalNumberToString(
                              currentRetakeSettings.improvementCreditWarningPercent,
                            )}
                            onChange={(event) =>
                              updateRetakeSettings({
                                improvementCreditWarningPercent:
                                  parseOptionalNumber(event.target.value),
                              })
                            }
                            placeholder="Ngưỡng %"
                          />
                          {formErrors.improvementCreditWarningPercent ? (
                            <p className="text-sm text-destructive">
                              {formErrors.improvementCreditWarningPercent}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </details>
                  </div>
                ) : null}

                <div className="overflow-x-auto rounded-md border bg-background">
                    <table className="w-full min-w-96 text-sm">
                      <thead className="bg-muted text-left text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2 font-medium">Chữ</th>
                          <th className="px-3 py-2 font-medium">Hệ 10</th>
                          <th className="px-3 py-2 font-medium">Hệ 4</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRules.gradeScale.map((grade) => (
                          <tr key={grade.letter} className="border-t">
                            <td className="px-3 py-2 font-medium">
                              {grade.letter}
                            </td>
                            <td className="px-3 py-2">
                              {grade.minScore10} - {grade.maxScore10}
                            </td>
                            <td className="px-3 py-2">{grade.gpa4}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                <div className="rounded-md border bg-blue-50 px-3 py-2 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                  Sau bước này, hãy import chương trình học trước. Bảng điểm thật
                  nên import sau để GradeFlow liên kết điểm với môn trong khung.
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                Chọn trường để tự điền tín chỉ mẫu và xem thang điểm áp dụng.
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" asChild>
              <Link href="/">Quay lại trang chủ</Link>
            </Button>
            <Button type="submit">Tạo hồ sơ và nhập chương trình</Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
