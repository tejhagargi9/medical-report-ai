"use client";

import { useState } from "react";
import { ChevronDown, Copy, Check, ScanLine, FileText } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button, buttonVariants } from "@/components/ui/button";
import { ExtractionMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

type ExtractedTextSectionProps = {
  text: string;
  method: ExtractionMethod;
  fileUrl: string | null;
};

export function ExtractedTextSection({
  text,
  method,
  fileUrl,
}: ExtractedTextSectionProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Extracted Text
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              {method === "ocr" ? (
                <ScanLine className="size-3" />
              ) : (
                <FileText className="size-3" />
              )}
              {method === "ocr" ? "OCR" : "PDF text extraction"}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-5 text-slate-400 transition-transform",
              open && "rotate-180"
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-4 flex flex-col gap-3">
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-700">
              {text}
            </pre>
            <div className="flex flex-wrap gap-2">
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  View Original Report
                </a>
              )}
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied" : "Copy Extracted Text"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
