export type DocumentType =
  | 'Past Examination Papers'
  | 'CAT Papers'
  | 'Revision Materials'
  | 'Lecture Notes'
  | 'Assignments'
  | 'Practical Papers'
  | 'Other Study Materials';

export type ExaminationType =
  | 'End of Semester Examination'
  | 'Continuous Assessment Test (CAT)'
  | 'Supplementary / Special Examination'
  | 'Practical / Laboratory Assessment'
  | 'Coursework & Study Resource';

export type FileFormat = 'PDF' | 'DOCX' | 'PPTX';

export interface Department {
  id: string;
  code: string;
  name: string;
  school: string;
  description: string;
  createdAt: string;
}

export interface Course {
  id: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  school: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface LibraryDocument {
  id: string;
  title: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  school: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  documentType: DocumentType;
  examinationType: ExaminationType;
  description: string;
  fileFormat: FileFormat;
  fileSizeBytes: number;
  storedFilename: string;
  originalFilename: string;
  downloadsCount: number;
  isExampleSample: boolean;
  uploadedAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  institutionName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  aboutText: string;
  copyrightText: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface LibraryStats {
  totalPapers: number;
  totalStudyMaterials: number;
  totalCourses: number;
  totalDepartments: number;
  totalDownloads: number;
  totalDocuments: number;
}

export interface LibraryOverview {
  schools: string[];
  departments: Department[];
  courses: Course[];
  academicYears: string[];
  semesters: string[];
  documentTypes: DocumentType[];
  examinationTypes: ExaminationType[];
  documents: LibraryDocument[];
  settings: SiteSettings;
  stats: LibraryStats;
}

export type PublicPage = 'home' | 'past-papers' | 'study-materials' | 'courses' | 'about' | 'contact';

export type AdminMenuSection =
  | 'dashboard'
  | 'upload'
  | 'manage-papers'
  | 'manage-materials'
  | 'manage-courses'
  | 'manage-departments'
  | 'settings';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
}
