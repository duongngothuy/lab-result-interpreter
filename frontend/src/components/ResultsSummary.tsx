"use client";

interface ResultsSummaryProps {
  summary: string;
  disclaimer: string;
  normalCount: number;
  abnormalCount: number;
  criticalCount: number;
}

export default function ResultsSummary({
  summary,
  disclaimer,
  normalCount,
  abnormalCount,
  criticalCount,
}: ResultsSummaryProps) {
  const total = normalCount + abnormalCount + criticalCount;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{normalCount}</div>
          <div className="text-sm text-green-600">Normal</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">
            {abnormalCount}
          </div>
          <div className="text-sm text-amber-600">Abnormal</div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
          <div className="text-sm text-red-600">Critical</div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="mb-2 text-lg font-semibold text-blue-800">
          Overall Summary
        </h2>
        <p className="text-sm leading-relaxed text-blue-900">{summary}</p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold">Disclaimer:</span> {disclaimer}
        </p>
      </div>
    </div>
  );
}
