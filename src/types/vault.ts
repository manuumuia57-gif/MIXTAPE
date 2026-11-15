export type UserRole = 'student' | 'lecturer' | 'moderator' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'archived';

export type FileFormat = 'PDF' | 'DOCX' | 'PPTX';

export type DocumentCategory =
  | 'Past Examination Papers'
  | 'CAT Papers'
  | 'Mid-Semester Examinations'
  | 'End-of-Semester Examinations'
  | 'Supplementary Examinations'
  | 'Special Examinations'
  | 'Marking Schemes'
  | 'Revision Materials'
  | 'Lecture Notes'
  | 'Practical Examinations'
  | 'Laboratory Manuals'
  | 'Assignments'
  | 'Research Materials'
  | 'Sample Questions'
  | 'Study Guides';

export type VerificationLevel =
  | 'official_marking_scheme'
  | 'lecturer_verified'
  | 'student_revision_notes'
  | 'unverified_community'
  | 'ai_practice_material'
  | 'demo_sample';

export interface NotificationPrefs {
  newPapers: boolean;
  uploadApprovals: boolean;
  announcements: boolean;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  institutionId: string;
  institutionName: string;
  campusId: string;
  campusName: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  academicYear: string;
  avatarUrl: string;
  contributionPoints: number;
  approvedUploadsCount: number;
  badges: string[];
  notificationPrefs: NotificationPrefs;
  createdAt: string;
}

export interface Institution {
  id: string;
  name: string;
  shortCode: string;
  isDemo: boolean;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  city: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  name: string;
  code: string;
}

export interface Department {
  id: string;
  facultyId: string;
  facultyName: string;
  name: string;
  code: string;
  description: string;
}

export interface Programme {
  id: string;
  departmentId: string;
  name: string;
  degreeLevel: string;
  durationYears: number;
}

export interface Course {
  id: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  code: string;
  name: string;
  description: string;
  creditUnits: number;
  yearOfStudy: number;
}

export interface VaultDocument {
  id: string;
  accessionNumber: string;
  title: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  facultyId: string;
  facultyName: string;
  programmeId: string;
  programmeName: string;
  campusId: string;
  campusName: string;
  institutionId: string;
  institutionName: string;
  academicYear: string;
  semester: string;
  examType: string;
  category: DocumentCategory;
  description: string;
  lecturerName: string;
  fileFormat: FileFormat;
  fileSizeBytes: number;
  fileHash: string;
  storedFilename: string;
  originalFilename: string;
  ocrText: string;
  version: number;
  status: DocumentStatus;
  verificationLevel: VerificationLevel;
  isDemoSample: boolean;
  uploadedById: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  viewsCount: number;
  downloadsCount: number;
  bookmarksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  documentIds: string[];
  createdAt: string;
}

export interface ExamChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  linkedDocumentId?: string;
}

export interface ExamPrepPlan {
  id: string;
  userId: string;
  courseCode: string;
  courseName: string;
  examTitle: string;
  examDate: string;
  venue: string;
  checklist: ExamChecklistItem[];
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: 'Examination Notice' | 'Revision Schedule' | 'Academic Calendar' | 'Department Notice' | 'Platform Update';
  isOfficial: boolean;
  publishedBy: string;
  publishedAt: string;
}

export interface VaultNotification {
  id: string;
  userId: string;
  category: string;
  title: string;
  message: string;
  relatedDocumentId?: string;
  read: boolean;
  createdAt: string;
}

export interface DocumentReport {
  id: string;
  documentId?: string;
  documentTitle?: string;
  courseCode?: string;
  reporterId: string;
  reporterName: string;
  reportType: 'incorrect_metadata' | 'broken_file' | 'wrong_course' | 'duplicate' | 'inappropriate' | 'missing_paper_request';
  details: string;
  status: 'open' | 'reviewing' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface SupportRequest {
  id: string;
  userId?: string;
  senderName: string;
  senderEmail: string;
  requestType: 'Technical Support' | 'Missing Past Paper' | 'Correction Request' | 'New Course Recommendation' | 'General Inquiry';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  adminResponse?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'document' | 'user' | 'course' | 'department' | 'settings' | 'report' | 'announcement';
  targetId: string;
  details: string;
  createdAt: string;
}

export interface PlatformSettings {
  maxUploadSizeMb: number;
  moderationEnabled: boolean;
  requireLecturerVerification: boolean;
  allowStudentUploads: boolean;
  allowedFormats: FileFormat[];
}

export interface CatalogResponse {
  institutions: Institution[];
  campuses: Campus[];
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  courses: Course[];
  academicYears: string[];
  semesters: string[];
  categories: DocumentCategory[];
  announcements: Announcement[];
  settings?: PlatformSettings;
  stats: {
    totalPastPapers: number;
    availableCourses: number;
    academicDepartments: number;
    registeredStudents: number;
    uploadedResources: number;
    totalDownloads: number;
  };
}

export type VaultSection =
  | 'home'
  | 'dashboard'
  | 'library'
  | 'courses'
  | 'marking-schemes'
  | 'upload'
  | 'bookmarks'
  | 'exam-prep'
  | 'contributor'
  | 'moderation'
  | 'admin'
  | 'support';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
}
