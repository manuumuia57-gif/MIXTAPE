import fs from 'node:fs';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { VaultDocument } from '../src/types/vault';

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

function getQuestionsForDepartment(doc: VaultDocument): { sectionA: string[]; sectionB: string[] } {
  const code = doc.departmentCode;
  if (code === 'CSC' || code === 'SEN' || code === 'BIT') {
    return {
      sectionA: [
        `Q1 (a) Define the fundamental architectural concepts covered in ${doc.courseCode}: ${doc.courseName}. [6 marks]`,
        `Q1 (b) Analyze the time and space complexity trade-offs of two primary algorithms or system designs in this unit. [8 marks]`,
        `Q1 (c) Given a distributed concurrent workload, identify three failure modes and explain how transactional invariants prevent state corruption. [6 marks]`,
        `Q1 (d) Illustrate with clean pseudocode or protocol flow how input validation and least-privilege access control are enforced. [10 marks]`,
      ],
      sectionB: [
        `Q2. Design a normalized relational schema (to 3NF / BCNF) or modular component architecture for an institutional digital library supporting 50,000 concurrent queries. Justify indexing strategies and caching boundaries. [20 marks]`,
        `Q3. Compare deterministic scheduling, lock-free concurrency, and eventual consistency models. Provide worked complexity bounds and trace an execution step-by-step. [20 marks]`,
        `Q4. Evaluate security threats against academic document repositories including spoofed MIME uploads, privilege escalation, and replay attacks. Propose server-side mitigations. [20 marks]`,
      ],
    };
  }
  if (code === 'EEE' || code === 'CVE') {
    return {
      sectionA: [
        `Q1 (a) State the governing physical laws and boundary assumptions applicable to ${doc.courseName} (${doc.courseCode}). [6 marks]`,
        `Q1 (b) Derive the steady-state transfer function or structural equilibrium equation for a loaded two-node system. [10 marks]`,
        `Q1 (c) Calculate safety factors and maximum permissible tolerances under peak transient load conditions. [14 marks]`,
      ],
      sectionB: [
        `Q2. A three-stage engineering system operates under variable harmonic excitation. Determine natural frequencies, damping ratios, and design a stabilization compensator. [20 marks]`,
        `Q3. Using limit-state design or Laplace domain analysis, evaluate structural integrity and sketch complete response diagrams with critical inflection coordinates. [20 marks]`,
        `Q4. Discuss instrumentation calibration, error propagation, and environmental resilience standards required for field deployment. [20 marks]`,
      ],
    };
  }
  if (code === 'MAT' || code === 'PHY' || code === 'BCH') {
    return {
      sectionA: [
        `Q1 (a) State and prove the primary theorem or biochemical kinetic law studied in ${doc.courseCode}. [8 marks]`,
        `Q1 (b) Solve the given initial-value system / reaction equilibrium and interpret the physical stability of each solution branch. [12 marks]`,
        `Q1 (c) Compute variance bounds or thermodynamic free-energy changes from the experimental dataset provided in Table 1. [10 marks]`,
      ],
      sectionB: [
        `Q2. Perform a complete analytical derivation of the governing operator equation and verify orthogonality across the first three eigenmodes. [20 marks]`,
        `Q3. Design a controlled laboratory assay or statistical hypothesis test at alpha = 0.01 to distinguish competing mechanistic hypotheses. [20 marks]`,
        `Q4. Discuss boundary-layer perturbations and non-ideal corrections when scaling laboratory observations to real systems. [20 marks]`,
      ],
    };
  }
  return {
    sectionA: [
      `Q1 (a) Distinguish the core theoretical models and empirical assumptions in ${doc.courseName} (${doc.courseCode}). [8 marks]`,
      `Q1 (b) Using comparative statics or discounted cash flow analysis, evaluate how an exogenous policy shock shifts market equilibrium. [12 marks]`,
      `Q1 (c) Interpret regression coefficients, standard errors, and heteroskedasticity diagnostics from a sample panel dataset. [10 marks]`,
    ],
    sectionB: [
      `Q2. Construct an econometric or valuation model for an institutional capital project over a 5-year horizon. Compute NPV, IRR, and sensitivity bounds. [20 marks]`,
      `Q3. Critically examine monetary transmission channels and welfare deadweight loss under imperfect competition. Support with labeled diagrams. [20 marks]`,
      `Q4. Evaluate governance controls, IFRS disclosure obligations, and risk-adjusted return metrics for enterprise decision-making. [20 marks]`,
    ],
  };
}

export async function ensureDemoPdfFile(doc: VaultDocument): Promise<string> {
  ensureDir(GENERATED_DIR);
  const filePath = path.join(GENERATED_DIR, doc.storedFilename);
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const navy = rgb(0.078, 0.129, 0.239); // #14213D
  const royal = rgb(0.145, 0.388, 0.922); // #2563EB
  const gold = rgb(0.75, 0.54, 0.04);
  const slate = rgb(0.28, 0.33, 0.41);
  const dark = rgb(0.1, 0.12, 0.16);

  // Page 1: Cover / Instructions / Section A
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header bar
  page1.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: navy });
  page1.drawRectangle({ x: 0, y: height - 96, width, height: 4, color: gold });

  page1.drawText('CAMPUS EXAM VAULT  |  DEMONSTRATION ARCHIVE', {
    x: 48,
    y: height - 34,
    size: 10,
    font: fontBold,
    color: rgb(0.95, 0.78, 0.3),
  });
  page1.drawText(`${doc.institutionName}`, {
    x: 48,
    y: height - 54,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page1.drawText(`${doc.facultyName}  -  Department of ${doc.departmentName}`, {
    x: 48,
    y: height - 74,
    size: 10,
    font: fontRegular,
    color: rgb(0.84, 0.88, 0.95),
  });

  // Course & Metadata box
  let y = height - 130;
  page1.drawText(`${doc.courseCode}: ${doc.courseName}`, {
    x: 48,
    y,
    size: 18,
    font: fontBold,
    color: navy,
  });
  y -= 22;
  page1.drawText(`${doc.title}`, {
    x: 48,
    y,
    size: 12,
    font: fontBold,
    color: royal,
  });
  y -= 24;

  const metaLines = [
    `Accession ID: ${doc.accessionNumber}    |    Academic Year: ${doc.academicYear}    |    ${doc.semester}`,
    `Programme: ${doc.programmeName}`,
    `Category: ${doc.category}    |    Lecturer / Source: ${doc.lecturerName}`,
    `Verification Label: ${doc.verificationLevel.replace(/_/g, ' ').toUpperCase()} (Demonstration Sample)`,
  ];
  for (const ml of metaLines) {
    page1.drawText(ml, { x: 48, y, size: 9.5, font: fontRegular, color: slate });
    y -= 15;
  }

  // Divider
  y -= 6;
  page1.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.82, 0.86, 0.91) });
  y -= 22;

  // Instructions / Description
  page1.drawText(
    doc.category === 'Marking Schemes'
      ? 'MARKING RUBRIC & SOLUTION GUIDELINES (DEMONSTRATION SAMPLE)'
      : doc.category === 'Revision Materials' || doc.category === 'Lecture Notes' || doc.category === 'Study Guides'
      ? 'REVISION SUMMARY & STUDY GUIDE OVERVIEW (DEMONSTRATION SAMPLE)'
      : 'INSTRUCTIONS TO CANDIDATES (DEMONSTRATION SAMPLE)',
    { x: 48, y, size: 11, font: fontBold, color: navy }
  );
  y -= 18;

  const instructions =
    doc.category === 'Marking Schemes'
      ? [
          '1. Award marks strictly for valid logical steps even when an alternative correct derivation is used.',
          '2. Verify verification status: check whether this rubric is Official or Community-submitted before relying on it.',
          '3. Total possible score: 100 marks (Section A: 30 marks compulsory; Section B: Answer any TWO from three questions).',
        ]
      : [
          '1. Time Allowed: THREE (3) HOURS. Answer Question 1 (Compulsory) and any TWO questions from Section B.',
          '2. Show all analytical derivations, complexity proofs, diagrams, and numerical units clearly.',
          '3. Notice: This PDF is a realistic demonstration document generated by Campus Exam Vault for preview testing.',
        ];

  for (const inst of instructions) {
    for (const line of wrapLines(inst, 86)) {
      page1.drawText(line, { x: 48, y, size: 10, font: fontRegular, color: dark });
      y -= 15;
    }
    y -= 4;
  }

  y -= 10;
  page1.drawLine({ start: { x: 48, y }, end: { x: width - 48, y }, thickness: 1, color: rgb(0.82, 0.86, 0.91) });
  y -= 24;

  const questions = getQuestionsForDepartment(doc);

  page1.drawText('SECTION A  —  COMPULSORY FOUNDATIONS (30 MARKS)', {
    x: 48,
    y,
    size: 11.5,
    font: fontBold,
    color: navy,
  });
  y -= 20;

  for (const q of questions.sectionA) {
    for (const line of wrapLines(q, 84)) {
      page1.drawText(line, { x: 48, y, size: 10.5, font: fontRegular, color: dark });
      y -= 16;
    }
    if (doc.category === 'Marking Schemes') {
      const rubricLine = '   Marking Key: Award 60% for formal definition/equation setup, 40% for worked justification & edge-case verification.';
      for (const line of wrapLines(rubricLine, 84)) {
        page1.drawText(line, { x: 56, y, size: 9.5, font: fontItalic, color: royal });
        y -= 14;
      }
    }
    y -= 8;
  }

  page1.drawText('Demonstration Document  ·  Page 1 of 2  ·  Campus Exam Vault', {
    x: 48,
    y: 32,
    size: 8.5,
    font: fontItalic,
    color: slate,
  });

  // Page 2: Section B + Revision Notes
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  let y2 = height - 60;

  page2.drawText(`${doc.courseCode} — ${doc.title}`, {
    x: 48,
    y: y2,
    size: 10,
    font: fontBold,
    color: slate,
  });
  y2 -= 12;
  page2.drawLine({ start: { x: 48, y: y2 }, end: { x: width - 48, y: y2 }, thickness: 0.75, color: rgb(0.82, 0.86, 0.91) });
  y2 -= 28;

  page2.drawText('SECTION B  —  ANALYTICAL & APPLIED PROBLEMS (ANSWER ANY TWO · 40 MARKS)', {
    x: 48,
    y: y2,
    size: 11.5,
    font: fontBold,
    color: navy,
  });
  y2 -= 22;

  for (const q of questions.sectionB) {
    for (const line of wrapLines(q, 84)) {
      page2.drawText(line, { x: 48, y: y2, size: 10.5, font: fontRegular, color: dark });
      y2 -= 16;
    }
    if (doc.category === 'Marking Schemes') {
      const rubric = '   Solution Notes: Full credit requires explicit assumptions, intermediate steps, and clear final boundary validation.';
      for (const line of wrapLines(rubric, 84)) {
        page2.drawText(line, { x: 56, y: y2, size: 9.5, font: fontItalic, color: royal });
        y2 -= 14;
      }
    }
    y2 -= 12;
  }

  y2 -= 12;
  page2.drawRectangle({
    x: 48,
    y: y2 - 86,
    width: width - 96,
    height: 86,
    color: rgb(0.957, 0.969, 0.984),
    borderColor: rgb(0.82, 0.86, 0.91),
    borderWidth: 1,
  });

  page2.drawText('ARCHIVAL METADATA & INTEGRITY NOTICE', {
    x: 62,
    y: y2 - 22,
    size: 9.5,
    font: fontBold,
    color: navy,
  });
  for (const [idx, line] of wrapLines(
    `Description: ${doc.description} This demonstration sample is provided solely for academic exploration inside Campus Exam Vault and does not represent an official examination paper from a real-world university.`,
    82
  ).entries()) {
    page2.drawText(line, { x: 62, y: y2 - 40 - idx * 13, size: 8.8, font: fontRegular, color: slate });
  }

  page2.drawText('Demonstration Document  ·  Page 2 of 2  ·  END OF EXAMINATION PAPER', {
    x: 48,
    y: 32,
    size: 8.5,
    font: fontItalic,
    color: slate,
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}
