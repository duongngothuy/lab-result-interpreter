"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResponse } from "@/lib/api";
import LabResultCard from "@/components/LabResultCard";
import ResultsSummary from "@/components/ResultsSummary";
import StatusPieChart from "@/components/StatusPieChart";
import ResultsBarChart from "@/components/ResultsBarChart";
import StatisticsSummary from "@/components/StatisticsSummary";
import { ArrowLeft } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("labResults");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push("/upload");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-slate-500">Loading results...</div>
      </div>
    );
  }

  const normalCount = data.lab_results.filter(
    (r) => r.status === "normal"
  ).length;
  const abnormalCount = data.lab_results.filter(
    (r) => r.status === "abnormal"
  ).length;
  const criticalCount = data.lab_results.filter(
    (r) => r.status === "critical"
  ).length;

  // Sort: critical first, then abnormal, then normal
  const sortedResults = [...data.lab_results].sort((a, b) => {
    const order = { critical: 0, abnormal: 1, normal: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => router.push("/upload")}
          className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Upload Another
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Your Results</h1>
        <div className="w-[120px]" />
      </div>

      {/* AI Summary */}
      <ResultsSummary
        summary={data.summary}
        disclaimer={data.disclaimer}
        normalCount={normalCount}
        abnormalCount={abnormalCount}
        criticalCount={criticalCount}
      />

      {/* Data Visualizations */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Data Analysis
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <StatusPieChart
            normalCount={normalCount}
            abnormalCount={abnormalCount}
            criticalCount={criticalCount}
          />
          <ResultsBarChart results={data.lab_results} />
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Statistical Summary
        </h2>
        <StatisticsSummary results={data.lab_results} />
      </div>

      {/* Detailed Results */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Detailed Results ({data.lab_results.length} tests)
        </h2>
        {sortedResults.map((result, index) => (
          <LabResultCard key={`${result.test_name}-${index}`} result={result} />
        ))}
      </div>
    </div>
  );
}
