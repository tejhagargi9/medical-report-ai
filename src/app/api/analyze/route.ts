import { NextRequest, NextResponse } from "next/server";
import { ExtractionMethod, Finding, ReportAnalysis } from "@/lib/types";

export const runtime = "nodejs";
// OCR + Gemini can take longer than Vercel's default 10s function timeout.
export const maxDuration = 60;

const PDF_TYPE = "application/pdf";
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MIN_TEXT_LENGTH = 30;
// Kept under Vercel's serverless request body limit (~4.5MB).
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const GEMINI_MODEL = "gemini-3.1-flash-lite";

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    overallStatus: {
      type: "string",
      enum: ["Normal", "Needs Review", "Attention Required"],
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
          unit: { type: "string" },
          referenceRange: { type: "string" },
          status: { type: "string", enum: ["normal", "low", "high", "attention"] },
          explanation: { type: "string" },
        },
        required: ["name", "value", "unit", "referenceRange", "status", "explanation"],
      },
    },
    importantFindings: { type: "array", items: { type: "string" } },
    possibleSignificance: { type: "array", items: { type: "string" } },
    suggestedNextSteps: { type: "array", items: { type: "string" } },
  },
  required: [
    "summary",
    "overallStatus",
    "findings",
    "importantFindings",
    "possibleSignificance",
    "suggestedNextSteps",
  ],
};

type GeminiAnalysis = {
  summary: string;
  overallStatus: ReportAnalysis["overallStatus"];
  findings: Finding[];
  importantFindings: string[];
  possibleSignificance: string[];
  suggestedNextSteps: string[];
};

const SYSTEM_PROMPT = `You are a clinical report structuring assistant helping a doctor quickly review a medical report. You are NOT a doctor and must not present yourself as one.

Rules you must follow:
- Never state or imply a definitive diagnosis (e.g. do not say "you have anemia").
- Never prescribe medication, dosages, or treatment.
- Use hedged, non-prescriptive language: "may indicate", "can be associated with", "may require further evaluation", "discuss with your doctor".
- Base every finding strictly on values actually present in the report text. Do not invent test results.
- For each finding, include the exact value and reference range as written in the report.
- "status" must be "normal" when the value is within the stated reference range, "low"/"high" when outside it in that direction, or "attention" for values that are within a technically normal band but still clinically notable (e.g. borderline/desirable-range breaches like total cholesterol).
- "overallStatus" should be "Normal" if all values are within range, "Needs Review" if some values are mildly outside range, or "Attention Required" if there are values significantly outside range or clinically concerning combinations.
- suggestedNextSteps must be general and non-prescriptive (e.g. discuss with doctor, consider clinical correlation, repeat testing if the treating doctor recommends it) — never specific treatment instructions.

Given the extracted report text below, return the structured JSON described by the response schema.`;

function buildPrompt(extractedText: string) {
  return `${SYSTEM_PROMPT}\n\n--- EXTRACTED REPORT TEXT ---\n${extractedText}\n--- END REPORT TEXT ---`;
}

const OCR_PROMPT = `Transcribe all text visible in this image exactly as written, preserving line breaks, tables, and layout as plain text. Do not summarize, translate, explain, or add any commentary — output only the transcribed text. If the image contains no readable text, output nothing.`;

async function runOcr(buffer: Buffer, mimeType: string): Promise<string> {
  const text = await callGeminiApi([
    { text: OCR_PROMPT },
    { inlineData: { mimeType, data: buffer.toString("base64") } },
  ]);
  return text.trim();
}

async function extractFromPdf(
  buffer: Buffer
): Promise<{ text: string; method: ExtractionMethod }> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    const text = textResult.text.trim();
    if (text.length >= MIN_TEXT_LENGTH) {
      return { text, method: "pdf-text" };
    }

    // No selectable text layer — likely a scanned PDF. Rasterize the first
    // few pages and run OCR on each, same as we would for an image upload.
    const screenshots = await parser.getScreenshot({ scale: 2, first: 3 });
    const pageTexts = await Promise.all(
      screenshots.pages.map((page) => runOcr(Buffer.from(page.data), "image/png"))
    );
    return { text: pageTexts.join("\n\n").trim(), method: "ocr" };
  } finally {
    await parser.destroy();
  }
}

async function extractFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  return runOcr(buffer, mimeType);
}

const RETRYABLE_STATUS = new Set([429, 500, 503]);
const MAX_ATTEMPTS = 3;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

async function callGeminiApi(parts: GeminiPart[], responseSchema?: object): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not configured on the server.");
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          ...(responseSchema
            ? {
                generationConfig: {
                  responseMimeType: "application/json",
                  responseSchema,
                },
              }
            : {}),
        }),
      }
    );

    if (res.ok) {
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Gemini returned no content.");
      }
      return text;
    }

    const errBody = await res.text();
    lastError = new Error(`Gemini request failed (${res.status}): ${errBody.slice(0, 300)}`);

    if (!RETRYABLE_STATUS.has(res.status) || attempt === MAX_ATTEMPTS) {
      throw lastError;
    }
    await wait(500 * attempt);
  }

  throw lastError ?? new Error("Gemini request failed.");
}

async function callGemini(extractedText: string): Promise<GeminiAnalysis> {
  const text = await callGeminiApi([{ text: buildPrompt(extractedText) }], RESPONSE_SCHEMA);
  return JSON.parse(text) as GeminiAnalysis;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const patientName = String(formData.get("patientName") ?? "").trim();
    const reportType = String(formData.get("reportType") ?? "Other").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }
    if (!patientName) {
      return NextResponse.json({ error: "Patient name is required." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File is too large (max 15MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type === PDF_TYPE;
    const isImage = IMAGE_TYPES.includes(file.type);

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, PNG, JPG, or JPEG." },
        { status: 400 }
      );
    }

    let extractedText: string;
    let extractionMethod: ExtractionMethod;

    if (isPdf) {
      const result = await extractFromPdf(buffer);
      extractedText = result.text;
      extractionMethod = result.method;
    } else {
      extractedText = await extractFromImage(buffer, file.type);
      extractionMethod = "ocr";
    }

    if (extractedText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this file. If it's a scan or photo, make sure it's clear and well-lit, or try a text-based PDF instead.",
        },
        { status: 422 }
      );
    }

    const aiResult = await callGemini(extractedText);

    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const analysis: ReportAnalysis = {
      patientName,
      reportType,
      reportDate,
      overallStatus: aiResult.overallStatus,
      summary: aiResult.summary,
      findings: aiResult.findings,
      importantFindings: aiResult.importantFindings,
      possibleSignificance: aiResult.possibleSignificance,
      suggestedNextSteps: aiResult.suggestedNextSteps,
      extractedText,
    };

    return NextResponse.json({ analysis, extractionMethod });
  } catch (err) {
    console.error("analyze route failed:", err);
    const message = err instanceof Error ? err.message : "Unexpected error during analysis.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
