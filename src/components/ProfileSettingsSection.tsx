import React, { useState } from 'react';
import { LogOut, Moon, RotateCcw, Save, Shield, Sun } from 'lucide-react';
import { UserProfile } from '../types/campus';

interface ProfileSettingsSectionProps {
  profile: UserProfile;
  theme: 'light' | 'dark';
  authToken: string | null;
  onUpdateProfile: (next: UserProfile) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  onResetDemoData: () => void;
  onOpenAuth: () => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function ProfileSettingsSection({
  profile,
  theme,
  authToken,
  onUpdateProfile,
  onToggleTheme,
  onLogout,
  onResetDemoData,
  onOpenAuth,
  onNotify,
}: ProfileSettingsSectionProps) {
  const [form, setForm] = useState<UserProfile>(profile);
  const [interestsText, setInterestsText] = useState(profile.studyInterests.join(', '));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedInterests = interestsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdateProfile({
      ...form,
      studyInterests: parsedInterests,
    });
    onNotify('Profile and preferences saved.', 'success');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus('');
    if (!authToken) {
      setPasswordStatus('Please sign in first to update your server password.');
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordStatus(data.error || 'Could not update password.');
      } else {
        setPasswordStatus(data.message);
        setCurrentPassword('');
        setNewPassword('');
        onNotify('Account password updated.', 'success');
      }
    } catch {
      setPasswordStatus('Unable to reach server.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              {!avatarError && form.avatarUrl ? (
                <img
                  src={form.avatarUrl}
                  alt={form.fullName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#3867F4] font-display text-xl font-bold text-white">
                  {form.fullName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
                {profile.fullName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile.email} · Role: <span className="capitalize font-semibold">{profile.role}</span> · Plan:{' '}
                <span className="uppercase font-semibold">{profile.plan}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!authToken ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-lg bg-[#3867F4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2952d6]"
              >
                Sign In / Switch Account
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Edit Profile Form */}
        <form
          onSubmit={handleSaveProfile}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A] lg:col-span-7"
        >
          <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
            Academic Profile Details
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-name" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="pf-name"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="pf-email" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Email
              </label>
              <input
                id="pf-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="pf-inst" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Institution
              </label>
              <input
                id="pf-inst"
                type="text"
                value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="pf-course" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Course / Major
              </label>
              <input
                id="pf-course"
                type="text"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="pf-year" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Academic Year
              </label>
              <input
                id="pf-year"
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="pf-lang" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Language Preference
              </label>
              <select
                id="pf-lang"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="pf-int" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Study Interests (comma-separated)
            </label>
            <input
              id="pf-int"
              type="text"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="pf-bio" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Personal Biography
            </label>
            <textarea
              id="pf-bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#3867F4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2952d6]"
          >
            <Save className="h-4 w-4" />
            <span>Save Profile &amp; Preferences</span>
          </button>
        </form>

        {/* Preferences & Security */}
        <div className="space-y-6 lg:col-span-5">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
            <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
              Theme, Notifications &amp; Privacy
            </h2>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</p>
                <p className="text-xs text-slate-500">Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
              </div>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {(
                [
                  ['deadlines', 'Notify me of approaching assignment & exam deadlines'],
                  ['studyReminders', 'Notify me before scheduled study sessions'],
                  ['goalAchievements', 'Notify me when goals or badges unlock'],
                  ['communityReplies', 'Notify me of replies in Student Community'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notificationsEnabled[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notificationsEnabled: {
                          ...form.notificationsEnabled,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-300 text-[#3867F4]"
                  />
                  <span>{label}</span>
                </label>
              ))}

              <label className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.privacyShowStreak}
                  onChange={(e) => setForm({ ...form, privacyShowStreak: e.target.checked })}
                  className="rounded border-slate-300 text-[#3867F4]"
                />
                <span>Show study streak in study groups (email always stays private)</span>
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#3867F4]" />
              <h2 className="font-display text-base font-bold text-[#101B35] dark:text-white">
                Account Security
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-2.5">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
              {passwordStatus && (
                <p className="text-xs font-medium text-[#3867F4]">{passwordStatus}</p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg border border-slate-300 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Update Password
              </button>
            </form>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  onNotify('Sample campus dataset restored.', 'info');
                }}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restore Sample Demo Data</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
