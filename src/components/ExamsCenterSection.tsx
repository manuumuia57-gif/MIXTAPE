import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, MapPin, Plus, Trash2 } from 'lucide-react';
import { ExamItem } from '../types/campus';

interface ExamsCenterSectionProps {
  exams: ExamItem[];
  onAddExam: (input: Omit<ExamItem, 'id' | 'isDemo'>) => void;
  onUpdateExam: (id: string, patch: Partial<ExamItem>) => void;
  onDeleteExam: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function ExamsCenterSection({
  exams,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onNotify,
}: ExamsCenterSectionProps) {
  const [now, setNow] = useState(() => new Date());
  const [courseCode, setCourseCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ExamItem['type']>('Examination');
  const [dueDateTime, setDueDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !title.trim() || !dueDateTime) {
      setErrorMsg('Please enter course code, title, and date/time.');
      return;
    }
    setErrorMsg('');
    onAddExam({
      courseCode: courseCode.trim().toUpperCase(),
      title: title.trim(),
      type,
      dueDateTime,
      location: location.trim() || 'Campus Hall',
      submitted: false,
      revisionProgress: 0,
      notes: notes.trim(),
    });
    setCourseCode('');
    setTitle('');
    setLocation('');
    setNotes('');
    onNotify('Added to Examination & Assignment Center.', 'success');
  };

  const sorted = [...exams].sort((a, b) => a.dueDateTime.localeCompare(b.dueDateTime));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
          Examination &amp; Assignment Center
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Track official examination timetables, submission portals, and live revision countdowns.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-2">
            <label htmlFor="ex-code" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Course Code
            </label>
            <input
              id="ex-code"
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="CS 410"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="ex-title" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Exam or Deliverable Title
            </label>
            <input
              id="ex-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Final Examination"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ex-type" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Type
            </label>
            <select
              id="ex-type"
              value={type}
              onChange={(e) => setType(e.target.value as ExamItem['type'])}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="Examination">Examination</option>
              <option value="Assignment">Assignment</option>
              <option value="Project">Project</option>
            </select>
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="ex-dt" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Date &amp; Time
            </label>
            <input
              id="ex-dt"
              type="datetime-local"
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-4">
            <label htmlFor="ex-loc" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Room / Submission Link
            </label>
            <input
              id="ex-loc"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hall A or Portal"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-6">
            <label htmlFor="ex-notes" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Revision Scope / Notes
            </label>
            <input
              id="ex-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chapters covered, allowed materials..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6]"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          {errorMsg && <p className="sm:col-span-12 text-xs font-medium text-red-600">{errorMsg}</p>}
        </form>
      </section>

      {/* Countdown Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sorted.map((item) => {
          const target = new Date(item.dueDateTime);
          const diffMs = target.getTime() - now.getTime();
          const hoursTotal = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
          const days = Math.floor(hoursTotal / 24);
          const hours = hoursTotal % 24;
          const isApproaching = !item.submitted && hoursTotal <= 72;

          return (
            <article
              key={item.id}
              className={`rounded-2xl border p-5 ${
                isApproaching
                  ? 'border-amber-300 bg-amber-50/40 dark:border-amber-700/60 dark:bg-amber-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-[#3867F4]">
                    {item.courseCode} · {item.type}
                  </p>
                  <h2 className="mt-1 font-display text-base font-bold text-[#101B35] dark:text-white">
                    {item.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`font-mono text-lg font-bold tabular-nums ${
                      item.submitted
                        ? 'text-[#22C55E]'
                        : isApproaching
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-[#101B35] dark:text-white'
                    }`}
                  >
                    {item.submitted ? 'Submitted' : `${days}d ${hours}h`}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {target.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {item.location}
                </span>
                {item.notes && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{item.notes}</span>
                  </>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Revision:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={item.revisionProgress}
                    onChange={(e) => onUpdateExam(item.id, { revisionProgress: Number(e.target.value) })}
                    aria-label={`Revision readiness for ${item.title}`}
                    className="w-24 accent-[#3867F4]"
                  />
                  <span className="font-mono text-xs font-semibold tabular-nums">
                    {item.revisionProgress}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateExam(item.id, { submitted: !item.submitted })}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <CheckCircle2 className={`h-3.5 w-3.5 ${item.submitted ? 'text-[#22C55E]' : 'text-slate-400'}`} />
                    <span>{item.submitted ? 'Completed' : 'Mark Ready'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExam(item.id)}
                    aria-label={`Delete ${item.title}`}
                    className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center dark:border-slate-800 dark:bg-[#0F172A]">
          <CalendarClock className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No examinations or deadlines added yet.</p>
        </div>
      )}
    </div>
  );
}
