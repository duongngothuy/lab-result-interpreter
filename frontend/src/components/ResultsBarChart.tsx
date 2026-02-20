"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { LabResult } from "@/lib/api";

interface ResultsBarChartProps {
  results: LabResult[];
}

const COLORS = {
  normal: "#22c55e",
  abnormal: "#f59e0b",
  critical: "#ef4444",
};

export default function ResultsBarChart({ results }: ResultsBarChartProps) {
  // Calculate percentage deviation from midpoint of reference range
  const chartData = results
    .map((r) => {
      const rangeMatch = r.reference_range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
      if (!rangeMatch) return null;

      const low = parseFloat(rangeMatch[1]);
      const high = parseFloat(rangeMatch[2]);
      const midpoint = (low + high) / 2;
      const range = high - low;

      // Calculate deviation as percentage of range from midpoint
      // 0 = at midpoint, positive = above, negative = below
      const deviation = range > 0 ? ((r.value - midpoint) / (range / 2)) * 100 : 0;

      return {
        name: r.test_name.length > 15 ? r.test_name.substring(0, 12) + "..." : r.test_name,
        fullName: r.test_name,
        deviation: Math.max(-150, Math.min(150, deviation)), // Clamp to -150 to 150
        status: r.status,
        value: r.value,
        unit: r.unit,
        reference: r.reference_range,
      };
    })
    .filter(Boolean)
    .slice(0, 12); // Show top 12 for readability

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-2 text-sm font-semibold text-slate-700">
        Deviation from Reference Range Midpoint
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        0% = center of normal range, bars extending outside indicate deviation
      </p>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[-150, 150]}
              tickFormatter={(v) => `${v}%`}
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={11}
              width={75}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload[0]) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded border border-slate-200 bg-white p-2 text-xs shadow-lg">
                    <p className="font-semibold">{data.fullName}</p>
                    <p>Value: {data.value} {data.unit}</p>
                    <p>Reference: {data.reference}</p>
                    <p>Deviation: {data.deviation.toFixed(1)}%</p>
                  </div>
                );
              }}
            />
            <ReferenceLine x={-100} stroke="#fca5a5" strokeDasharray="3 3" />
            <ReferenceLine x={100} stroke="#fca5a5" strokeDasharray="3 3" />
            <ReferenceLine x={0} stroke="#94a3b8" />
            <Bar dataKey="deviation" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry?.status as keyof typeof COLORS] || COLORS.normal}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
