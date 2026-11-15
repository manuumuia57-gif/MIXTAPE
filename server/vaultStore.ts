import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  ACADEMIC_YEARS,
  DEFAULT_PLATFORM_SETTINGS,
  DOCUMENT_CATEGORIES,
  SEED_ANNOUNCEMENTS,
  SEED_CAMPUSES,
  SEED_COLLECTIONS,
  SEED_COURSES,
  SEED_DEPARTMENTS,
  SEED_DOCUMENTS,
  SEED_EXAM_PLANS,
  SEED_FACULTIES,
  SEED_INSTITUTIONS,
  SEED_PROGRAMMES,
  SEED_USERS_WITH_PASSWORDS,
  SEMESTERS,
} from '../src/data/vaultSeedData';
import {
  Announcement,
  AuditLogEntry,
  BookmarkCollection,
  Campus,
  Course,
  Department,
  DocumentCategory,
  DocumentReport,
  ExamPrepPlan,
  Faculty,
  Institution,
  PlatformSettings,
  Programme,
  SupportRequest,
  UserAccount,
  UserRole,
  VaultDocument,
  VaultNotification,
} from '../src/types/vault';

export interface StoredUserRecord extends UserAccount {
  passwordHash: string;
}

export interface VaultDatabaseState {
  users: StoredUserRecord[];
  institutions: Institution[];
  campuses: Campus[];
  faculties: Faculty[];
  departments: Department[];
  programmes: Programme[];
  courses: Course[];
  academicYears: string[];
  semesters: string[];
  categories: DocumentCategory[];
  documents: VaultDocument[];
  collections: BookmarkCollection[];
  bookmarkedIdsByUser: Record<string, string[]>;
  recentViewsByUser: Record<string, string[]>;
  recentDownloadsByUser: Record<string, string[]>;
  examPlans: ExamPrepPlan[];
  announcements: Announcement[];
  notifications: VaultNotification[];
  reports: DocumentReport[];
  supportRequests: SupportRequest[];
  auditLogs: AuditLogEntry[];
  settings: PlatformSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vault-db.json');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 64).toString('hex');
  return `${usedSalt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function buildInitialState(): VaultDatabaseState {
  const users: StoredUserRecord[] = SEED_USERS_WITH_PASSWORDS.map((entry) => ({
    ...entry.account,
    passwordHash: hashPassword(entry.passwordPlain),
  }));

  const defaultBookmarks: Record<string, string[]> = {
    'usr-student-1': ['doc-paper-2', 'doc-paper-3', 'doc-scheme-1', 'doc-rev-1', 'doc-paper-1'],
  };
  const defaultViews: Record<string, string[]> = {
    'usr-student-1': ['doc-paper-3', 'doc-scheme-1', 'doc-paper-2', 'doc-rev-1'],
  };
  const defaultDownloads: Record<string, string[]> = {
    'usr-student-1': ['doc-paper-2', 'doc-scheme-1'],
  };

  const initialNotifications: VaultNotification[] = [
    {
      id: 'notif-1',
      userId: 'usr-student-1',
      category: 'New Paper',
      title: 'CSC 312 End-of-Semester Paper Indexed',
      message: 'A 2024/2025 Database Systems past paper and marking scheme are now available.',
      relatedDocumentId: 'doc-paper-3',
      read: false,
      createdAt: '2026-11-14T10:00:00Z',
    },
    {
      id: 'notif-2',
      userId: 'usr-student-1',
      category: 'Moderation Update',
      title: 'Your CSC 204 Upload is Under Review',
      message: 'CSC 204 Data Structures Mock CAT has entered the academic moderation queue.',
      relatedDocumentId: 'doc-pending-1',
      read: false,
      createdAt: '2026-11-14T15:25:00Z',
    },
    {
      id: 'notif-3',
      userId: 'usr-student-1',
      category: 'Announcement',
      title: '2025/2026 Semester 1 Exam Timetable Published',
      message: 'Verify your course codes and examination halls in the Official Announcements panel.',
      read: true,
      createdAt: '2026-11-13T09:15:00Z',
    },
  ];

  const initialReports: DocumentReport[] = [
    {
      id: 'rep-1',
      documentId: 'doc-paper-12',
      documentTitle: SEED_DOCUMENTS[11]?.title || 'EEE 315 Examination Paper',
      courseCode: SEED_DOCUMENTS[11]?.courseCode || 'EEE 315',
      reporterId: 'usr-student-3',
      reporterName: 'Priya Nair',
      reportType: 'incorrect_metadata',
      details: 'Please confirm whether the semester label should read Semester 2 instead of Semester 1.',
      status: 'open',
      createdAt: '2026-11-13T16:40:00Z',
    },
  ];

  const initialSupport: SupportRequest[] = [
    {
      id: 'sup-1',
      userId: 'usr-student-2',
      senderName: 'Daniel Ochieng',
      senderEmail: 'daniel.ochieng@northbridge.edu',
      requestType: 'Missing Past Paper',
      subject: 'Request for SEN 304 2021/2022 End-of-Semester Paper',
      message: 'Could the Software Engineering department upload the 2021/2022 Software Architecture paper and rubric?',
      status: 'in_progress',
      adminResponse: 'Forwarded to Dr. Samuel Boateng for archival digitization.',
      createdAt: '2026-11-12T13:10:00Z',
    },
  ];

  const initialAuditLogs: AuditLogEntry[] = [
    {
      id: 'aud-1',
      actorId: 'usr-moderator-1',
      actorName: 'Evelyn Park (Academic Moderator)',
      actorRole: 'moderator',
      action: 'DOCUMENT_APPROVED',
      targetType: 'document',
      targetId: 'doc-scheme-1',
      details: 'Approved Official Marking Scheme (Demo) after metadata verification.',
      createdAt: '2026-11-12T11:35:00Z',
    },
    {
      id: 'aud-2',
      actorId: 'usr-admin-1',
      actorName: 'Dr. Julian Vance (Vault Administrator)',
      actorRole: 'admin',
      action: 'ANNOUNCEMENT_PUBLISHED',
      targetType: 'announcement',
      targetId: 'ann-1',
      details: 'Published 2025/2026 Semester 1 Final Examination Timetable notice.',
      createdAt: '2026-11-14T09:05:00Z',
    },
  ];

  return {
    users,
    institutions: SEED_INSTITUTIONS,
    campuses: SEED_CAMPUSES,
    faculties: SEED_FACULTIES,
    departments: SEED_DEPARTMENTS,
    programmes: SEED_PROGRAMMES,
    courses: SEED_COURSES,
    academicYears: ACADEMIC_YEARS,
    semesters: SEMESTERS,
    categories: DOCUMENT_CATEGORIES,
    documents: SEED_DOCUMENTS,
    collections: SEED_COLLECTIONS,
    bookmarkedIdsByUser: defaultBookmarks,
    recentViewsByUser: defaultViews,
    recentDownloadsByUser: defaultDownloads,
    examPlans: SEED_EXAM_PLANS,
    announcements: SEED_ANNOUNCEMENTS,
    notifications: initialNotifications,
    reports: initialReports,
    supportRequests: initialSupport,
    auditLogs: initialAuditLogs,
    settings: DEFAULT_PLATFORM_SETTINGS,
  };
}

class VaultStore {
  private state: VaultDatabaseState;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.state = JSON.parse(raw) as VaultDatabaseState;
      } catch {
        this.state = buildInitialState();
        this.persist();
      }
    } else {
      this.state = buildInitialState();
      this.persist();
    }
  }

  public getState(): VaultDatabaseState {
    return this.state;
  }

  public persist(): void {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE);
  }

  public sanitizeUser(u: StoredUserRecord): UserAccount {
    const { passwordHash: _ignored, ...safe } = u;
    return safe;
  }

  public addAuditLog(
    actor: { id: string; fullName: string; role: UserRole },
    action: string,
    targetType: AuditLogEntry['targetType'],
    targetId: string,
    details: string
  ) {
    this.state.auditLogs.unshift({
      id: `aud-${crypto.randomUUID().slice(0, 8)}`,
      actorId: actor.id,
      actorName: actor.fullName,
      actorRole: actor.role,
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    });
    if (this.state.auditLogs.length > 250) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 250);
    }
  }

  public pushNotification(
    userId: string,
    category: string,
    title: string,
    message: string,
    relatedDocumentId?: string
  ) {
    this.state.notifications.unshift({
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      category,
      title,
      message,
      relatedDocumentId,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
}

export const vaultStore = new VaultStore();
