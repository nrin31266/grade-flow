"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RetakePolicy, RetakeSettings } from "@/types/profile";

type RetakePolicyCardProps = {
  settings: RetakeSettings;
  onChange: (settings: RetakeSettings) => void;
};

function parseOptionalPercent(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function RetakePolicyCard({
  settings,
  onChange,
}: RetakePolicyCardProps) {
  return (
    <div className="grid gap-4 rounded-xl border bg-background p-4 shadow-sm">
      <div>
        <h3 className="text-base font-semibold">
          Chính sách học lại/cải thiện
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Quy định cách GradeFlow chọn lượt học được tính khi một môn có nhiều
          điểm.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="retakePolicy">Cách chọn lượt hiệu lực</Label>
          <Select
            value={settings.policy}
            onValueChange={(value) =>
              onChange({ ...settings, policy: value as RetakePolicy })
            }
          >
            <SelectTrigger id="retakePolicy" className="w-full">
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
          <Label htmlFor="improvementCreditLimit">
            Ngưỡng tín chỉ cải thiện tham khảo (%)
          </Label>
          <Input
            id="improvementCreditLimit"
            type="number"
            min="0"
            step="0.5"
            value={settings.improvementCreditLimitPercent ?? ""}
            onChange={(event) =>
              onChange({
                ...settings,
                improvementCreditLimitPercent: parseOptionalPercent(
                  event.target.value,
                ),
              })
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="retakeCreditLimit">
            Ngưỡng tín chỉ học lại tham khảo (%)
          </Label>
          <Input
            id="retakeCreditLimit"
            type="number"
            min="0"
            step="0.5"
            value={settings.retakeCreditLimitPercent ?? ""}
            onChange={(event) =>
              onChange({
                ...settings,
                retakeCreditLimitPercent: parseOptionalPercent(
                  event.target.value,
                ),
              })
            }
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Thiết lập này chỉ dùng để tính toán trong GradeFlow. Hãy kiểm tra quy
        định chính thức của trường nếu cần.
      </p>
    </div>
  );
}
