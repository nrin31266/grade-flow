"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import type { CreditTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatCredits } from "@/lib/number-format";
import { ChartCard } from "@/components/charts/ChartCard";

type CreditProgressChartProps = {
  data: CreditTrendPoint[];
};

export function CreditProgressChart({ data }: CreditProgressChartProps) {
  const validData = data.filter((d) => d.earnedCredits > 0);

  if (validData.length === 0) {
    return (
      <ChartCard title="Tín chỉ đạt theo học kỳ" description="Số tín chỉ đạt được trong từng học kỳ.">
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">Chưa có đủ dữ liệu tín chỉ theo học kỳ.</p>
        </div>
      </ChartCard>
    );
  }

  const latest = validData[validData.length - 1];
  const totalEarned = validData.reduce((s, d) => s + d.earnedCredits, 0);
  const maxCredits = Math.max(...validData.map((d) => d.earnedCredits));

  return (
    <ChartCard
      title="Tín chỉ đạt theo học kỳ"
      description="Số tín chỉ đạt được trong từng học kỳ."
      summary={
        <>
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
            Đã tích lũy: <span className="font-semibold">{formatCredits(Math.round(totalEarned))} tín chỉ</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
            Kỳ gần nhất: <span className="font-semibold text-emerald-600">{formatCredits(Math.round(latest.earnedCredits))} tín chỉ</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            Kỳ cao nhất: {formatCredits(Math.round(maxCredits))} tín chỉ
          </span>
        </>
      }
    >
      <div className="h-[260px] min-h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={validData} margin={{ top: 18, right: 12, left: -10, bottom: 5 }}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="shortTermName" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: "8px 12px" }}
              formatter={(value) => [typeof value === "number" ? `${formatCredits(Math.round(value))} tín chỉ` : "—"]}
              labelFormatter={(label) => `Học kỳ: ${label}`}
            />
            <Bar dataKey="earnedCredits" fill={chartColors.creditsEarned} radius={[4, 4, 0, 0]} barSize={28}>
              <LabelList dataKey="earnedCredits" position="top" fontSize={12} fill="#64748b" formatter={(v) => (typeof v === "number" ? Math.round(v) : v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
