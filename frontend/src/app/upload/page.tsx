"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import { analyzeLabReport, AnalysisResponse } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await analyzeLabReport(file);
      // Store results in sessionStorage so results page can read them
      sessionStorage.setItem("labResults", JSON.stringify(results));
      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Upload Lab Report
        </h1>
        <p className="mt-2 text-slate-600">
          Upload a PDF of your lab results and we&apos;ll explain each test in
          plain English.
        </p>
      </div>

      <FileUpload onFileSelected={handleFileSelected} isLoading={isLoading} />

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Supported Formats
        </h2>
        <ul className="space-y-1 text-sm text-slate-600">
          <li>
            - Digitally-generated lab report PDFs (not scanned images)
          </li>
          <li>- Common panels: CBC, BMP, CMP, Lipid Panel, Thyroid Panel</li>
          <li>- Standard lab report formats from major labs</li>
        </ul>
      </div>
    </div>
  );
}
