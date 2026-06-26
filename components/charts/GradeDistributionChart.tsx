"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import type { GradeDistributionItem } from "@/lib/dashboard-charts";
import { chartColors, getLetterGradeChartColor } from "@/lib/chart-colors";
import { formatCredits } from "@/lib/number-format";

type GradeDistributionChartProps = {
  data: GradeDistributionItem[];
};

export function GradeDistributionChart({
  data,
}: GradeDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Phân bố điểm chữ</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Số lượt học theo điểm chữ.
        </p>
        <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed bg-muted/40">
          <p className="text-sm text-muted-foreground">
            Chưa có điểm chữ để thống kê.
          </p>
        </div>
      </div>
    );
  }

  const displayOrder = ["A", "B+", "B", "C+", "C", "D+", "D", "F", "Khác"];
  const sorted = [...data].sort((a, b) => {
    const aIdx = displayOrder.indexOf(a.letterGrade);
    const bIdx = displayOrder.indexOf(b.letterGrade);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  const maxCount = Math.max(...sorted.map((d) => d.count), 1);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">Phân bố điểm chữ</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Số lượt học theo điểm chữ.
      </p>

      <div className="mt-3 h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
            layout="vertical"
          >
            <CartesianGrid
              stroke={chartColors.grid}
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              domain={[0, maxCount + 1]}
            />
            <YAxis
              type="category"
              dataKey="letterGrade"
              tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "8px 12px",
              }}
              formatter={(_value, _name, props) => {
                const p = props?.payload as
                  | GradeDistributionItem
                  | undefined;
                if (!p) return ["—"];
                return [
                  `${p.count} lượt · ${formatCredits(p.credits)} tín chỉ`,
                  p.letterGrade,
                ];
              }}
            />
            <Bar
              dataKey="count"
              name="Số lượt học"
              radius={[0, 4, 4, 0]}
              barSize={20}
              label={{
                position: "right",
                fontSize: 11,
                fill: "#64748b",
                fontWeight: 500,
                formatter: (value) => (typeof value === "number" && value > 0 ? value : ""),
              }}
            >
              {sorted.map((entry) => (
                <Cell
                  key={entry.letterGrade}
                  fill={getLetterGradeChartColor(entry.letterGrade)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
