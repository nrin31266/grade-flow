"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { GpaTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatGpa } from "@/lib/number-format";

type TermPerformanceChartProps = {
  data: GpaTrendPoint[];
};

export function TermPerformanceChart({ data }: TermPerformanceChartProps) {
  const validData = data.filter(
    (d) => d.termGpa10 !== null || d.termGpa4 !== null,
  );

  if (validData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Hiệu suất từng kỳ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          GPA hệ 10 và hệ 4 của từng học kỳ.
        </p>
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu học kỳ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Hiệu suất từng kỳ</p>
      <p className="mt-1 text-xs text-muted-foreground">
        GPA hệ 10 và hệ 4 của từng học kỳ.
      </p>

      <div className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={validData}
            margin={{ top: 8, right: 12, left: -10, bottom: 5 }}
          >
            <CartesianGrid
              stroke={chartColors.grid}
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="shortTermName"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => value.toFixed(1)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 4]}
              ticks={[0, 1, 2, 3, 4]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => value.toFixed(1)}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 12px",
              }}
              formatter={(value) => [
                typeof value === "number" ? formatGpa(value) : "—",
              ]}
              labelFormatter={(label) => `Học kỳ: ${label}`}
            />
            <Legend
              formatter={(value: string) =>
                value === "termGpa10"
                  ? "GPA hệ 10"
                  : "GPA hệ 4"
              }
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
            />
            <Bar
              yAxisId="left"
              dataKey="termGpa10"
              name="termGpa10"
              fill={chartColors.gpaTerm}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="termGpa4"
              name="termGpa4"
              stroke={chartColors.gpaCumulative}
              strokeWidth={3}
              dot={{ r: 4, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
