import {
  Course,
  Department,
  DocumentType,
  LibraryDocument,
  SiteSettings,
} from '../types/vault';

export const DOCUMENT_TYPES: DocumentType[] = [
  'Past Examination Papers',
  'CAT Papers',
  'Revision Materials',
  'Lecture Notes',
  'Assignments',
  'Practical Papers',
  'Other Study Materials',
];

export const SEMESTERS = ['Semester 1', 'Semester 2', 'Summer / Trimester 3'];

export const INITIAL_ACADEMIC_YEARS = [
  '2025/2026',
  '2024/2025',
  '2023/2024',
  '2022/2023',
  '2021/2022',
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'Campus Past Papers Library',
  institutionName: 'Northbridge University (Example Archive)',
  contactEmail: 'library-admin@northbridge-demo.edu',
  contactPhone: '+1 (555) 234-8900',
  aboutText:
    'Campus Past Papers Library is our official centralized repository for past examination papers, CATs, lecture notes, practical assessments, and revision packets. All materials are curated and maintained by the institution administrator to give students reliable, organized study access anytime.',
  copyrightText: '© 2026 Campus Past Papers Library. All institutional rights reserved.',
};

export const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept-csc',
    code: 'CSC',
    name: 'Computer Science',
    description: 'Programming, algorithms, database systems, operating systems, and cybersecurity.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'dept-eee',
    code: 'EEE',
    name: 'Electrical & Electronic Engineering',
    description: 'Circuit theory, signals and systems, power engineering, and digital electronics.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'dept-mat',
    code: 'MAT',
    name: 'Mathematics & Statistics',
    description: 'Calculus, linear algebra, differential equations, and applied probability.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'dept-bus',
    code: 'BUS',
    name: 'Business & Finance',
    description: 'Financial accounting, corporate finance, business law, and strategic management.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'dept-cve',
    code: 'CVE',
    name: 'Civil & Structural Engineering',
    description: 'Strength of materials, structural concrete design, and engineering hydrology.',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'dept-bch',
    code: 'BCH',
    name: 'Biochemistry & Life Sciences',
    description: 'Cellular biochemistry, enzymology, molecular genetics, and laboratory diagnostics.',
    createdAt: '2026-09-01T08:00:00Z',
  },
];

const COURSE_LIST: Array<{ id: string; deptId: string; code: string; name: string; desc: string }> = [
  { id: 'crs-csc101', deptId: 'dept-csc', code: 'CSC 101', name: 'Introduction to Programming', desc: 'Foundational programming logic, control structures, and memory basics.' },
  { id: 'crs-csc204', deptId: 'dept-csc', code: 'CSC 204', name: 'Data Structures & Algorithms', desc: 'Trees, graphs, hashing, sorting, and asymptotic complexity.' },
  { id: 'crs-csc312', deptId: 'dept-csc', code: 'CSC 312', name: 'Database Systems', desc: 'Relational modeling, SQL optimization, normalization, and transactions.' },
  { id: 'crs-eee210', deptId: 'dept-eee', code: 'EEE 210', name: 'Electrical Circuit Theory', desc: 'AC/DC network analysis, Laplace methods, and resonance.' },
  { id: 'crs-eee315', deptId: 'dept-eee', code: 'EEE 315', name: 'Signals & Linear Systems', desc: 'Fourier transforms, convolution, and discrete-time filtering.' },
  { id: 'crs-mat102', deptId: 'dept-mat', code: 'MAT 102', name: 'Linear Algebra I', desc: 'Vector spaces, matrices, determinants, and eigenvalues.' },
  { id: 'crs-mat204', deptId: 'dept-mat', code: 'MAT 204', name: 'Ordinary Differential Equations', desc: 'First and second-order ODEs, series solutions, and stability.' },
  { id: 'crs-bus201', deptId: 'dept-bus', code: 'BUS 201', name: 'Financial Accounting', desc: 'Balance sheets, cash flows, IFRS reporting, and ratio analysis.' },
  { id: 'crs-bus304', deptId: 'dept-bus', code: 'BUS 304', name: 'Corporate Finance', desc: 'Discounted cash flow valuation, WACC, and capital budgeting.' },
  { id: 'crs-cve205', deptId: 'dept-cve', code: 'CVE 205', name: 'Strength of Materials', desc: 'Axial stress, torsion, bending moments, and beam deflection.' },
  { id: 'crs-cve308', deptId: 'dept-cve', code: 'CVE 308', name: 'Reinforced Concrete Design', desc: 'Limit-state structural design of beams, slabs, and columns.' },
  { id: 'crs-bch215', deptId: 'dept-bch', code: 'BCH 215', name: 'Enzymology & Bioenergetics', desc: 'Enzyme kinetics, metabolic pathways, and cellular energetics.' },
];

export const SEED_COURSES: Course[] = COURSE_LIST.map((c) => {
  const dept = SEED_DEPARTMENTS.find((d) => d.id === c.deptId)!;
  return {
    id: c.id,
    departmentId: dept.id,
    departmentCode: dept.code,
    departmentName: dept.name,
    code: c.code,
    name: c.name,
    description: c.desc,
    createdAt: '2026-09-01T08:00:00Z',
  };
});

const SAMPLE_DOCS_SPEC: Array<{
  courseId: string;
  title: string;
  year: string;
  semester: string;
  type: DocumentType;
  desc: string;
  downloads: number;
  date: string;
}> = [
  {
    courseId: 'crs-csc204',
    title: 'CSC 204 End-of-Semester Examination (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example past examination paper covering binary search trees, AVL rotations, graph traversal, and dynamic programming.',
    downloads: 412,
    date: '2026-10-28T10:00:00Z',
  },
  {
    courseId: 'crs-csc312',
    title: 'CSC 312 Final Examination Paper (Example)',
    year: '2024/2025',
    semester: 'Semester 2',
    type: 'Past Examination Papers',
    desc: 'Example examination covering ER diagrams, BCNF normalization, SQL query tuning, and ACID isolation levels.',
    downloads: 389,
    date: '2026-10-26T14:20:00Z',
  },
  {
    courseId: 'crs-csc101',
    title: 'CSC 101 Continuous Assessment Test 1 (Example)',
    year: '2025/2026',
    semester: 'Semester 1',
    type: 'CAT Papers',
    desc: 'Example CAT 1 assessment on loops, functions, arrays, and introductory problem decomposition.',
    downloads: 274,
    date: '2026-11-08T09:30:00Z',
  },
  {
    courseId: 'crs-csc204',
    title: 'CSC 204 Complexity & Graph Algorithms Revision Pack (Example)',
    year: '2025/2026',
    semester: 'Semester 1',
    type: 'Revision Materials',
    desc: 'Example revision workbook summarizing Dijkstra, Kruskal, and Master Theorem recurrence derivations.',
    downloads: 325,
    date: '2026-11-11T11:15:00Z',
  },
  {
    courseId: 'crs-csc312',
    title: 'CSC 312 SQL & Indexing Lecture Notes (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Lecture Notes',
    desc: 'Example lecture notes covering B+ tree indexing, relational algebra, and transaction recovery.',
    downloads: 218,
    date: '2026-10-18T13:00:00Z',
  },
  {
    courseId: 'crs-eee210',
    title: 'EEE 210 Main Examination Paper (Example)',
    year: '2023/2024',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example examination on Thevenin equivalents, AC phasors, resonance, and Laplace circuit analysis.',
    downloads: 295,
    date: '2026-10-12T10:45:00Z',
  },
  {
    courseId: 'crs-eee315',
    title: 'EEE 315 Fourier & Z-Transform CAT Paper (Example)',
    year: '2024/2025',
    semester: 'Semester 2',
    type: 'CAT Papers',
    desc: 'Example CAT focusing on discrete convolution, pole-zero stability, and frequency response.',
    downloads: 184,
    date: '2026-11-02T15:10:00Z',
  },
  {
    courseId: 'crs-eee210',
    title: 'EEE 210 Oscilloscope & Bridge Lab Practical (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Practical Papers',
    desc: 'Example laboratory practical assessment sheet for RLC transient measurements.',
    downloads: 142,
    date: '2026-10-05T11:00:00Z',
  },
  {
    courseId: 'crs-mat102',
    title: 'MAT 102 End-of-Semester Examination (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example exam covering Gaussian elimination, vector subspaces, eigenvalues, and diagonalization.',
    downloads: 446,
    date: '2026-10-20T09:00:00Z',
  },
  {
    courseId: 'crs-mat204',
    title: 'MAT 204 Differential Equations Final Exam (Example)',
    year: '2023/2024',
    semester: 'Semester 2',
    type: 'Past Examination Papers',
    desc: 'Example paper on second-order linear ODEs, Frobenius series, and Laplace transform solutions.',
    downloads: 311,
    date: '2026-09-28T16:00:00Z',
  },
  {
    courseId: 'crs-mat102',
    title: 'MAT 102 Matrix Transformations Assignment Set (Example)',
    year: '2025/2026',
    semester: 'Semester 1',
    type: 'Assignments',
    desc: 'Example coursework assignment problems on orthogonal bases and rank-nullity theorem.',
    downloads: 165,
    date: '2026-11-06T12:00:00Z',
  },
  {
    courseId: 'crs-bus201',
    title: 'BUS 201 Financial Accounting Examination (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example examination covering income statements, balance sheet adjustments, and IFRS disclosures.',
    downloads: 267,
    date: '2026-10-15T08:30:00Z',
  },
  {
    courseId: 'crs-bus304',
    title: 'BUS 304 Corporate Valuation Past Paper (Example)',
    year: '2023/2024',
    semester: 'Semester 2',
    type: 'Past Examination Papers',
    desc: 'Example paper on NPV, IRR capital budgeting, cost of capital (WACC), and dividend policy.',
    downloads: 229,
    date: '2026-10-02T14:00:00Z',
  },
  {
    courseId: 'crs-bus304',
    title: 'BUS 304 Discounted Cash Flow Formula Sheet (Example)',
    year: '2025/2026',
    semester: 'Semester 1',
    type: 'Other Study Materials',
    desc: 'Example reference sheet summarizing annuity factors, CAPM equations, and WACC formulas.',
    downloads: 198,
    date: '2026-11-09T10:15:00Z',
  },
  {
    courseId: 'crs-cve205',
    title: 'CVE 205 Strength of Materials Past Paper (Example)',
    year: '2022/2023',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example exam on shear force, bending moment diagrams, torsion, and Mohr stress circles.',
    downloads: 204,
    date: '2026-09-21T09:45:00Z',
  },
  {
    courseId: 'crs-cve308',
    title: 'CVE 308 Reinforced Concrete Design Exam (Example)',
    year: '2024/2025',
    semester: 'Semester 2',
    type: 'Past Examination Papers',
    desc: 'Example structural engineering paper on singly reinforced beams, shear links, and column buckling.',
    downloads: 176,
    date: '2026-10-25T13:30:00Z',
  },
  {
    courseId: 'crs-bch215',
    title: 'BCH 215 Enzymology & Bioenergetics Exam (Example)',
    year: '2023/2024',
    semester: 'Semester 1',
    type: 'Past Examination Papers',
    desc: 'Example paper covering Michaelis-Menten kinetics, Lineweaver-Burk plots, and ATP synthesis.',
    downloads: 193,
    date: '2026-10-10T11:20:00Z',
  },
  {
    courseId: 'crs-bch215',
    title: 'BCH 215 Spectrophotometry Practical Protocol (Example)',
    year: '2024/2025',
    semester: 'Semester 1',
    type: 'Practical Papers',
    desc: 'Example laboratory practical guide on enzyme assay calibration and absorbance curves.',
    downloads: 138,
    date: '2026-11-04T15:40:00Z',
  },
];

export const SEED_DOCUMENTS: LibraryDocument[] = SAMPLE_DOCS_SPEC.map((spec, idx) => {
  const course = SEED_COURSES.find((c) => c.id === spec.courseId)!;
  return {
    id: `doc-${idx + 1}`,
    title: spec.title,
    departmentId: course.departmentId,
    departmentCode: course.departmentCode,
    departmentName: course.departmentName,
    courseId: course.id,
    courseCode: course.code,
    courseName: course.name,
    academicYear: spec.year,
    semester: spec.semester,
    documentType: spec.type,
    description: spec.desc,
    fileFormat: 'PDF',
    fileSizeBytes: 340000 + (idx % 6) * 115000,
    storedFilename: `example-doc-${idx + 1}.pdf`,
    originalFilename: `${course.code.replace(/\s+/g, '_')}_${spec.year.split('/')[0]}_Example.pdf`,
    downloadsCount: spec.downloads,
    isExampleSample: true,
    uploadedAt: spec.date,
    updatedAt: spec.date,
  };
});
