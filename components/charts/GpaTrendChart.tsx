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
} from "recharts";

import type { GpaTrendPoint } from "@/lib/dashboard-charts";
import { chartColors } from "@/lib/chart-colors";
import { formatGpa } from "@/lib/number-format";

type GpaTrendChartProps = {
  data: GpaTrendPoint[];
};

export function GpaTrendChart({ data }: GpaTrendChartProps) {
  const validData = data.filter(
    (d) => d.termGpa4 !== null || d.cumulativeGpa4 !== null,
  );

  if (validData.length < 2) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Xu hướng GPA</p>
        <p className="mt-1 text-xs text-muted-foreground">
          So sánh GPA từng kỳ và GPA tích lũy hệ 4.
        </p>
        <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">
            Cần ít nhất 2 học kỳ có điểm để xem xu hướng GPA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Xu hướng GPA</p>
      <p className="mt-1 text-xs text-muted-foreground">
        So sánh GPA từng kỳ và GPA tích lũy hệ 4.
      </p>

      <div className="mt-3 h-[280px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
                value === "cumulativeGpa4"
                  ? "GPA tích lũy"
                  : "GPA từng kỳ"
              }
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="cumulativeGpa4"
              name="cumulativeGpa4"
              stroke={chartColors.gpaCumulative}
              strokeWidth={3}
              dot={{ r: 4, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: chartColors.gpaCumulative, strokeWidth: 0 }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="termGpa4"
              name="termGpa4"
              stroke={chartColors.gpaTerm}
              strokeWidth={2.5}
              strokeDasharray="5 3"
              dot={{ r: 4, fill: chartColors.gpaTerm, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: chartColors.gpaTerm, strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
