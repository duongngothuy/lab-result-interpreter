"use client";

import type { LabResult } from "@/lib/api";

interface StatisticsSummaryProps {
  results: LabResult[];
}

interface CategoryStats {
  name: string;
  total: number;
  normal: number;
  abnormal: number;
  critical: number;
}

// Categorize tests
const TEST_CATEGORIES: Record<string, string[]> = {
  "Blood Count (CBC)": [
    "White Blood Cell Count",
    "Red Blood Cell Count",
    "Hemoglobin",
    "Hematocrit",
    "Platelet Count",
    "Mean Corpuscular Volume",
    "Mean Corpuscular Hemoglobin",
    "Mean Corpuscular Hemoglobin Concentration",
    "Red Cell Distribution Width",
  ],
  "Metabolic Panel": [
    "Glucose",
    "Blood Urea Nitrogen",
    "Creatinine",
    "Sodium",
    "Potassium",
    "Chloride",
    "Carbon Dioxide",
    "Calcium",
    "Total Protein",
    "Albumin",
    "Estimated GFR",
  ],
  "Liver Function": [
    "Total Bilirubin",
    "Alkaline Phosphatase",
    "Aspartate Aminotransferase (AST)",
    "Alanine Aminotransferase (ALT)",
  ],
  "Lipid Panel": [
    "Total Cholesterol",
    "HDL Cholesterol",
    "LDL Cholesterol",
    "Triglycerides",
    "VLDL Cholesterol",
  ],
  Thyroid: [
    "Thyroid Stimulating Hormone",
    "Free T4",
    "Free T3",
    "Thyroxine (T4)",
    "Triiodothyronine (T3)",
  ],
  Other: [],
};

function categorizeTest(testName: string): string {
  for (const [category, tests] of Object.entries(TEST_CATEGORIES)) {
    if (tests.includes(testName)) {
      return category;
    }
  }
  return "Other";
}

export default function StatisticsSummary({ results }: StatisticsSummaryProps) {
  // Calculate statistics
  const total = results.length;
  const normalCount = results.filter((r) => r.status === "normal").length;
  const abnormalCount = results.filter((r) => r.status === "abnormal").length;
  const criticalCount = results.filter((r) => r.status === "critical").length;

  const normalPct = total > 0 ? ((normalCount / total) * 100).toFixed(1) : "0";
  const abnormalPct = total > 0 ? ((abnormalCount / total) * 100).toFixed(1) : "0";
  const criticalPct = total > 0 ? ((criticalCount / total) * 100).toFixed(1) : "0";

  // Category breakdown
  const categoryStats: CategoryStats[] = [];
  const categoryMap = new Map<string, CategoryStats>();

  for (const result of results) {
    const category = categorizeTest(result.test_name);
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        total: 0,
        normal: 0,
        abnormal: 0,
        critical: 0,
      });
    }
    const stats = categoryMap.get(category)!;
    stats.total++;
    if (result.status === "normal") stats.normal++;
    else if (result.status === "abnormal") stats.abnormal++;
    else if (result.status === "critical") stats.critical++;
  }

  categoryMap.forEach((value) => categoryStats.push(value));
  categoryStats.sort((a, b) => b.total - a.total);

  // Find most concerning results (abnormal/critical furthest from range)
  const concerningResults = results
    .filter((r) => r.status !== "normal")
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          Key Statistics
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-800">{total}</div>
            <div className="text-xs text-slate-500">Total Tests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{normalPct}%</div>
            <div className="text-xs text-slate-500">Normal Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{abnormalPct}%</div>
            <div className="text-xs text-slate-500">Abnormal Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{criticalPct}%</div>
            <div className="text-xs text-slate-500">Critical Rate</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          Results by Category
        </h3>
        <div className="space-y-3">
          {categoryStats.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">{cat.name}</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                  {cat.total} tests
                </span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">{cat.normal} normal</span>
                {cat.abnormal > 0 && (
                  <span className="text-amber-600">{cat.abnormal} abnormal</span>
                )}
                {cat.critical > 0 && (
                  <span className="text-red-600">{cat.critical} critical</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concerning Results */}
      {concerningResults.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-3 text-sm font-semibold text-amber-800">
            Results Requiring Attention
          </h3>
          <ul className="space-y-2 text-sm">
            {concerningResults.map((r, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-amber-900">{r.test_name}</span>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-amber-900">
                    {r.value} {r.unit}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.status === "critical"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
