import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { AdminUser } from '../types/vault';

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (token: string, admin: AdminUser) => void;
}

export function AdminLoginModal({ open, onClose, onSuccess }: AdminLoginModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid administrator credentials.');
        setSubmitting(false);
        return;
      }
      onSuccess(data.token, data.admin);
      setIdentifier('');
      setPassword('');
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setIdentifier('admin@dkut.ac.ke');
    setPassword('AdminDekut2026!');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Administrator Login"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#162033]">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213D] text-white dark:bg-[#2563EB]">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                DeKUT Administrator Login
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Private library management access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login dialog"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#14213D] dark:text-slate-200">
              Username or Email
            </label>
            <input
              type="text"
              required
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin or admin@dkut.ac.ke"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#14213D] focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#14213D] dark:text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter administrator password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-[#14213D] focus:border-[#2563EB] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Login to Admin Dashboard'}
          </button>

          <div className="rounded-xl border border-slate-200 bg-[#F4F7FB] p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-[#14213D] dark:text-white">Default Administrator Access</p>
                <p className="mt-0.5 font-mono">
                  admin@dkut.ac.ke · AdminDekut2026!
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 font-semibold text-[#2563EB] hover:border-[#2563EB] dark:border-slate-700 dark:bg-[#162033] shrink-0"
              >
                Autofill
              </button>
            </div>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Change your email, username, and password anytime inside Website Settings.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
