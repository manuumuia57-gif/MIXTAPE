import { FormEvent, useState } from 'react';
import { CheckCircle2, ChevronDown, LifeBuoy, Megaphone } from 'lucide-react';
import { LANDING_FAQS } from '../data/vaultSeedData';
import { Announcement, SupportRequest, UserAccount } from '../types/vault';
import { formatShortDate } from './DocumentFormatUtils';

interface SupportViewProps {
  user: UserAccount | null;
  announcements: Announcement[];
  mySupportRequests: SupportRequest[];
  onSubmitSupport: (payload: {
    senderName: string;
    senderEmail: string;
    requestType: string;
    subject: string;
    message: string;
  }) => Promise<boolean>;
}

export function SupportView({
  user,
  announcements,
  mySupportRequests,
  onSubmitSupport,
}: SupportViewProps) {
  const [senderName, setSenderName] = useState(user?.fullName || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [requestType, setRequestType] = useState('Missing Past Paper');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await onSubmitSupport({
      senderName: senderName || user?.fullName || '',
      senderEmail: senderEmail || user?.email || '',
      requestType,
      subject,
      message,
    });
    if (ok) {
      setSubmitted(true);
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Official Institutional Announcements */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033] lg:col-span-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <Megaphone className="h-5 w-5 text-[#2563EB]" />
            <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
              Official Institutional Announcements
            </h1>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {announcements.map((ann) => (
              <article key={ann.id} className="py-4">
                <p className="text-[11px] font-semibold text-[#2563EB]">
                  Official Notice · {ann.category} · {formatShortDate(ann.publishedAt)}
                </p>
                <h2 className="mt-1 text-sm font-bold text-[#14213D] dark:text-white">
                  {ann.title}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {ann.body}
                </p>
                <p className="mt-1.5 text-[11px] text-slate-400">Issued by {ann.publishedBy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contact & Support Form */}
        <section className="space-y-6 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
              <LifeBuoy className="h-5 w-5 text-[#2563EB]" />
              <h2 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
                Contact & Academic Support Center
              </h2>
            </div>

            {submitted && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your request has been logged for administrator review.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="student@northbridge.edu"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Request Category
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="Missing Past Paper">Request a Missing Past Paper</option>
                  <option value="Correction Request">Report Incorrect Document Metadata</option>
                  <option value="New Course Recommendation">Recommend a New Course Unit</option>
                  <option value="Technical Support">Technical Support / File Issue</option>
                  <option value="General Inquiry">General Institutional Inquiry</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Missing CSC 405 2022/2023 End-of-Semester Paper"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Include course code, academic year, semester, or issue description..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Submit Support Request
              </button>
            </form>
          </div>

          {mySupportRequests.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
              <h3 className="font-display text-base font-bold text-[#14213D] dark:text-white">
                My Support Tickets ({mySupportRequests.length})
              </h3>
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {mySupportRequests.map((t) => (
                  <div key={t.id} className="py-2.5 text-xs">
                    <p className="font-bold text-[#14213D] dark:text-white">
                      {t.subject} · <span className="uppercase text-[#2563EB]">{t.status}</span>
                    </p>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-300">{t.message}</p>
                    {t.adminResponse && (
                      <p className="mt-1 font-medium text-[#16A34A]">Response: {t.adminResponse}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Frequently Asked Questions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <h2 className="font-display text-xl font-bold text-[#14213D] dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {LANDING_FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={item.q} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-bold text-[#14213D] dark:text-white">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
