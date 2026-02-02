"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({
  onFileSelected,
  isLoading,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading,
  });

  const handleAnalyze = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : selectedFile
              ? "border-green-300 bg-green-50"
              : "border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/50"
        } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-12 w-12 text-green-600" />
            <div>
              <p className="font-medium text-slate-800">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-12 w-12 text-slate-400" />
            <div>
              <p className="font-medium text-slate-700">
                {isDragActive
                  ? "Drop your lab report here"
                  : "Drag & drop your lab report PDF"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                or click to browse (PDF only, max 10 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing your lab results...
            </span>
          ) : (
            "Analyze Lab Report"
          )}
        </button>
      )}
    </div>
  );
}
