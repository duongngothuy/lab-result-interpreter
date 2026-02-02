export interface LabResult {
  test_name: string;
  value: number;
  unit: string;
  reference_range: string;
  status: "normal" | "abnormal" | "critical";
  explanation: string;
}

export interface AnalysisResponse {
  lab_results: LabResult[];
  summary: string;
  disclaimer: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeLabReport(
  file: File
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(
      error?.detail || `Analysis failed with status ${response.status}`
    );
  }

  return response.json();
}
