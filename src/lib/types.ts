export type FindingStatus = "normal" | "low" | "high" | "attention";

export type Finding = {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: FindingStatus;
  explanation: string;
};

export type OverallStatus = "Normal" | "Needs Review" | "Attention Required";

export type ReportAnalysis = {
  patientName: string;
  reportType: string;
  reportDate: string;
  overallStatus: OverallStatus;
  summary: string;

  findings: Finding[];

  importantFindings: string[];
  possibleSignificance: string[];
  suggestedNextSteps: string[];

  extractedText: string;
};

export type ExtractionMethod = "pdf-text" | "ocr";

export type ExtractionResult = {
  method: ExtractionMethod;
  text: string;
};

export type UploadedFile = {
  file: File;
  previewUrl: string;
};
