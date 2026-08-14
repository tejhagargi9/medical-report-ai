import { ExtractionMethod, ReportAnalysis } from "./types";

export type AnalyzeResult = {
  analysis: ReportAnalysis;
  extractionMethod: ExtractionMethod;
};

export async function analyzeReport(params: {
  file: File;
  patientName: string;
  reportType: string;
}): Promise<AnalyzeResult> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("patientName", params.patientName);
  formData.append("reportType", params.reportType);

  const res = await fetch("/api/analyze", { method: "POST", body: formData });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error ?? "Failed to analyze report.");
  }

  return json as AnalyzeResult;
}
