"use client";

import { useState } from "react";
import { UploadForm } from "@/components/upload-form";
import { ProcessingScreen } from "@/components/processing-screen";
import { ResultsView } from "@/components/results-view";
import { analyzeReport, AnalyzeResult } from "@/lib/analyze-client";

type Stage = "upload" | "processing" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestDone, setRequestDone] = useState(false);

  const handleAnalyze = async ({
    file,
    patientName,
    reportType,
  }: {
    file: File;
    patientName: string;
    reportType: string;
  }) => {
    setError(null);
    setResult(null);
    setRequestDone(false);
    setFileUrl(URL.createObjectURL(file));
    setStage("processing");

    try {
      const analyzeResult = await analyzeReport({ file, patientName, reportType });
      setResult(analyzeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("upload");
    } finally {
      setRequestDone(true);
    }
  };

  const handleProcessingComplete = () => {
    if (result) setStage("results");
  };

  const handleStartOver = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(null);
    setResult(null);
    setError(null);
    setStage("upload");
  };

  return (
    <main className="flex flex-1 flex-col px-4 py-12 sm:py-16">
      {stage === "upload" && <UploadForm onAnalyze={handleAnalyze} error={error} />}

      {stage === "processing" && (
        <ProcessingScreen done={requestDone} onComplete={handleProcessingComplete} />
      )}

      {stage === "results" && result && (
        <ResultsView
          analysis={result.analysis}
          extractionMethod={result.extractionMethod}
          fileUrl={fileUrl}
          onStartOver={handleStartOver}
        />
      )}
    </main>
  );
}
