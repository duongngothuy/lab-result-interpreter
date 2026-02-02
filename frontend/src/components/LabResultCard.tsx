"use client";

import type { LabResult } from "@/lib/api";
import StatusBadge from "./StatusBadge";

interface LabResultCardProps {
  result: LabResult;
}

export default function LabResultCard({ result }: LabResultCardProps) {
  const borderColor =
    result.status === "critical"
      ? "border-l-red-500"
      : result.status === "abnormal"
        ? "border-l-amber-500"
        : "border-l-green-500";

  return (
    <div
      className={`rounded-lg border border-slate-200 border-l-4 ${borderColor} bg-white p-5 shadow-sm`}
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-slate-800">
          {result.test_name}
        </h3>
        <StatusBadge status={result.status} />
      </div>

      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div>
          <span className="text-slate-500">Value: </span>
          <span className="font-medium text-slate-800">
            {result.value} {result.unit}
          </span>
        </div>
        <div>
          <span className="text-slate-500">Reference: </span>
          <span className="font-medium text-slate-800">
            {result.reference_range} {result.unit}
          </span>
        </div>
      </div>

      {result.explanation && (
        <p className="text-sm leading-relaxed text-slate-600">
          {result.explanation}
        </p>
      )}
    </div>
  );
}
