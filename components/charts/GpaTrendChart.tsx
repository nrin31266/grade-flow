"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";

import type { GpaTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatGpa } from "@/lib/number-format";
import { ChartCard } from "@/components/charts/ChartCard";

type GpaTrendChartProps = {
  data: GpaTrendPoint[];
};

function getZoomDomain(points: GpaTrendPoint[]): [number, number] {
  const all = points.flatMap((p) => [p.termGpa4, p.cumulativeGpa4]).filter((v): v is number => v !== null);
  if (all.length === 0) return [0, 4];
  const min = Math.min(...all);
  const max = Math.max(...all);
  let lower = Math.max(0, Math.floor((min - 0.15) * 10) / 10);
  let upper = Math.min(4, Math.ceil((max + 0.15) * 10) / 10);
  if (upper - lower < 0.6) {
    const mid = (lower + upper) / 2;
    lower = Math.max(0, mid - 0.3);
    upper = Math.min(4, mid + 0.3);
  }
  return [lower, upper];
}

export function GpaTrendChart({ data }: GpaTrendChartProps) {
  const validData = data.filter((d) => d.termGpa4 !== null || d.cumulativeGpa4 !== null);

  if (validData.length < 2) {
    return (
      <ChartCard title="Xu hướng GPA" description="Biểu đồ GPA học kỳ và GPA hiệu lực sau học lại/cải thiện qua các kỳ học.">
        <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">Cần ít nhất 2 học kỳ có điểm để xem xu hướng GPA.</p>
        </div>
      </ChartCard>
    );
  }

  const zoomDomain = getZoomDomain(validData);
  const latest = validData[validData.length - 1];

  // Ẩn label cumulative khi trùng với term để tránh chồng chữ
  const displayData = validData.map((d) => ({
    ...d,
    cumLabel:
      d.cumulativeGpa4 !== null &&
      d.termGpa4 !== null &&
      Math.abs(d.cumulativeGpa4 - d.termGpa4) < 0.001
        ? null
        : d.cumulativeGpa4,
  }));

  return (
    <ChartCard
      title="Xu hướng GPA"
      description="Biểu đồ GPA học kỳ và GPA hiệu lực sau học lại/cải thiện qua các kỳ học."
      summary={
        <>
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
            GPA học kỳ mới nhất: <span className="font-semibold text-sky-600">{formatGpa(latest.termGpa4)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2 py-0.5 text-xs font-medium">
            GPA hiệu lực hiện tại: <span className="font-semibold text-blue-600">{formatGpa(latest.cumulativeGpa4)}</span>
          </span>
        </>
      }
    >
      <div className="h-[280px] min-h-[280px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
            <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="shortTermName" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={zoomDomain} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v.toFixed(1)} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: "8px 12px" }}
              formatter={(value, name) => [typeof value === "number" ? formatGpa(value) : "—", name === "cumulativeGpa4" ? "GPA hiệu lực" : "GPA học kỳ"]}
              labelFormatter={(label) => `Học kỳ: ${label}`}
            />
            <Legend formatter={(v: string) => (v === "cumulativeGpa4" ? "GPA hiệu lực" : "GPA học kỳ")} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Line type="monotone" dataKey="cumulativeGpa4" name="cumulativeGpa4" stroke={chartColors.gpaCumulative} strokeWidth={3} dot={{ r: 4, fill: chartColors.gpaCumulative, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false}>
              <LabelList dataKey="cumLabel" position="top" fontSize={12} fill={chartColors.gpaCumulative} formatter={(v: unknown) => (typeof v === "number" ? v.toFixed(2) : "")} />
            </Line>
            <Line type="monotone" dataKey="termGpa4" name="termGpa4" stroke={chartColors.gpaTerm} strokeWidth={2.5} dot={{ r: 4, fill: chartColors.gpaTerm, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls={false}>
              <LabelList dataKey="termGpa4" position="top" fontSize={12} fill={chartColors.gpaTerm} formatter={(v: unknown) => (typeof v === "number" ? v.toFixed(2) : "")} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
