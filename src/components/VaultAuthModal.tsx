import { FormEvent, useState } from 'react';
import { Lock, Mail, ShieldCheck, User, X } from 'lucide-react';
import { Department, UserAccount } from '../types/vault';

interface VaultAuthModalProps {
  open: boolean;
  initialTab?: 'login' | 'register' | 'recover';
  departments: Department[];
  onClose: () => void;
  onSuccess: (user: UserAccount, token: string) => void;
}

const DEMO_ROLES = [
  {
    role: 'Student',
    email: 'maya.lin@northbridge.edu',
    pass: 'StudentVault2026!',
    note: 'Browse, download, bookmark, exam prep & submit uploads for review',
  },
  {
    role: 'Lecturer',
    email: 'a.pendelton@northbridge.edu',
    pass: 'LecturerVault2026!',
    note: 'Upload verified exam papers, marking schemes & review dept items',
  },
  {
    role: 'Moderator',
    email: 'moderator@northbridge.edu',
    pass: 'ModeratorVault2026!',
    note: 'Approve/reject pending uploads, edit metadata & resolve reports',
  },
  {
    role: 'Administrator',
    email: 'admin@northbridge.edu',
    pass: 'AdminVault2026!',
    note: 'Full platform governance, users, courses, analytics & settings',
  },
];

export function VaultAuthModal({
  open,
  initialTab = 'login',
  departments,
  onClose,
  onSuccess,
}: VaultAuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'recover'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-csc');
  const [academicYear, setAcademicYear] = useState('Year 2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!open) return null;

  const submitLogin = async (loginEmail: string, loginPass: string) => {
    setError('');
    setInfoMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        return;
      }
      onSuccess(data.user, data.token);
      onClose();
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (tab === 'login') {
      await submitLogin(email, password);
      return;
    }

    if (tab === 'recover') {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) setError(data.error || 'Unable to process recovery request.');
        else setInfoMsg(data.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Register
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, departmentId, academicYear }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }
      onSuccess(data.user, data.token);
      onClose();
    } catch {
      setError('Unable to connect to registration endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-auth-title"
    >
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#162033] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            Campus Exam Vault Access
          </p>
          <h2 id="vault-auth-title" className="mt-1 font-display text-2xl font-bold text-[#14213D] dark:text-white">
            {tab === 'login'
              ? 'Sign in to your institutional account'
              : tab === 'register'
              ? 'Create a Student Vault Account'
              : 'Password Recovery'}
          </h2>
        </div>

        <div className="mb-6 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900/60">
          {(['login', 'register', 'recover'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError('');
                setInfoMsg('');
              }}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === t
                  ? 'bg-white text-[#14213D] shadow-sm dark:bg-[#1E293B] dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t === 'login' ? 'Sign In' : t === 'register' ? 'Register Student' : 'Recover Password'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}
        {infoMsg && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
            {infoMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Kamau"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@northbridge.edu"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {tab !== 'recover' && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password {tab === 'register' && '(minimum 8 characters)'}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={tab === 'register' ? 8 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {tab === 'register' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Academic Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {loading
              ? 'Authenticating...'
              : tab === 'login'
              ? 'Sign In to Vault'
              : tab === 'register'
              ? 'Create Student Account'
              : 'Request Recovery Instructions'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#14213D] dark:text-slate-200">
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
            <span>Demonstration Accounts (One-Click Role Access)</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {DEMO_ROLES.map((demo) => (
              <button
                key={demo.role}
                type="button"
                disabled={loading}
                onClick={() => submitLogin(demo.email, demo.pass)}
                className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-3 text-left transition-colors hover:border-[#2563EB] hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-[#2563EB]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14213D] dark:text-white">{demo.role}</span>
                  <span className="font-mono text-[11px] text-[#2563EB]">Sign in</span>
                </div>
                <p className="mt-1 truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {demo.email}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-slate-600 dark:text-slate-400">
                  {demo.note}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
