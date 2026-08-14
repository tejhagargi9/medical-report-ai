"use client";

import { useRef, useState } from "react";
import { FileUp, FileText, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const REPORT_TYPES = ["Blood Test", "Scan", "Prescription", "Other"];

type UploadFormProps = {
  onAnalyze: (params: {
    file: File;
    patientName: string;
    reportType: string;
  }) => void;
  error?: string | null;
};

export function UploadForm({ onAnalyze, error }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [reportType, setReportType] = useState("Blood Test");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selected = files[0];
    if (!ACCEPTED_TYPES.includes(selected.type)) return;
    setFile(selected);
  };

  const isImage = file?.type.startsWith("image/");
  const canAnalyze = file !== null && patientName.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          AI Medical Report Analyzer
        </h1>
        <p className="mt-2 text-slate-500">
          Upload a medical report to extract, understand, and summarize its
          key findings.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white px-6 py-14 text-center transition-colors",
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {file ? (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              {isImage ? (
                <ImageIcon className="size-6" />
              ) : (
                <FileText className="size-6" />
              )}
            </div>
            <p className="font-medium text-slate-800">{file.name}</p>
            <p className="text-sm text-slate-400">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-slate-500"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="size-4" />
              Remove file
            </Button>
          </>
        ) : (
          <>
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <FileUp className="size-6" />
            </div>
            <p className="font-medium text-slate-800">
              Upload your medical report
            </p>
            <p className="text-sm text-slate-500">Drag & drop or browse</p>
            <p className="text-xs text-slate-400">PDF, PNG, JPG, JPEG</p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="patient-name">Patient Name</Label>
          <Input
            id="patient-name"
            placeholder="Enter patient name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="report-type">Report Type (optional)</Label>
          <Select
            value={reportType}
            onValueChange={(value) => value && setReportType(value)}
          >
            <SelectTrigger id="report-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="lg"
          disabled={!canAnalyze}
          className="mt-2 bg-blue-600 hover:bg-blue-700"
          onClick={() =>
            file && onAnalyze({ file, patientName: patientName.trim(), reportType })
          }
        >
          Analyze Report
        </Button>
      </div>
    </div>
  );
}
