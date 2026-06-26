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

import type { GpaTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatGpa } from "@/lib/number-format";
import { ChartCard } from "@/components/charts/ChartCard";

type TermPerformanceChartProps = {
  data: GpaTrendPoint[];
};

export function TermPerformanceChart({ data }: TermPerformanceChartProps) {
  const validData = data.filter((d) => d.termGpa10 !== null);

  if (validData.length === 0) {
    return (
      <ChartCard title="Điểm trung bình học kỳ (hệ 10)" description="So sánh điểm trung bình hệ 10 giữa các học kỳ.">
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">Chưa có GPA học kỳ hệ 10 để hiển thị.</p>
        </div>
      </ChartCard>
    );
  }

  const sortedByGpa10 = [...validData].sort((a, b) => (b.termGpa10 ?? 0) - (a.termGpa10 ?? 0));
  const best = sortedByGpa10[0];
  const worst = sortedByGpa10[sortedByGpa10.length - 1];

  return (
    <ChartCard
      title="Điểm trung bình học kỳ (hệ 10)"
      description="So sánh điểm trung bình hệ 10 giữa các học kỳ."
      summary={
        <>
          {best && (
            <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              Cao: {best.shortTermName} {formatGpa(best.termGpa10)}
            </span>
          )}
          {worst && (
            <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">
              Thấp: {worst.shortTermName} {formatGpa(worst.termGpa10)}
            </span>
          )}
        </>
      }
    >
      <div className="h-[260px] min-h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={validData} margin={{ top: 18, right: 12, left: -10, bottom: 5 }}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="shortTermName" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v.toFixed(1)} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: "8px 12px" }}
              formatter={(value) => [typeof value === "number" ? formatGpa(value) : "—"]}
              labelFormatter={(label) => `Học kỳ: ${label}`}
            />
            <Bar dataKey="termGpa10" fill={chartColors.gpaTerm} radius={[4, 4, 0, 0]} barSize={28}>
              <LabelList dataKey="termGpa10" position="top" fontSize={12} fill="#64748b" formatter={(v) => (typeof v === "number" ? v.toFixed(2) : v)} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
