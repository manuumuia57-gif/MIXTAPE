import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  DOCUMENT_TYPES,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_SITE_SETTINGS,
  SEED_COURSES,
  SEED_DEPARTMENTS,
  SEED_DOCUMENTS,
  SEMESTERS,
} from '../src/data/vaultSeedData';
import {
  AdminUser,
  ContactMessage,
  Course,
  Department,
  DocumentType,
  LibraryDocument,
  SiteSettings,
} from '../src/types/vault';

export interface StoredAdminRecord extends AdminUser {
  passwordHash: string;
}

export interface LibraryDatabaseState {
  admin: StoredAdminRecord;
  departments: Department[];
  courses: Course[];
  academicYears: string[];
  semesters: string[];
  documentTypes: DocumentType[];
  documents: LibraryDocument[];
  settings: SiteSettings;
  contactMessages: ContactMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'library-db.json');
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

function buildInitialState(): LibraryDatabaseState {
  return {
    admin: {
      id: 'admin-primary',
      username: 'admin',
      email: 'admin@campuslibrary.edu',
      displayName: 'Institution Administrator',
      passwordHash: hashPassword('AdminLibrary2026!'),
    },
    departments: SEED_DEPARTMENTS,
    courses: SEED_COURSES,
    academicYears: INITIAL_ACADEMIC_YEARS,
    semesters: SEMESTERS,
    documentTypes: DOCUMENT_TYPES,
    documents: SEED_DOCUMENTS,
    settings: INITIAL_SITE_SETTINGS,
    contactMessages: [],
  };
}

class LibraryStore {
  private state: LibraryDatabaseState;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.state = JSON.parse(raw) as LibraryDatabaseState;
      } catch {
        this.state = buildInitialState();
        this.persist();
      }
    } else {
      this.state = buildInitialState();
      this.persist();
    }
  }

  public getState(): LibraryDatabaseState {
    return this.state;
  }

  public persist(): void {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE);
  }

  public sanitizeAdmin(a: StoredAdminRecord): AdminUser {
    const { passwordHash: _ignored, ...safe } = a;
    return safe;
  }
}

export const libraryStore = new LibraryStore();
