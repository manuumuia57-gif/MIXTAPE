import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { LibraryDocument } from '../src/types/vault';

const GENERATED_DIR = path.resolve(process.cwd(), 'uploads', 'generated');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildQuestions(doc: LibraryDocument): { sectionA: string[]; sectionB: string[] } {
  if (doc.departmentCode === 'CSC') {
    return {
      sectionA: [
        `Q1 (a) Define the core algorithmic or system principles in ${doc.courseCode}: ${doc.courseName}. [8 marks]`,
        `Q1 (b) Analyze asymptotic time and space complexity for two key operations studied in this unit. [10 marks]`,
        `Q1 (c) Write clear pseudocode or SQL/architecture diagrams illustrating correctness and edge-case handling. [12 marks]`,
      ],
      sectionB: [
        `Q2. Design a scalable, normalized system architecture for ${doc.courseName} and justify indexing and concurrency trade-offs. [20 marks]`,
        `Q3. Trace a complete step-by-step worked example on a sample dataset and prove termination and worst-case bounds. [20 marks]`,
      ],
    };
  }
  if (doc.departmentCode === 'EEE' || doc.departmentCode === 'CVE') {
    return {
      sectionA: [
        `Q1 (a) State the governing equations and physical boundary assumptions for ${doc.courseCode}. [8 marks]`,
        `Q1 (b) Derive the steady-state response or structural equilibrium conditions for the loaded model. [12 marks]`,
        `Q1 (c) Compute safety factors and permissible engineering tolerances under peak design load. [10 marks]`,
      ],
      sectionB: [
        `Q2. Analyze a multi-stage engineering system using Laplace transforms or limit-state structural equations. [20 marks]`,
        `Q3. Sketch complete response diagrams, identify critical inflection points, and verify stability criteria. [20 marks]`,
      ],
    };
  }
  return {
    sectionA: [
      `Q1 (a) State and explain the foundational definitions and theorems in ${doc.courseCode}: ${doc.courseName}. [10 marks]`,
      `Q1 (b) Solve the given analytical problem showing all intermediate derivations and units. [10 marks]`,
      `Q1 (c) Interpret the quantitative results and discuss boundary limitations. [10 marks]`,
    ],
    sectionB: [
      `Q2. Construct a comprehensive analytical solution for the applied scenario described in Section B. [20 marks]`,
      `Q3. Compare two theoretical frameworks covered in ${doc.courseName} with worked numerical examples. [20 marks]`,
    ],
  };
}

export async function ensureExamplePdfFile(doc: LibraryDocument, institutionName: string): Promise<string> {
  ensureDir(GENERATED_DIR);
  const filePath = path.join(GENERATED_DIR, doc.storedFilename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.078, 0.129, 0.239);
  const royal = rgb(0.145, 0.388, 0.922);
  const slate = rgb(0.3, 0.35, 0.43);
  const dark = rgb(0.1, 0.12, 0.16);

  const page1 = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();

  page1.drawRectangle({ x: 0, y: height - 88, width, height: 88, color: navy });
  page1.drawText('CAMPUS PAST PAPERS LIBRARY  |  EXAMPLE SAMPLE DOCUMENT', {
    x: 48,
    y: height - 32,
    size: 9.5,
    font: fontBold,
    color: rgb(0.75, 0.85, 1),
  });
  page1.drawText(institutionName, {
    x: 48,
    y: height - 52,
    size: 14,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page1.drawText(`Department of ${doc.departmentName}`, {
    x: 48,
    y: height - 70,
    size: 10,
    font: fontRegular,
    color: rgb(0.85, 0.89, 0.96),
  });

  let y = height - 124;
  page1.drawText(`${doc.courseCode}: ${doc.courseName}`, {
    x: 48,
    y,
    size: 17,
    font: fontBold,
    color: navy,
  });
  y -= 22;
  page1.drawText(doc.title, {
    x: 48,
    y,
    size: 11.5,
    font: fontBold,
    color: royal,
  });
  y -= 22;

  const meta = [
    `Academic Year: ${doc.academicYear}   |   Semester: ${doc.semester}   |   Type: ${doc.documentType}`,
    `Note: Demonstration example document for preview and download testing.`,
  ];
  for (const m of meta) {
    page1.drawText(m, { x: 48, y, size: 9.5, font: fontRegular, color: slate });
    y -= 15;
  }

  y -= 8;
  page1.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.84, 0.88, 0.92) });
  y -= 24;

  const qs = buildQuestions(doc);
  page1.drawText('SECTION A — COMPULSORY QUESTIONS (30 MARKS)', {
    x: 48,
    y,
    size: 11,
    font: fontBold,
    color: navy,
  });
  y -= 20;

  for (const q of qs.sectionA) {
    for (const line of wrapLines(q, 84)) {
      page1.drawText(line, { x: 48, y, size: 10.5, font: fontRegular, color: dark });
      y -= 16;
    }
    y -= 8;
  }

  y -= 12;
  page1.drawText('SECTION B — ANALYTICAL & APPLIED QUESTIONS (40 MARKS)', {
    x: 48,
    y,
    size: 11,
    font: fontBold,
    color: navy,
  });
  y -= 20;

  for (const q of qs.sectionB) {
    for (const line of wrapLines(q, 84)) {
      page1.drawText(line, { x: 48, y, size: 10.5, font: fontRegular, color: dark });
      y -= 16;
    }
    y -= 8;
  }

  y -= 16;
  page1.drawText('DESCRIPTION', { x: 48, y, size: 9.5, font: fontBold, color: slate });
  y -= 15;
  for (const line of wrapLines(doc.description, 88)) {
    page1.drawText(line, { x: 48, y, size: 9.5, font: fontItalic, color: slate });
    y -= 14;
  }

  page1.drawText('Campus Past Papers Library  ·  Example Demonstration File  ·  Page 1 of 1', {
    x: 48,
    y: 34,
    size: 8.5,
    font: fontItalic,
    color: slate,
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}
