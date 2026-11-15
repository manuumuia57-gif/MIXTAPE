import { FormEvent, useState } from 'react';
import { CalendarClock, CheckSquare, Plus, Square, Trash2 } from 'lucide-react';
import { Course, ExamPrepPlan, UserAccount, VaultDocument } from '../types/vault';

interface ExamPrepViewProps {
  user: UserAccount | null;
  courses: Course[];
  documents: VaultDocument[];
  examPlans: ExamPrepPlan[];
  onOpenAuth: (tab: 'login' | 'register') => void;
  onCreatePlan: (payload: {
    courseCode: string;
    courseName: string;
    examTitle: string;
    examDate: string;
    venue: string;
    checklist: string[];
  }) => Promise<void>;
  onToggleChecklistItem: (plan: ExamPrepPlan, itemId: string) => Promise<void>;
  onAddChecklistItem: (plan: ExamPrepPlan, label: string) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
  onPreviewPdf: (doc: VaultDocument) => void;
}

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ExamPrepView({
  user,
  courses,
  documents,
  examPlans,
  onOpenAuth,
  onCreatePlan,
  onToggleChecklistItem,
  onAddChecklistItem,
  onDeletePlan,
  onPreviewPdf,
}: ExamPrepViewProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [examTitle, setExamTitle] = useState('End-of-Semester Examination');
  const [examDate, setExamDate] = useState('2026-12-10');
  const [venue, setVenue] = useState('Main Science Auditorium');
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-[#162033]">
        <CalendarClock className="mx-auto h-10 w-10 text-[#2563EB]" />
        <h2 className="mt-3 font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Sign in to open your Examination Preparation Center
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Build course-specific revision schedules, track countdown timers, and link past papers directly to your study checklists.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth('login')}
          className="mt-5 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleAddPlan = async (e: FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
    if (!course || !examDate) return;
    await onCreatePlan({
      courseCode: course.code,
      courseName: course.name,
      examTitle,
      examDate: `${examDate}T09:00:00Z`,
      venue,
      checklist: [
        `Download ${course.code} latest past examination paper`,
        `Complete timed practice paper without notes`,
        `Review official marking scheme or lecturer solutions`,
      ],
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]">
        <h1 className="font-display text-2xl font-bold text-[#14213D] dark:text-white">
          Examination Preparation Center
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Track upcoming examination countdowns, manage course revision checklists, and launch past papers directly from your study schedule.
        </p>

        <form onSubmit={handleAddPlan} className="mt-5 grid gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            placeholder="Exam title"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="date"
            required
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="Exam hall / venue"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Revision Plan</span>
          </button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {examPlans.map((plan) => {
          const completed = plan.checklist.filter((c) => c.completed).length;
          const total = plan.checklist.length || 1;
          const pct = Math.round((completed / total) * 100);
          const remainingDays = daysUntil(plan.examDate);
          const relatedPapers = documents.filter((d) => d.courseCode === plan.courseCode).slice(0, 3);

          return (
            <article
              key={plan.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#162033]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs font-bold text-[#2563EB]">
                    {plan.courseCode} · {plan.venue}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold text-[#14213D] dark:text-white">
                    {plan.courseName} — {plan.examTitle}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-xl font-bold tabular-nums text-[#14213D] dark:text-white">
                    {remainingDays}d
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">until exam</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">Revision Progress</span>
                  <span className="font-mono font-bold tabular-nums text-[#16A34A]">
                    {completed}/{plan.checklist.length} ({pct}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-full bg-[#16A34A] transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>

              {/* Interactive Checklist */}
              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                {plan.checklist.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onToggleChecklistItem(plan, item.id)}
                      className="flex w-full items-start gap-2.5 text-left text-xs"
                    >
                      {item.completed ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      )}
                      <span
                        className={
                          item.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-700 dark:text-slate-200'
                        }
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add Checklist Step */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={newTaskInputs[plan.id] || ''}
                  onChange={(e) => setNewTaskInputs((prev) => ({ ...prev, [plan.id]: e.target.value }))}
                  placeholder="Add revision step (e.g. Practice SQL normalization)..."
                  className="flex-1 rounded-lg border border-slate-200 bg-[#F4F7FB] px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const text = (newTaskInputs[plan.id] || '').trim();
                    if (!text) return;
                    await onAddChecklistItem(plan, text);
                    setNewTaskInputs((prev) => ({ ...prev, [plan.id]: '' }));
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#14213D] hover:border-[#2563EB] dark:border-slate-700 dark:text-white"
                >
                  Add
                </button>
              </div>

              {/* Linked Past Papers */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex flex-wrap gap-2">
                  {relatedPapers.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => onPreviewPdf(doc)}
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Open {doc.academicYear.split('/')[0]} {doc.category === 'Marking Schemes' ? 'Scheme' : 'Paper'}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onDeletePlan(plan.id)}
                  aria-label="Delete revision plan"
                  className="rounded p-1.5 text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
