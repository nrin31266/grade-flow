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
import type { UserProfile } from "@/types/profile";

type FormErrors = {
  displayName?: string;
  schoolId?: string;
  graduationCredits?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [graduationCredits, setGraduationCredits] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const selectedSchool = schoolOptions.find((school) => school.id === schoolId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const parsedGraduationCredits = Number(graduationCredits);
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
      gradeScale: academicRules.gradeScale,
      retakeSettings: academicRules.retakeSettings,
      createdAt: currentTime,
      updatedAt: currentTime,
    };

    saveUserProfile(profile);
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <section className="mx-auto flex max-w-2xl flex-col gap-8 py-8">
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Thiết lập hồ sơ học tập
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            Nhập thông tin cơ bản để GradeFlow cấu hình không gian học tập phù
            hợp với bạn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-5">
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
              <Select value={schoolId} onValueChange={setSchoolId}>
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
                <p className="text-sm text-destructive">{formErrors.schoolId}</p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="graduationCredits">
                Tổng tín chỉ tốt nghiệp dự kiến
              </Label>
              <Input
                id="graduationCredits"
                name="graduationCredits"
                type="number"
                min="1"
                inputMode="numeric"
                value={graduationCredits}
                onChange={(event) => setGraduationCredits(event.target.value)}
                placeholder="Ví dụ: 120, 150, 160..."
              />
              {formErrors.graduationCredits ? (
                <p className="text-sm text-destructive">
                  {formErrors.graduationCredits}
                </p>
              ) : null}
            </div>

            {selectedSchool ? (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                {selectedSchool.id === "vku"
                  ? "Preset VKU: A/B/C/D/F, học lại/cải thiện lấy điểm cao nhất."
                  : "Bạn có thể chỉnh thang điểm và chính sách học lại sau trong Cấu hình học vụ."}
              </div>
            ) : null}
          </div>

          <div className="mt-6 rounded-xl border bg-muted/30 p-4">
            {selectedSchool ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-base font-semibold">
                    Quy đổi GPA mẫu của {selectedSchool.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Tên viết tắt: {selectedSchool.shortName}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-lg border bg-background">
                  <table className="w-full min-w-96 text-sm">
                    <thead className="bg-muted text-left text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Điểm chữ</th>
                        <th className="px-4 py-3 font-medium">
                          Khoảng điểm hệ 10
                        </th>
                        <th className="px-4 py-3 font-medium">Điểm hệ 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSchool.gradeScale.map((grade) => (
                        <tr key={grade.letter} className="border-t">
                          <td className="px-4 py-3 font-medium">
                            {grade.letter}
                          </td>
                          <td className="px-4 py-3">
                            {grade.minScore10} - {grade.maxScore10}
                          </td>
                          <td className="px-4 py-3">{grade.gpa4}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chọn trường để xem quy đổi GPA mẫu.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" asChild>
              <Link href="/">Quay lại trang chủ</Link>
            </Button>
            <Button type="submit">Tiếp tục</Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
