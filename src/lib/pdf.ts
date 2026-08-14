import jsPDF from "jspdf";
import { ReportAnalysis } from "./types";

const MARGIN = 15;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function generateSummaryPdf(analysis: ReportAnalysis, doctorNotes: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const addSpace = (h: number) => {
    y += h;
    if (y > 275) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const heading = (text: string) => {
    addSpace(4);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(text, MARGIN, y);
    addSpace(1.5);
    doc.setDrawColor(200);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    addSpace(6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
  };

  const paragraph = (text: string) => {
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    doc.text(lines, MARGIN, y);
    addSpace(lines.length * 5 + 3);
  };

  const bulletList = (items: string[]) => {
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH);
      doc.text(lines, MARGIN, y);
      addSpace(lines.length * 5);
    });
    addSpace(3);
  };

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AI Medical Report Summary", MARGIN, y);
  addSpace(10);

  heading("Patient Information");
  doc.text(`Name: ${analysis.patientName}`, MARGIN, y);
  addSpace(6);
  doc.text(`Report Type: ${analysis.reportType}`, MARGIN, y);
  addSpace(6);
  doc.text(`Date: ${analysis.reportDate}`, MARGIN, y);
  addSpace(8);

  heading("Overall Summary");
  doc.text(`Overall: ${analysis.overallStatus}`, MARGIN, y);
  addSpace(6);
  paragraph(analysis.summary);

  heading("Key Findings");
  bulletList(analysis.importantFindings);

  heading("Medical Values");
  const colX = [MARGIN, MARGIN + 45, MARGIN + 90, MARGIN + 110, MARGIN + 155];
  doc.setFont("helvetica", "bold");
  doc.text("Test", colX[0], y);
  doc.text("Result", colX[1], y);
  doc.text("Unit", colX[2], y);
  doc.text("Reference", colX[3], y);
  doc.text("Status", colX[4], y);
  addSpace(5);
  doc.setDrawColor(220);
  doc.line(MARGIN, y - 3, PAGE_WIDTH - MARGIN, y - 3);
  doc.setFont("helvetica", "normal");
  analysis.findings.forEach((f) => {
    doc.text(f.name, colX[0], y);
    doc.text(f.value, colX[1], y);
    doc.text(f.unit, colX[2], y);
    doc.text(f.referenceRange, colX[3], y, { maxWidth: 40 });
    doc.text(f.status, colX[4], y);
    addSpace(6);
  });
  addSpace(2);

  heading("AI Interpretation");
  paragraph("What the report shows: " + analysis.summary);
  doc.setFont("helvetica", "bold");
  doc.text("Possible significance:", MARGIN, y);
  addSpace(6);
  doc.setFont("helvetica", "normal");
  bulletList(analysis.possibleSignificance);

  heading("Suggested Next Steps");
  bulletList(analysis.suggestedNextSteps);

  heading("Doctor Notes");
  paragraph(doctorNotes.trim().length > 0 ? doctorNotes : "No notes added.");

  heading("Disclaimer");
  doc.setFont("helvetica", "italic");
  paragraph(
    "AI-generated analysis is for assistance only and should be verified against the original report and interpreted by a qualified healthcare professional."
  );

  const fileName = `${analysis.patientName.replace(/\s+/g, "_")}_AI_Summary.pdf`;
  doc.save(fileName);
}
