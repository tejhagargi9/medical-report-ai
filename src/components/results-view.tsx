"use client";

import { useState } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FindingCard } from "@/components/finding-card";
import { ExtractedTextSection } from "@/components/extracted-text-section";
import { DoctorNotes } from "@/components/doctor-notes";
import { OverallStatusBadge, TableStatusBadge } from "@/components/status-badge";
import { ReportAnalysis, ExtractionMethod } from "@/lib/types";
import { generateSummaryPdf } from "@/lib/pdf";

type ResultsViewProps = {
  analysis: ReportAnalysis;
  extractionMethod: ExtractionMethod;
  fileUrl: string | null;
  onStartOver: () => void;
};

export function ResultsView({
  analysis,
  extractionMethod,
  fileUrl,
  onStartOver,
}: ResultsViewProps) {
  const [notes, setNotes] = useState("");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Report Analysis
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Patient: <span className="font-medium text-slate-700">{analysis.patientName}</span>
            {" · "}Report: <span className="font-medium text-slate-700">{analysis.reportType}</span>
            {" · "}Date: <span className="font-medium text-slate-700">{analysis.reportDate}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onStartOver}>
          Analyze another report
        </Button>
      </div>

      {/* Overall Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Overall Summary
          </h2>
          <OverallStatusBadge status={analysis.overallStatus} />
        </div>
        <p className="leading-relaxed text-slate-600">{analysis.summary}</p>
      </section>

      {/* Key Findings */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">
          Key Findings
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {analysis.findings.map((finding) => (
            <FindingCard key={finding.name} finding={finding} />
          ))}
        </div>
      </section>

      {/* Medical Values Table */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Medical Values
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Reference Range</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analysis.findings.map((f) => (
              <TableRow key={f.name}>
                <TableCell className="font-medium text-slate-800">
                  {f.name}
                </TableCell>
                <TableCell>{f.value}</TableCell>
                <TableCell className="text-slate-500">{f.unit}</TableCell>
                <TableCell className="text-slate-500">
                  {f.referenceRange}
                </TableCell>
                <TableCell>
                  <TableStatusBadge status={f.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* AI Summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          AI Summary
        </h2>

        <div className="flex flex-col gap-5">
          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-slate-700">
              What the report shows
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
              {analysis.summary}
            </p>
          </div>

          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-slate-700">
              Important findings
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-600">
              {analysis.importantFindings.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-slate-700">
              What they may indicate
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-600">
              {analysis.possibleSignificance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-1.5 text-sm font-semibold text-slate-700">
              Suggested next steps
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-600">
              {analysis.suggestedNextSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ExtractedTextSection
        text={analysis.extractedText}
        method={extractionMethod}
        fileUrl={fileUrl}
      />

      <DoctorNotes notes={notes} onNotesChange={setNotes} />

      <div className="flex justify-center">
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => generateSummaryPdf(analysis, notes)}
        >
          <Download className="size-4" />
          Download Summary PDF
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-slate-400" />
        <p>
          AI-generated information is intended to assist review and does not
          replace professional medical judgment. Verify important findings
          against the original report.
        </p>
      </div>
    </div>
  );
}
