import {
  Announcement,
  BookmarkCollection,
  Campus,
  Course,
  Department,
  DocumentCategory,
  ExamPrepPlan,
  Faculty,
  Institution,
  PlatformSettings,
  Programme,
  UserAccount,
  VaultDocument,
  VerificationLevel,
} from '../types/vault';

export const ACADEMIC_YEARS = [
  '2025/2026',
  '2024/2025',
  '2023/2024',
  '2022/2023',
  '2021/2022',
];

export const SEMESTERS = ['Semester 1', 'Semester 2', 'Trimester 3 / Summer'];

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Past Examination Papers',
  'CAT Papers',
  'Mid-Semester Examinations',
  'End-of-Semester Examinations',
  'Supplementary Examinations',
  'Special Examinations',
  'Marking Schemes',
  'Revision Materials',
  'Lecture Notes',
  'Practical Examinations',
  'Laboratory Manuals',
  'Assignments',
  'Research Materials',
  'Sample Questions',
  'Study Guides',
];

export const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-nbu',
    name: 'Northbridge University (Demo Archive)',
    shortCode: 'NBU',
    isDemo: true,
  },
  {
    id: 'inst-sjp',
    name: 'St. Jude Polytechnic Institute (Demo Archive)',
    shortCode: 'SJP',
    isDemo: true,
  },
];

export const SEED_CAMPUSES: Campus[] = [
  { id: 'camp-main', institutionId: 'inst-nbu', name: 'Main Academic Campus', city: 'Northbridge' },
  { id: 'camp-west', institutionId: 'inst-nbu', name: 'West Engineering & Science Campus', city: 'Northbridge West' },
  { id: 'camp-tech', institutionId: 'inst-sjp', name: 'Central Polytechnic Campus', city: 'Harborview' },
];

export const SEED_FACULTIES: Faculty[] = [
  { id: 'fac-sci', institutionId: 'inst-nbu', name: 'School of Computing and Informatics', code: 'SCI' },
  { id: 'fac-eng', institutionId: 'inst-nbu', name: 'Faculty of Engineering and Technology', code: 'FET' },
  { id: 'fac-pas', institutionId: 'inst-nbu', name: 'School of Pure and Applied Sciences', code: 'SPAS' },
  { id: 'fac-bus', institutionId: 'inst-nbu', name: 'School of Business and Economics', code: 'SBE' },
];

export const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept-csc',
    facultyId: 'fac-sci',
    facultyName: 'School of Computing and Informatics',
    name: 'Computer Science',
    code: 'CSC',
    description: 'Algorithms, systems architecture, artificial intelligence, and theoretical computing.',
  },
  {
    id: 'dept-sen',
    facultyId: 'fac-sci',
    facultyName: 'School of Computing and Informatics',
    name: 'Software Engineering',
    code: 'SEN',
    description: 'Software lifecycle design, verification, requirements engineering, and distributed systems.',
  },
  {
    id: 'dept-bit',
    facultyId: 'fac-sci',
    facultyName: 'School of Computing and Informatics',
    name: 'Information Technology',
    code: 'BIT',
    description: 'Enterprise networks, cloud infrastructure, database administration, and IT governance.',
  },
  {
    id: 'dept-eee',
    facultyId: 'fac-eng',
    facultyName: 'Faculty of Engineering and Technology',
    name: 'Electrical & Electronic Engineering',
    code: 'EEE',
    description: 'Power electronics, signal processing, control systems, and embedded hardware.',
  },
  {
    id: 'dept-cve',
    facultyId: 'fac-eng',
    facultyName: 'Faculty of Engineering and Technology',
    name: 'Civil & Structural Engineering',
    code: 'CVE',
    description: 'Structural mechanics, geotechnics, hydraulics, and sustainable infrastructure.',
  },
  {
    id: 'dept-mat',
    facultyId: 'fac-pas',
    facultyName: 'School of Pure and Applied Sciences',
    name: 'Applied Mathematics & Statistics',
    code: 'MAT',
    description: 'Linear algebra, differential equations, probability theory, and statistical inference.',
  },
  {
    id: 'dept-phy',
    facultyId: 'fac-pas',
    facultyName: 'School of Pure and Applied Sciences',
    name: 'Physics & Materials Science',
    code: 'PHY',
    description: 'Electromagnetism, quantum mechanics, thermodynamics, and solid-state physics.',
  },
  {
    id: 'dept-bch',
    facultyId: 'fac-pas',
    facultyName: 'School of Pure and Applied Sciences',
    name: 'Biochemistry & Biotechnology',
    code: 'BCH',
    description: 'Enzymology, molecular biology, metabolic pathways, and analytical laboratory methods.',
  },
  {
    id: 'dept-eco',
    facultyId: 'fac-bus',
    facultyName: 'School of Business and Economics',
    name: 'Economics & Econometrics',
    code: 'ECO',
    description: 'Microeconomic theory, macroeconomics, quantitative econometrics, and public policy.',
  },
  {
    id: 'dept-bus',
    facultyId: 'fac-bus',
    facultyName: 'School of Business and Economics',
    name: 'Business & Corporate Finance',
    code: 'BUS',
    description: 'Financial accounting, corporate valuation, operations strategy, and commercial law.',
  },
];

export const SEED_PROGRAMMES: Programme[] = [
  { id: 'prog-bsc-cs', departmentId: 'dept-csc', name: 'Bachelor of Science in Computer Science', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-bsc-se', departmentId: 'dept-sen', name: 'Bachelor of Science in Software Engineering', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-bsc-it', departmentId: 'dept-bit', name: 'Bachelor of Science in Information Technology', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-beng-ee', departmentId: 'dept-eee', name: 'Bachelor of Engineering in Electrical & Electronics', degreeLevel: 'Undergraduate', durationYears: 5 },
  { id: 'prog-beng-ce', departmentId: 'dept-cve', name: 'Bachelor of Engineering in Civil Engineering', degreeLevel: 'Undergraduate', durationYears: 5 },
  { id: 'prog-bsc-math', departmentId: 'dept-mat', name: 'Bachelor of Science in Applied Mathematics', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-bsc-phy', departmentId: 'dept-phy', name: 'Bachelor of Science in Applied Physics', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-bsc-bch', departmentId: 'dept-bch', name: 'Bachelor of Science in Biochemistry', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-ba-eco', departmentId: 'dept-eco', name: 'Bachelor of Arts in Economics', degreeLevel: 'Undergraduate', durationYears: 4 },
  { id: 'prog-bcom-fin', departmentId: 'dept-bus', name: 'Bachelor of Commerce in Finance', degreeLevel: 'Undergraduate', durationYears: 4 },
];

interface CourseBlueprint {
  code: string;
  name: string;
  deptId: string;
  yearOfStudy: number;
  credits: number;
  description: string;
}

const COURSE_BLUEPRINTS: CourseBlueprint[] = [
  // 1. Computer Science (4)
  { code: 'CSC 101', name: 'Introduction to Programming', deptId: 'dept-csc', yearOfStudy: 1, credits: 3, description: 'Foundational problem-solving, procedural logic, memory models, and Python/C programming.' },
  { code: 'CSC 204', name: 'Data Structures and Algorithms', deptId: 'dept-csc', yearOfStudy: 2, credits: 4, description: 'Trees, graphs, asymptotic complexity, dynamic programming, and sorting algorithms.' },
  { code: 'CSC 312', name: 'Database Systems', deptId: 'dept-csc', yearOfStudy: 3, credits: 4, description: 'Relational algebra, SQL query optimization, B+ trees, normalization, and ACID transactions.' },
  { code: 'CSC 405', name: 'Computer & Network Security', deptId: 'dept-csc', yearOfStudy: 4, credits: 3, description: 'Applied cryptography, TLS protocols, access control models, and secure systems auditing.' },
  // 2. Software Engineering (3)
  { code: 'SEN 201', name: 'Software Requirements Engineering', deptId: 'dept-sen', yearOfStudy: 2, credits: 3, description: 'Elicitation techniques, formal specification, traceability matrices, and stakeholder modeling.' },
  { code: 'SEN 304', name: 'Software Architecture & Design Patterns', deptId: 'dept-sen', yearOfStudy: 3, credits: 4, description: 'Modular decomposition, microservices, event-driven patterns, and quality attributes.' },
  { code: 'SEN 410', name: 'Software Testing & Quality Assurance', deptId: 'dept-sen', yearOfStudy: 4, credits: 3, description: 'Unit, integration, mutation testing, static analysis, and automated verification pipelines.' },
  // 3. Information Technology (3)
  { code: 'BIT 110', name: 'Computer Networks & Protocols', deptId: 'dept-bit', yearOfStudy: 1, credits: 3, description: 'OSI model, TCP/IP subnetting, routing algorithms, DNS, and packet switching.' },
  { code: 'BIT 220', name: 'Operating Systems Administration', deptId: 'dept-bit', yearOfStudy: 2, credits: 3, description: 'Process scheduling, Linux filesystems, permissions, virtualization, and shell automation.' },
  { code: 'BIT 330', name: 'Cloud Infrastructure & DevOps', deptId: 'dept-bit', yearOfStudy: 3, credits: 4, description: 'Container orchestration, infrastructure as code, high availability, and observability.' },
  // 4. Electrical & Electronic Engineering (3)
  { code: 'EEE 210', name: 'Electrical Circuit Theory', deptId: 'dept-eee', yearOfStudy: 2, credits: 4, description: 'AC/DC network theorems, Laplace transforms, resonance, and two-port networks.' },
  { code: 'EEE 315', name: 'Signals and Linear Systems', deptId: 'dept-eee', yearOfStudy: 3, credits: 4, description: 'Fourier series, continuous/discrete convolution, Z-transforms, and filter design.' },
  { code: 'EEE 412', name: 'Power Systems Analysis', deptId: 'dept-eee', yearOfStudy: 4, credits: 4, description: 'Load flow studies, fault analysis, symmetrical components, and grid stability.' },
  // 5. Civil & Structural Engineering (3)
  { code: 'CVE 205', name: 'Strength of Materials', deptId: 'dept-cve', yearOfStudy: 2, credits: 4, description: 'Axial stress, torsion, bending moment diagrams, beam deflection, and Mohr circles.' },
  { code: 'CVE 308', name: 'Reinforced Concrete Design', deptId: 'dept-cve', yearOfStudy: 3, credits: 4, description: 'Limit state design of beams, slabs, columns, and foundation footings.' },
  { code: 'CVE 402', name: 'Engineering Hydrology & Hydraulics', deptId: 'dept-cve', yearOfStudy: 4, credits: 3, description: 'Open channel flow, rainfall-runoff modeling, flood routing, and pipe network design.' },
  // 6. Applied Mathematics & Statistics (3)
  { code: 'MAT 102', name: 'Linear Algebra I', deptId: 'dept-mat', yearOfStudy: 1, credits: 3, description: 'Vector spaces, Gaussian elimination, determinants, eigenvalues, and linear transformations.' },
  { code: 'MAT 204', name: 'Ordinary Differential Equations', deptId: 'dept-mat', yearOfStudy: 2, credits: 4, description: 'First and second-order ODEs, series solutions, Laplace methods, and phase portraits.' },
  { code: 'MAT 310', name: 'Probability & Statistical Inference', deptId: 'dept-mat', yearOfStudy: 3, credits: 4, description: 'Distributions, maximum likelihood estimation, hypothesis testing, and regression.' },
  // 7. Physics & Materials Science (3)
  { code: 'PHY 105', name: 'Classical Mechanics & Waves', deptId: 'dept-phy', yearOfStudy: 1, credits: 3, description: 'Newtonian dynamics, rotational kinematics, harmonic oscillators, and wave interference.' },
  { code: 'PHY 212', name: 'Electromagnetism & Optics', deptId: 'dept-phy', yearOfStudy: 2, credits: 4, description: 'Maxwell equations, electrostatics, magnetostatics, diffraction, and polarization.' },
  { code: 'PHY 320', name: 'Quantum Physics I', deptId: 'dept-phy', yearOfStudy: 3, credits: 4, description: 'Schrödinger equation, potential wells, operator formalism, and hydrogen atom spectra.' },
  // 8. Biochemistry & Biotechnology (3)
  { code: 'BCH 104', name: 'Biomolecules & Cellular Chemistry', deptId: 'dept-bch', yearOfStudy: 1, credits: 3, description: 'Amino acids, protein folding, nucleic acid structure, and buffer equilibrium.' },
  { code: 'BCH 215', name: 'Enzymology & Bioenergetics', deptId: 'dept-bch', yearOfStudy: 2, credits: 4, description: 'Michaelis-Menten kinetics, allosteric regulation, oxidative phosphorylation, and ATP synthesis.' },
  { code: 'BCH 318', name: 'Molecular Genetics & PCR Diagnostics', deptId: 'dept-bch', yearOfStudy: 3, credits: 4, description: 'Gene expression regulation, recombinant DNA cloning, sequencing, and assay design.' },
  // 9. Economics & Econometrics (3)
  { code: 'ECO 101', name: 'Principles of Microeconomics', deptId: 'dept-eco', yearOfStudy: 1, credits: 3, description: 'Consumer choice, elasticities, market structures, welfare economics, and externalities.' },
  { code: 'ECO 202', name: 'Intermediate Macroeconomics', deptId: 'dept-eco', yearOfStudy: 2, credits: 3, description: 'IS-LM equilibrium, monetary policy transmission, inflation dynamics, and Solow growth.' },
  { code: 'ECO 305', name: 'Applied Econometrics', deptId: 'dept-eco', yearOfStudy: 3, credits: 4, description: 'OLS estimators, heteroskedasticity, instrumental variables, and panel data models.' },
  // 10. Business & Corporate Finance (2) -> total 30 courses!
  { code: 'BUS 201', name: 'Financial Accounting & Reporting', deptId: 'dept-bus', yearOfStudy: 2, credits: 3, description: 'Balance sheets, cash flow statements, IFRS standards, and ratio interpretation.' },
  { code: 'BUS 304', name: 'Corporate Finance & Valuation', deptId: 'dept-bus', yearOfStudy: 3, credits: 4, description: 'Discounted cash flow valuation, WACC, capital budgeting, and dividend policy.' },
];

export const SEED_COURSES: Course[] = COURSE_BLUEPRINTS.map((bp, idx) => {
  const dept = SEED_DEPARTMENTS.find((d) => d.id === bp.deptId)!;
  const prog = SEED_PROGRAMMES.find((p) => p.departmentId === bp.deptId)!;
  return {
    id: `crs-${idx + 1}`,
    departmentId: dept.id,
    departmentCode: dept.code,
    departmentName: dept.name,
    programmeId: prog.id,
    programmeName: prog.name,
    code: bp.code,
    name: bp.name,
    description: bp.description,
    creditUnits: bp.credits,
    yearOfStudy: bp.yearOfStudy,
  };
});

export interface SeedAccountWithPassword {
  account: UserAccount;
  passwordPlain: string;
}

const STUDENT_NAMES = [
  ['Maya Lin', 'maya.lin@northbridge.edu', 'dept-csc', 'Year 3'],
  ['Daniel Ochieng', 'daniel.ochieng@northbridge.edu', 'dept-sen', 'Year 2'],
  ['Priya Nair', 'priya.nair@northbridge.edu', 'dept-eee', 'Year 4'],
  ['Lucas Meyer', 'lucas.meyer@northbridge.edu', 'dept-mat', 'Year 3'],
  ['Amara Mensah', 'amara.mensah@northbridge.edu', 'dept-eco', 'Year 2'],
  ['Hannah Kim', 'hannah.kim@northbridge.edu', 'dept-bit', 'Year 1'],
  ['Tariq Al-Mansoor', 'tariq.mansoor@northbridge.edu', 'dept-cve', 'Year 3'],
  ['Sofia Rossi', 'sofia.rossi@northbridge.edu', 'dept-bch', 'Year 2'],
  ['Ethan Brooks', 'ethan.brooks@northbridge.edu', 'dept-phy', 'Year 3'],
  ['Claire Dubois', 'claire.dubois@northbridge.edu', 'dept-bus', 'Year 4'],
] as const;

const LECTURER_NAMES = [
  ['Prof. Arthur Pendelton', 'a.pendelton@northbridge.edu', 'dept-csc'],
  ['Dr. Miriam Karanja', 'm.karanja@northbridge.edu', 'dept-eee'],
  ['Dr. Henrik Lindqvist', 'h.lindqvist@northbridge.edu', 'dept-mat'],
  ['Prof. Nadia Alverez', 'n.alverez@northbridge.edu', 'dept-eco'],
  ['Dr. Samuel Boateng', 's.boateng@northbridge.edu', 'dept-sen'],
] as const;

function makeUserAccount(
  id: string,
  fullName: string,
  email: string,
  role: UserAccount['role'],
  deptId: string,
  academicYear: string,
  avatarUrl: string,
  points: number,
  approvedUploads: number,
  badges: string[]
): UserAccount {
  const dept = SEED_DEPARTMENTS.find((d) => d.id === deptId) || SEED_DEPARTMENTS[0];
  const prog = SEED_PROGRAMMES.find((p) => p.departmentId === dept.id) || SEED_PROGRAMMES[0];
  const campus = dept.facultyId === 'fac-eng' ? SEED_CAMPUSES[1] : SEED_CAMPUSES[0];
  return {
    id,
    email,
    fullName,
    role,
    status: 'active',
    institutionId: 'inst-nbu',
    institutionName: SEED_INSTITUTIONS[0].name,
    campusId: campus.id,
    campusName: campus.name,
    departmentId: dept.id,
    departmentName: dept.name,
    programmeId: prog.id,
    programmeName: prog.name,
    academicYear,
    avatarUrl,
    contributionPoints: points,
    approvedUploadsCount: approvedUploads,
    badges,
    notificationPrefs: {
      newPapers: true,
      uploadApprovals: true,
      announcements: true,
    },
    createdAt: '2026-09-01T08:00:00Z',
  };
}

export const SEED_USERS_WITH_PASSWORDS: SeedAccountWithPassword[] = [
  // 10 Student Demo Accounts (first one is the primary quick-login Student)
  ...STUDENT_NAMES.map(([name, email, deptId, year], idx) => ({
    account: makeUserAccount(
      `usr-student-${idx + 1}`,
      name,
      email,
      'student',
      deptId,
      year,
      '/src/assets/images/avatar_student_portal_1794745517683.jpg',
      idx === 0 ? 340 : 80 + idx * 25,
      idx === 0 ? 6 : 1 + (idx % 4),
      idx === 0
        ? ['Verified Contributor', 'CS Archive Builder', 'Honor Scholar']
        : ['Campus Contributor']
    ),
    passwordPlain: idx === 0 ? 'StudentVault2026!' : 'DemoStudent2026!',
  })),
  // 5 Lecturer Demo Accounts
  ...LECTURER_NAMES.map(([name, email, deptId], idx) => ({
    account: makeUserAccount(
      `usr-lecturer-${idx + 1}`,
      name,
      email,
      'lecturer',
      deptId,
      'Faculty Staff',
      '/src/assets/images/avatar_lecturer_portal_1794745518693.jpg',
      620 + idx * 40,
      14 + idx * 2,
      ['Faculty Examiner', 'Verified Solution Author']
    ),
    passwordPlain: idx === 0 ? 'LecturerVault2026!' : 'DemoLecturer2026!',
  })),
  // 1 Moderator Demo Account
  {
    account: makeUserAccount(
      'usr-moderator-1',
      'Evelyn Park (Academic Moderator)',
      'moderator@northbridge.edu',
      'moderator',
      'dept-csc',
      'Library Curation',
      '/src/assets/images/avatar_lecturer_portal_1794745518693.jpg',
      890,
      22,
      ['Chief Metadata Curator', 'Quality Guardian']
    ),
    passwordPlain: 'ModeratorVault2026!',
  },
  // 1 Administrator Demo Account
  {
    account: makeUserAccount(
      'usr-admin-1',
      'Dr. Julian Vance (Vault Administrator)',
      'admin@northbridge.edu',
      'admin',
      'dept-csc',
      'Academic Registry',
      '/src/assets/images/avatar_lecturer_portal_1794745518693.jpg',
      1250,
      30,
      ['Registry Administrator', 'Archive Architect']
    ),
    passwordPlain: 'AdminVault2026!',
  },
];

// Deterministic realistic documents:
// 50 Past Papers + 15 Revision Materials / Lecture Notes + 10 Marking Schemes + 2 Pending Queue = 77 documents
function buildDocuments(): VaultDocument[] {
  const docs: VaultDocument[] = [];
  const examTypesCycle = [
    'End-of-Semester Examination',
    'Mid-Semester Examination',
    'CAT Paper',
    'Supplementary Examination',
    'Special Examination',
    'Practical Examination',
  ];
  const yearsCycle = ['2024/2025', '2023/2024', '2022/2023', '2025/2026', '2021/2022'];
  const semsCycle = ['Semester 1', 'Semester 2'];
  const lecturerList = LECTURER_NAMES.map((l) => l[0]);

  // 1. 50 Past Examination Papers across all 30 courses
  for (let i = 0; i < 50; i++) {
    const course = SEED_COURSES[i % SEED_COURSES.length];
    const dept = SEED_DEPARTMENTS.find((d) => d.id === course.departmentId)!;
    const faculty = SEED_FACULTIES.find((f) => f.id === dept.facultyId)!;
    const campus = dept.facultyId === 'fac-eng' ? SEED_CAMPUSES[1] : SEED_CAMPUSES[0];
    const year = yearsCycle[Math.floor(i / 10) % yearsCycle.length];
    const semester = semsCycle[i % 2];
    const examType = examTypesCycle[i % examTypesCycle.length];
    const category: DocumentCategory =
      examType === 'CAT Paper'
        ? 'CAT Papers'
        : examType === 'Mid-Semester Examination'
        ? 'Mid-Semester Examinations'
        : examType === 'Supplementary Examination'
        ? 'Supplementary Examinations'
        : examType === 'Special Examination'
        ? 'Special Examinations'
        : examType === 'Practical Examination'
        ? 'Practical Examinations'
        : 'End-of-Semester Examinations';
    const yearShort = year.split('/')[0];
    const lecturer = lecturerList[i % lecturerList.length];
    const day = String(1 + (i % 27)).padStart(2, '0');
    const month = String(1 + (i % 10)).padStart(2, '0');

    docs.push({
      id: `doc-paper-${i + 1}`,
      accessionNumber: `CEV-${yearShort}-${String(i + 1).padStart(4, '0')}`,
      title: `${course.code} ${examType} (${yearShort} ${semester})`,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      facultyId: faculty.id,
      facultyName: faculty.name,
      programmeId: course.programmeId,
      programmeName: course.programmeName,
      campusId: campus.id,
      campusName: campus.name,
      institutionId: 'inst-nbu',
      institutionName: SEED_INSTITUTIONS[0].name,
      academicYear: year,
      semester,
      examType,
      category,
      description: `Demonstration past examination paper for ${course.code} (${course.name}). Includes Section A compulsory questions and Section B analytical problems covering ${course.description.toLowerCase()}`,
      lecturerName: lecturer,
      fileFormat: 'PDF',
      fileSizeBytes: 380000 + (i % 9) * 145000,
      fileHash: `demo-sha256-paper-${i + 1}`,
      storedFilename: `generated-doc-paper-${i + 1}.pdf`,
      originalFilename: `${course.code.replace(/\s+/g, '_')}_${examType.replace(/\s+/g, '_')}_${yearShort}.pdf`,
      ocrText: `${course.code} ${course.name} ${examType} ${year} ${semester} ${dept.name} ${lecturer} Section A Section B time allowed 3 hours demonstration archive`,
      version: 1,
      status: 'approved',
      verificationLevel: i % 3 === 0 ? 'lecturer_verified' : 'demo_sample',
      isDemoSample: true,
      uploadedById: i % 2 === 0 ? 'usr-lecturer-1' : 'usr-student-1',
      uploadedByName: i % 2 === 0 ? lecturer : 'Maya Lin',
      uploadedByRole: i % 2 === 0 ? 'lecturer' : 'student',
      approvedByName: 'Evelyn Park (Academic Moderator)',
      approvedAt: `2026-${month}-${day}T10:30:00Z`,
      viewsCount: 180 + ((i * 37) % 940),
      downloadsCount: 75 + ((i * 29) % 520),
      bookmarksCount: 18 + ((i * 11) % 95),
      createdAt: `2026-${month}-${day}T09:15:00Z`,
      updatedAt: `2026-${month}-${day}T10:30:00Z`,
    });
  }

  // 2. 15 Revision Materials, Lecture Notes, Study Guides & Lab Manuals
  const revCategories: DocumentCategory[] = [
    'Revision Materials',
    'Lecture Notes',
    'Study Guides',
    'Sample Questions',
    'Laboratory Manuals',
  ];
  for (let j = 0; j < 15; j++) {
    const course = SEED_COURSES[(j * 2) % SEED_COURSES.length];
    const dept = SEED_DEPARTMENTS.find((d) => d.id === course.departmentId)!;
    const faculty = SEED_FACULTIES.find((f) => f.id === dept.facultyId)!;
    const cat = revCategories[j % revCategories.length];
    const isVerified = j % 3 === 0;
    const year = yearsCycle[j % 3];
    const yearShort = year.split('/')[0];

    docs.push({
      id: `doc-rev-${j + 1}`,
      accessionNumber: `CEV-REV-${String(j + 1).padStart(4, '0')}`,
      title: `${course.code} ${cat}: Comprehensive Exam Prep Packet`,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      facultyId: faculty.id,
      facultyName: faculty.name,
      programmeId: course.programmeId,
      programmeName: course.programmeName,
      campusId: SEED_CAMPUSES[0].id,
      campusName: SEED_CAMPUSES[0].name,
      institutionId: 'inst-nbu',
      institutionName: SEED_INSTITUTIONS[0].name,
      academicYear: year,
      semester: j % 2 === 0 ? 'Semester 1' : 'Semester 2',
      examType: cat,
      category: cat,
      description: `Structured ${cat.toLowerCase()} compiled for ${course.code} (${course.name}). Covers core syllabus formulas, worked derivations, and exam readiness checklists (Demo Sample).`,
      lecturerName: isVerified ? LECTURER_NAMES[j % LECTURER_NAMES.length][0] : 'Student Revision Guild',
      fileFormat: 'PDF',
      fileSizeBytes: 510000 + (j % 6) * 180000,
      fileHash: `demo-sha256-rev-${j + 1}`,
      storedFilename: `generated-doc-rev-${j + 1}.pdf`,
      originalFilename: `${course.code.replace(/\s+/g, '_')}_${cat.replace(/\s+/g, '_')}_${yearShort}.pdf`,
      ocrText: `${course.code} ${course.name} ${cat} summary definitions worked examples exam revision`,
      version: 1,
      status: 'approved',
      verificationLevel: isVerified ? 'lecturer_verified' : 'student_revision_notes',
      isDemoSample: true,
      uploadedById: isVerified ? 'usr-lecturer-2' : 'usr-student-1',
      uploadedByName: isVerified ? 'Dr. Miriam Karanja' : 'Maya Lin',
      uploadedByRole: isVerified ? 'lecturer' : 'student',
      approvedByName: 'Evelyn Park (Academic Moderator)',
      approvedAt: `2026-10-${String(10 + j).padStart(2, '0')}T14:00:00Z`,
      viewsCount: 210 + ((j * 43) % 680),
      downloadsCount: 95 + ((j * 31) % 410),
      bookmarksCount: 28 + ((j * 9) % 85),
      createdAt: `2026-10-${String(10 + j).padStart(2, '0')}T11:20:00Z`,
      updatedAt: `2026-10-${String(10 + j).padStart(2, '0')}T14:00:00Z`,
    });
  }

  // 3. 10 Marking Schemes & Solution Records (clearly distinguishing verification status)
  const schemeLevels: VerificationLevel[] = [
    'official_marking_scheme',
    'official_marking_scheme',
    'lecturer_verified',
    'lecturer_verified',
    'student_revision_notes',
    'unverified_community',
    'official_marking_scheme',
    'lecturer_verified',
    'student_revision_notes',
    'unverified_community',
  ];

  for (let k = 0; k < 10; k++) {
    const course = SEED_COURSES[(k * 3) % SEED_COURSES.length];
    const dept = SEED_DEPARTMENTS.find((d) => d.id === course.departmentId)!;
    const faculty = SEED_FACULTIES.find((f) => f.id === dept.facultyId)!;
    const level = schemeLevels[k];
    const year = yearsCycle[k % 3];
    const yearShort = year.split('/')[0];
    const labelSuffix =
      level === 'official_marking_scheme'
        ? 'Official Marking Scheme (Demo)'
        : level === 'lecturer_verified'
        ? 'Lecturer-Provided Worked Solutions'
        : level === 'student_revision_notes'
        ? 'Student-Created Revision Answers'
        : 'Unverified Community Solution Draft';

    docs.push({
      id: `doc-scheme-${k + 1}`,
      accessionNumber: `CEV-MS-${String(k + 1).padStart(4, '0')}`,
      title: `${course.code} ${yearShort} ${labelSuffix}`,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      departmentId: dept.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      facultyId: faculty.id,
      facultyName: faculty.name,
      programmeId: course.programmeId,
      programmeName: course.programmeName,
      campusId: SEED_CAMPUSES[0].id,
      campusName: SEED_CAMPUSES[0].name,
      institutionId: 'inst-nbu',
      institutionName: SEED_INSTITUTIONS[0].name,
      academicYear: year,
      semester: k % 2 === 0 ? 'Semester 1' : 'Semester 2',
      examType: 'End-of-Semester Examination',
      category: 'Marking Schemes',
      description: `${labelSuffix} for ${course.code} (${course.name}). Includes step-by-step point allocation rubric and sample worked responses.`,
      lecturerName:
        level === 'official_marking_scheme' || level === 'lecturer_verified'
          ? LECTURER_NAMES[k % LECTURER_NAMES.length][0]
          : 'Peer Study Contributor',
      fileFormat: 'PDF',
      fileSizeBytes: 420000 + k * 55000,
      fileHash: `demo-sha256-scheme-${k + 1}`,
      storedFilename: `generated-doc-scheme-${k + 1}.pdf`,
      originalFilename: `${course.code.replace(/\s+/g, '_')}_Marking_Scheme_${yearShort}.pdf`,
      ocrText: `${course.code} ${course.name} marking scheme rubric solution answer key points allocation`,
      version: 1,
      status: 'approved',
      verificationLevel: level,
      isDemoSample: true,
      uploadedById:
        level === 'official_marking_scheme' || level === 'lecturer_verified'
          ? 'usr-lecturer-1'
          : 'usr-student-2',
      uploadedByName:
        level === 'official_marking_scheme' || level === 'lecturer_verified'
          ? LECTURER_NAMES[k % LECTURER_NAMES.length][0]
          : 'Daniel Ochieng',
      uploadedByRole:
        level === 'official_marking_scheme' || level === 'lecturer_verified'
          ? 'lecturer'
          : 'student',
      approvedByName: 'Evelyn Park (Academic Moderator)',
      approvedAt: `2026-10-${String(18 + k).padStart(2, '0')}T16:15:00Z`,
      viewsCount: 340 + k * 48,
      downloadsCount: 190 + k * 34,
      bookmarksCount: 44 + k * 7,
      createdAt: `2026-10-${String(18 + k).padStart(2, '0')}T12:00:00Z`,
      updatedAt: `2026-10-${String(18 + k).padStart(2, '0')}T16:15:00Z`,
    });
  }

  // 4. 2 Pending Submissions for Moderation Queue testing
  docs.push(
    {
      id: 'doc-pending-1',
      accessionNumber: 'CEV-PEND-0001',
      title: 'CSC 204 Data Structures Mock CAT & Graph Algorithms Guide',
      courseId: SEED_COURSES[1].id,
      courseCode: 'CSC 204',
      courseName: 'Data Structures and Algorithms',
      departmentId: 'dept-csc',
      departmentCode: 'CSC',
      departmentName: 'Computer Science',
      facultyId: 'fac-sci',
      facultyName: 'School of Computing and Informatics',
      programmeId: 'prog-bsc-cs',
      programmeName: 'Bachelor of Science in Computer Science',
      campusId: 'camp-main',
      campusName: 'Main Academic Campus',
      institutionId: 'inst-nbu',
      institutionName: SEED_INSTITUTIONS[0].name,
      academicYear: '2025/2026',
      semester: 'Semester 1',
      examType: 'CAT Paper',
      category: 'CAT Papers',
      description: 'Student-contributed practice CAT paper covering Dijkstra shortest paths, AVL rotations, and Big-O recurrences.',
      lecturerName: 'Prof. Arthur Pendelton',
      fileFormat: 'PDF',
      fileSizeBytes: 315000,
      fileHash: 'demo-sha256-pending-1',
      storedFilename: 'generated-doc-pending-1.pdf',
      originalFilename: 'CSC_204_Practice_CAT_2025.pdf',
      ocrText: 'CSC 204 Data Structures Algorithms AVL tree Dijkstra recurrence relation',
      version: 1,
      status: 'pending',
      verificationLevel: 'student_revision_notes',
      isDemoSample: true,
      uploadedById: 'usr-student-1',
      uploadedByName: 'Maya Lin',
      uploadedByRole: 'student',
      viewsCount: 4,
      downloadsCount: 0,
      bookmarksCount: 0,
      createdAt: '2026-11-14T15:20:00Z',
      updatedAt: '2026-11-14T15:20:00Z',
    },
    {
      id: 'doc-pending-2',
      accessionNumber: 'CEV-PEND-0002',
      title: 'EEE 315 Signals & Systems Fourier Transform Problem Set',
      courseId: SEED_COURSES[11].id,
      courseCode: 'EEE 315',
      courseName: 'Signals and Linear Systems',
      departmentId: 'dept-eee',
      departmentCode: 'EEE',
      departmentName: 'Electrical & Electronic Engineering',
      facultyId: 'fac-eng',
      facultyName: 'Faculty of Engineering and Technology',
      programmeId: 'prog-beng-ee',
      programmeName: 'Bachelor of Engineering in Electrical & Electronics',
      campusId: 'camp-west',
      campusName: 'West Engineering & Science Campus',
      institutionId: 'inst-nbu',
      institutionName: SEED_INSTITUTIONS[0].name,
      academicYear: '2025/2026',
      semester: 'Semester 1',
      examType: 'Sample Questions',
      category: 'Sample Questions',
      description: 'Compiled Fourier transform and Z-plane pole-zero sample questions awaiting moderator metadata check.',
      lecturerName: 'Dr. Miriam Karanja',
      fileFormat: 'PDF',
      fileSizeBytes: 408000,
      fileHash: 'demo-sha256-pending-2',
      storedFilename: 'generated-doc-pending-2.pdf',
      originalFilename: 'EEE_315_Fourier_Practice_2025.pdf',
      ocrText: 'EEE 315 Signals Systems Fourier transform Z-transform convolution',
      version: 1,
      status: 'pending',
      verificationLevel: 'unverified_community',
      isDemoSample: true,
      uploadedById: 'usr-student-3',
      uploadedByName: 'Priya Nair',
      uploadedByRole: 'student',
      viewsCount: 2,
      downloadsCount: 0,
      bookmarksCount: 0,
      createdAt: '2026-11-15T01:40:00Z',
      updatedAt: '2026-11-15T01:40:00Z',
    }
  );

  return docs;
}

export const SEED_DOCUMENTS: VaultDocument[] = buildDocuments();

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '2025/2026 Semester 1 Final Examination Timetable Released',
    body: 'The Office of the Academic Registrar has published the provisional examination schedule for Main and West Campuses. Verify course codes and examination venues before November 28.',
    category: 'Examination Notice',
    isOfficial: true,
    publishedBy: 'Academic Registry Office',
    publishedAt: '2026-11-14T09:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'School of Computing: 2024/2025 Past Papers & Verified Marking Schemes Indexed',
    body: 'Twenty-four newly verified end-of-semester papers and lecturer-approved solution rubrics across CSC, SEN, and BIT are now open for student download and PDF preview.',
    category: 'Department Notice',
    isOfficial: true,
    publishedBy: 'School of Computing & Informatics',
    publishedAt: '2026-11-12T11:30:00Z',
  },
  {
    id: 'ann-3',
    title: 'Structured Revision Clinics: Applied Mathematics & Circuit Theory',
    body: 'Peer-assisted and faculty-led revision sessions for MAT 204 and EEE 210 will run Mondays and Wednesdays at 16:00 in Science Hall B.',
    category: 'Revision Schedule',
    isOfficial: true,
    publishedBy: 'Dean of Students Academic Support',
    publishedAt: '2026-11-10T14:15:00Z',
  },
  {
    id: 'ann-4',
    title: 'Supplementary & Special Examination Registration Deadline',
    body: 'Eligible candidates sitting Supplementary or Special Examinations must confirm unit registration with their Department Chair prior to December 4.',
    category: 'Academic Calendar',
    isOfficial: true,
    publishedBy: 'Academic Registry Office',
    publishedAt: '2026-11-08T08:45:00Z',
  },
  {
    id: 'ann-5',
    title: 'Document Upload Guidelines: Clear Scans & Course Metadata',
    body: 'Student contributors submitting CAT papers or study guides are reminded to upload crisp PDF files with accurate course codes and academic years for expedited moderation.',
    category: 'Platform Update',
    isOfficial: true,
    publishedBy: 'Library Moderation Team',
    publishedAt: '2026-11-06T10:00:00Z',
  },
  {
    id: 'ann-6',
    title: 'Economics & Corporate Finance Data Formula Sheet Standardized',
    body: 'Approved statistical tables and discounted cash-flow formula sheets for ECO 305 and BUS 304 are now archived under Revision Materials.',
    category: 'Department Notice',
    isOfficial: true,
    publishedBy: 'School of Business and Economics',
    publishedAt: '2026-11-03T13:20:00Z',
  },
  {
    id: 'ann-7',
    title: 'Extended Main Library Study Hours During Examination Fortnight',
    body: 'From November 25 through December 18, the Main Academic Library reading halls will remain open until 02:00 daily with quiet group pods available.',
    category: 'Academic Calendar',
    isOfficial: true,
    publishedBy: 'University Library Services',
    publishedAt: '2026-10-30T09:00:00Z',
  },
  {
    id: 'ann-8',
    title: 'Distinguishing Official Marking Schemes from Student Revision Answers',
    body: 'Every solution document in Campus Exam Vault displays its provenance label. Unverified community answers should always be cross-checked with course lecturers.',
    category: 'Platform Update',
    isOfficial: true,
    publishedBy: 'Academic Integrity Committee',
    publishedAt: '2026-10-27T11:00:00Z',
  },
  {
    id: 'ann-9',
    title: 'Biochemistry & Civil Engineering Laboratory Practical Manuals Updated',
    body: 'Updated safety protocols and sample practical assessment rubrics for BCH 215 and CVE 308 have been archived for the 2025/2026 academic cycle.',
    category: 'Department Notice',
    isOfficial: true,
    publishedBy: 'Faculty of Engineering & Sciences',
    publishedAt: '2026-10-22T15:10:00Z',
  },
  {
    id: 'ann-10',
    title: 'In-PDF Keyword Search & SHA-256 Duplicate Protection Active',
    body: 'Students can now search inside indexed examination PDFs directly in the integrated reader while duplicate uploads are automatically detected.',
    category: 'Platform Update',
    isOfficial: true,
    publishedBy: 'Campus Exam Vault Engineering',
    publishedAt: '2026-10-18T10:00:00Z',
  },
];

export const SEED_COLLECTIONS: BookmarkCollection[] = [
  {
    id: 'col-1',
    userId: 'usr-student-1',
    name: 'Final Examination Preparation',
    description: 'Core 300-level computer science past papers and verified marking schemes.',
    documentIds: ['doc-paper-2', 'doc-paper-3', 'doc-scheme-1', 'doc-rev-1'],
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'col-2',
    userId: 'usr-student-1',
    name: 'Semester One Revision',
    description: 'Database Systems and Data Structures practice papers.',
    documentIds: ['doc-paper-1', 'doc-paper-32', 'doc-rev-2'],
    createdAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'col-3',
    userId: 'usr-student-1',
    name: 'Mathematics & Algorithms',
    description: 'Linear algebra and algorithmic complexity sets.',
    documentIds: ['doc-paper-17', 'doc-paper-31'],
    createdAt: '2026-11-01T09:00:00Z',
  },
];

export const SEED_EXAM_PLANS: ExamPrepPlan[] = [
  {
    id: 'plan-1',
    userId: 'usr-student-1',
    courseCode: 'CSC 312',
    courseName: 'Database Systems',
    examTitle: 'End-of-Semester Examination',
    examDate: '2026-12-04T09:00:00Z',
    venue: 'Science Block Auditorium A',
    checklist: [
      { id: 'chk-1', label: 'Review 2024/2025 End-of-Semester Examination paper', completed: true, linkedDocumentId: 'doc-paper-3' },
      { id: 'chk-2', label: 'Complete 2023/2024 Database Systems past paper under 3h timer', completed: true, linkedDocumentId: 'doc-paper-33' },
      { id: 'chk-3', label: 'Cross-check BCNF & 3NF normalization marking scheme', completed: false, linkedDocumentId: 'doc-scheme-1' },
      { id: 'chk-4', label: 'Practice SQL join optimization & transaction isolation queries', completed: false },
    ],
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'plan-2',
    userId: 'usr-student-1',
    courseCode: 'CSC 204',
    courseName: 'Data Structures and Algorithms',
    examTitle: 'Mid-Term Comprehensive Review',
    examDate: '2026-11-26T14:00:00Z',
    venue: 'Computing Hall 204',
    checklist: [
      { id: 'chk-5', label: 'Download 2024/2025 Data Structures paper', completed: true, linkedDocumentId: 'doc-paper-2' },
      { id: 'chk-6', label: 'Revise AVL tree rotations and Dijkstra proofs', completed: false, linkedDocumentId: 'doc-rev-1' },
      { id: 'chk-7', label: 'Solve dynamic programming recurrence problems', completed: false },
    ],
    createdAt: '2026-11-05T10:00:00Z',
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  maxUploadSizeMb: 25,
  moderationEnabled: true,
  requireLecturerVerification: false,
  allowStudentUploads: true,
  allowedFormats: ['PDF', 'DOCX', 'PPTX'],
};

export const LANDING_FAQS = [
  {
    q: 'Are the documents in this archive official university exam papers?',
    a: 'All demonstration records in this showcase are fictional sample documents created for Northbridge University and St. Jude Polytechnic Institute. Each document explicitly states its provenance and verification level (Official Marking Scheme, Lecturer-Provided, Student Revision Notes, or Demonstration Sample).',
  },
  {
    q: 'How does the upload moderation workflow protect library quality?',
    a: 'Files uploaded by students enter a moderation queue where academic moderators verify course codes, academic years, file integrity, and magic-byte signatures before approving them for the public library. Institutions can also toggle verification rules for lecturer uploads.',
  },
  {
    q: 'Can I preview PDF examination papers without downloading them first?',
    a: 'Yes. Campus Exam Vault includes an integrated PDF reader supporting page-by-page navigation, zoom controls, full-screen study mode, in-document keyword search, and instant printing where permitted.',
  },
  {
    q: 'How are duplicate files and malicious uploads prevented?',
    a: 'Every uploaded document undergoes server-side magic-byte inspection (rejecting spoofed executables), configurable file-size enforcement, and SHA-256 cryptographic hashing to flag exact duplicates before storage.',
  },
  {
    q: 'What is the difference between Official Marking Schemes and Community Solutions?',
    a: 'Official Marking Schemes and Lecturer-Provided Solutions are clearly labeled and separated from Student-Created Revision Answers or Unverified Community Solutions so learners never mistake peer notes for an official answer key.',
  },
];
