import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, User, X } from 'lucide-react';
import { UserProfile } from '../types/campus';
import { DEFAULT_STUDENT_AVATAR } from '../data/seedData';
import { BrandLogo } from './BrandLogo';

interface AuthModalProps {
  open: boolean;
  initialTab: 'login' | 'signup';
  onClose: () => void;
  onAuthSuccess: (user: Partial<UserProfile> & { role: 'student' | 'admin' }, token: string) => void;
}

export function AuthModal({ open, initialTab, onClose, onAuthSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup' | 'recover'>(initialTab);
  const [email, setEmail] = useState('student@focuscampus.edu');
  const [password, setPassword] = useState('Focus2026!');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (tab === 'recover') {
        const res = await fetch('/api/auth/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Could not process recovery request.');
        } else {
          setInfoMsg(data.message);
        }
        return;
      }

      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        tab === 'login'
          ? { email, password }
          : { email, password, fullName, institution, course };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed.');
        return;
      }

      onAuthSuccess(
        {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
          institution: data.user.institution,
          course: data.user.course,
          academicYear: data.user.academicYear,
          avatarUrl: DEFAULT_STUDENT_AVATAR,
          isDemoAccount:
            data.user.email === 'student@focuscampus.edu' ||
            data.user.email === 'admin@focuscampus.edu',
        },
        data.token
      );
      onClose();
    } catch {
      setErrorMsg('Network error reaching FocusCampus authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'student' | 'admin') => {
    setTab('login');
    setErrorMsg('');
    setInfoMsg('');
    if (role === 'admin') {
      setEmail('admin@focuscampus.edu');
      setPassword('AdminCampus2026!');
    } else {
      setEmail('student@focuscampus.edu');
      setPassword('Focus2026!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-7 w-7" />
            <h2 id="auth-modal-title" className="font-display text-lg font-bold text-[#101B35] dark:text-white">
              FocusCampus Account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['login', 'signup', 'recover'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize transition-colors ${
                tab === t
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-[#0F172A] dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              {t === 'signup' ? 'Sign Up' : t === 'recover' ? 'Reset Password' : 'Log In'}
            </button>
          ))}
        </div>

        {tab === 'login' && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              Quick Demo Credentials
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student')}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-[#3867F4] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Use Student Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 font-medium text-slate-700 hover:border-[#7856FF] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#7856FF]" />
                Use Admin Demo
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {tab === 'signup' && (
            <>
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="auth-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Jordan Alvarez"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="auth-inst" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Institution
                  </label>
                  <input
                    id="auth-inst"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="State University"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="auth-course" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                    Major / Course
                  </label>
                  <input
                    id="auth-course"
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Computer Science"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              University or Personal Email
            </label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {tab !== 'recover' && (
            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {errorMsg}
            </p>
          )}
          {infoMsg && (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400" role="status">
              {infoMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#3867F4] py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6] disabled:opacity-60 transition-colors"
          >
            {loading
              ? 'Processing...'
              : tab === 'login'
              ? 'Sign In to Workspace'
              : tab === 'signup'
              ? 'Create Student Account'
              : 'Send Recovery Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
