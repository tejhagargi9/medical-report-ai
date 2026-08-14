# AI Medical Report Analyzer

A small demo application that shows how AI can help a doctor quickly review an uploaded medical report. Upload a PDF or image of a lab report, and the app extracts the text, structures the values, summarizes the findings, and produces a downloadable PDF summary for review.

This is a demo project, not a production healthcare system. It does not provide diagnoses and does not replace professional medical judgment.

## How it works

1. **Upload** a report (PDF, PNG, JPG, or JPEG) along with a patient name and optional report type.
2. **Text extraction**
   - PDFs with a selectable text layer are parsed directly.
   - Scanned PDFs and image uploads are run through OCR.
3. **AI analysis** — the extracted text is sent to Gemini with a strict response schema and a system prompt that enforces non-diagnostic, hedged language (for example "may indicate", "can be associated with", "discuss with your doctor"). The model returns a structured summary, individual findings with status (normal, low, high, attention), possible significance, and suggested next steps.
4. **Review** — results are shown as an overall summary, findings cards, a medical values table, an AI summary section, the raw extracted text (for verification), and a doctor notes field.
5. **Export** — a formatted PDF summary can be downloaded, including the doctor's notes and a disclaimer.

## Tech stack

- Next.js (App Router) with TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide icons
- pdf-parse for PDF text extraction and page rasterization
- tesseract.js for OCR
- Gemini API for report analysis
- jsPDF for PDF generation

## Getting started

### Prerequisites

- Node.js 20.16+ or 22.3+
- A Google API key with access to the Gemini API

### Setup

```bash
npm install
```

Create a `.env.local` file in the project root:

```
GOOGLE_API_KEY=your-gemini-api-key
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    api/analyze/route.ts   API route: text extraction, OCR, and the Gemini call
    page.tsx                Single-page flow: upload, processing, results
  components/
    upload-form.tsx
    processing-screen.tsx
    results-view.tsx
    finding-card.tsx
    status-badge.tsx
    extracted-text-section.tsx
    doctor-notes.tsx
    ui/                     shadcn/ui components
  lib/
    types.ts                Shared ReportAnalysis types
    analyze-client.ts        Client helper that calls /api/analyze
    pdf.ts                    PDF summary generation
```

## Notes

- No file storage or database is used. Uploaded files are processed in memory for a single request and are not persisted.
- The Gemini model is configured to only report findings grounded in the extracted text, and is instructed never to state a diagnosis or suggest medication.
- A disclaimer is shown in the UI and included in the generated PDF: AI-generated information is intended to assist review and does not replace professional medical judgment.
