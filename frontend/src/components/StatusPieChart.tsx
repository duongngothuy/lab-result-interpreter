"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusPieChartProps {
  normalCount: number;
  abnormalCount: number;
  criticalCount: number;
}

const COLORS = {
  normal: "#22c55e",
  abnormal: "#f59e0b",
  critical: "#ef4444",
};

export default function StatusPieChart({
  normalCount,
  abnormalCount,
  criticalCount,
}: StatusPieChartProps) {
  const data = [
    { name: "Normal", value: normalCount, color: COLORS.normal },
    { name: "Abnormal", value: abnormalCount, color: COLORS.abnormal },
    { name: "Critical", value: criticalCount, color: COLORS.critical },
  ].filter((d) => d.value > 0);

  const total = normalCount + abnormalCount + criticalCount;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-4 text-center text-sm font-semibold text-slate-700">
        Results Distribution
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const item = payload[0].payload;
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                return (
                  <div className="rounded border border-slate-200 bg-white px-3 py-2 text-sm shadow">
                    <p className="font-medium">{item.name}</p>
                    <p>{item.value} tests ({pct}%)</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
