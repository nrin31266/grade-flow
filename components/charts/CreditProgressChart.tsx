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

import type { CreditTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatCredits } from "@/lib/number-format";

type CreditProgressChartProps = {
  data: CreditTrendPoint[];
};

export function CreditProgressChart({ data }: CreditProgressChartProps) {
  const validData = data.filter(
    (d) => d.earnedCredits > 0 || d.cumulativeEarnedCredits > 0,
  );

  if (validData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Tín chỉ theo học kỳ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tín chỉ đạt từng kỳ và lũy kế theo thời gian.
        </p>
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">
            Chưa có dữ liệu tín chỉ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Tín chỉ theo học kỳ</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Tín chỉ đạt từng kỳ và lũy kế theo thời gian.
      </p>

      <div className="mt-3 h-[260px] min-w-0">
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
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
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
                typeof value === "number"
                  ? formatCredits(Math.round(value))
                  : "—",
              ]}
              labelFormatter={(label) => `Học kỳ: ${label}`}
            />
            <Legend
              formatter={(value: string) =>
                value === "earnedCredits"
                  ? "TC đạt kỳ"
                  : "TC đạt lũy kế"
              }
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
            />
            <Bar
              dataKey="earnedCredits"
              name="earnedCredits"
              fill={chartColors.creditsEarned}
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              type="monotone"
              dataKey="cumulativeEarnedCredits"
              name="cumulativeEarnedCredits"
              stroke={chartColors.gpaCumulative}
              strokeWidth={3}
              dot={{ r: 3, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
