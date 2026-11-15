import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react';
import { ExamItem, StudySession, Task } from '../types/campus';

interface PlannerSectionProps {
  studies: StudySession[];
  tasks: Task[];
  exams: ExamItem[];
  onAddStudy: (input: Omit<StudySession, 'id' | 'completed' | 'isDemo'>) => void;
  onUpdateStudy: (id: string, patch: Partial<StudySession>) => void;
  onDeleteStudy: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export function PlannerSection({
  studies,
  tasks,
  exams,
  onAddStudy,
  onUpdateStudy,
  onDeleteStudy,
  onNotify,
}: PlannerSectionProps) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:30');
  const [location, setLocation] = useState('Main Library');
  const [objective, setObjective] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(10);
  const [errorMsg, setErrorMsg] = useState('');

  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !date || !startTime || !endTime) {
      setErrorMsg('Please fill in subject, date, start time, and end time.');
      return;
    }
    setErrorMsg('');
    onAddStudy({
      subject: subject.trim(),
      date,
      startTime,
      endTime,
      location: location.trim() || 'Study Desk',
      objective: objective.trim() || 'Focused review block',
      breakMinutes,
    });
    setSubject('');
    setObjective('');
    onNotify('Study session scheduled.', 'success');
  };

  const generateSuggestedSchedule = () => {
    const urgentTasks = tasks.filter((t) => !t.completed).slice(0, 2);
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1);
    const tomorrow = baseDate.toISOString().slice(0, 10);

    if (urgentTasks.length === 0) {
      onAddStudy({
        subject: 'General Concept Review',
        date: tomorrow,
        startTime: '09:00',
        endTime: '10:30',
        location: 'Quiet Study Space',
        objective: 'Active recall flashcard synthesis',
        breakMinutes: 10,
      });
    } else {
      urgentTasks.forEach((t, idx) => {
        onAddStudy({
          subject: t.category,
          date: tomorrow,
          startTime: idx === 0 ? '09:00' : '15:00',
          endTime: idx === 0 ? '10:30' : '16:30',
          location: 'Suggested Deep Work Block',
          objective: `Advance: ${t.title.slice(0, 60)}`,
          breakMinutes: 10,
        });
      });
    }
    onNotify('Suggested study blocks added for tomorrow based on pending tasks.', 'success');
  };

  const subjects = ['All', ...Array.from(new Set(studies.map((s) => s.subject)))];

  const sortedStudies = [...studies]
    .filter((s) => selectedSubjectFilter === 'All' || s.subject === selectedSubjectFilter)
    .filter((s) => {
      if (viewMode === 'daily') return s.date === todayStr;
      if (viewMode === 'weekly') {
        const diffDays =
          (new Date(`${s.date}T00:00:00`).getTime() - new Date(`${todayStr}T00:00:00`).getTime()) /
          (1000 * 60 * 60 * 24);
        return diffDays >= -1 && diffDays <= 7;
      }
      return true;
    })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  // Build 7-day strip for Weekly overview
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso,
      label: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      sessions: studies.filter((s) => s.date === iso),
    };
  });

  // Build 28-day month grid
  const monthDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      iso,
      dayNum: d.getDate(),
      count: studies.filter((s) => s.date === iso).length,
      isToday: iso === todayStr,
    };
  });

  return (
    <div className="space-y-6">
      {/* Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
              Advanced Study Planner
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Schedule subject sessions with locations, objectives, breaks, and calendar views.
            </p>
          </div>
          <button
            type="button"
            onClick={generateSuggestedSchedule}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-[#7856FF]/40 bg-[#7856FF]/10 px-3.5 py-2 text-xs font-semibold text-[#7856FF] hover:bg-[#7856FF]/15 transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Suggest Study Schedule</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <label htmlFor="sp-sub" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Subject
            </label>
            <input
              id="sp-sub"
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Linear Algebra (MATH 240)"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="sp-date" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Study Date
            </label>
            <input
              id="sp-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="sp-start" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Start Time
            </label>
            <input
              id="sp-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="sp-end" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              End Time
            </label>
            <input
              id="sp-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-1">
            <label htmlFor="sp-brk" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Break
            </label>
            <input
              id="sp-brk"
              type="number"
              min={0}
              max={60}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <label htmlFor="sp-loc" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Study Location
            </label>
            <input
              id="sp-loc"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Library Quiet Wing"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="sp-obj" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Study Objective
            </label>
            <input
              id="sp-obj"
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g., Complete 10 eigenvalue proofs and summarize notes"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end sm:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule</span>
            </button>
          </div>

          {errorMsg && (
            <p className="sm:col-span-12 text-xs font-medium text-red-600" role="alert">
              {errorMsg}
            </p>
          )}
        </form>
      </section>

      {/* Calendar Views & Exam Countdown Strip */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start dark:bg-slate-800">
            {(['daily', 'weekly', 'monthly'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                {mode} Calendar
              </button>
            ))}
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            aria-label="Filter study sessions by subject"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub === 'All' ? 'All Subjects' : sub}</option>
            ))}
          </select>
        </div>

        {viewMode === 'weekly' && (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {weekDays.map((day) => (
              <div
                key={day.iso}
                className={`rounded-xl border p-3 ${
                  day.iso === todayStr
                    ? 'border-[#3867F4] bg-[#3867F4]/5 dark:bg-[#3867F4]/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#101B35]'
                }`}
              >
                <p className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {day.label}
                </p>
                <div className="mt-2 space-y-1.5">
                  {day.sessions.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Open day</p>
                  ) : (
                    day.sessions.map((s) => (
                      <div key={s.id} className="rounded-md border border-slate-200 bg-white p-2 text-[11px] dark:border-slate-700 dark:bg-slate-900">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                          {s.subject}
                        </p>
                        <p className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                          {s.startTime}–{s.endTime}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'monthly' && (
          <div className="mt-5 grid grid-cols-7 gap-2">
            {monthDays.map((cell) => (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setDate(cell.iso)}
                className={`rounded-lg border p-2.5 text-left transition-colors ${
                  cell.isToday
                    ? 'border-[#3867F4] bg-[#3867F4]/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-[#101B35]'
                }`}
              >
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                  {cell.dayNum}
                </span>
                <p className="mt-1 text-[11px] text-[#3867F4] dark:text-[#818CF8]">
                  {cell.count > 0 ? `${cell.count} block${cell.count > 1 ? 's' : ''}` : '—'}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Session List */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
            Scheduled Study Sessions ({sortedStudies.length})
          </h2>

          {sortedStudies.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                No sessions in this timeframe
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {sortedStudies.map((session) => (
                <li
                  key={session.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStudy(session.id, { completed: !session.completed })}
                      aria-label={session.completed ? 'Mark incomplete' : 'Mark session completed'}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-[#22C55E]"
                    >
                      {session.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          session.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {session.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                        {session.objective}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="h-3.5 w-3.5" />
                          {session.date} · {session.startTime}–{session.endTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {session.location}
                        </span>
                        <span>{session.breakMinutes}m break</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <input
                      type="date"
                      value={session.date}
                      aria-label={`Reschedule ${session.subject}`}
                      onChange={(e) => {
                        onUpdateStudy(session.id, { date: e.target.value });
                        onNotify('Session rescheduled.', 'info');
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteStudy(session.id);
                        onNotify('Study session removed.', 'info');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Upcoming Exam Countdowns Reference */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
          Examination Countdowns (Plan Revision Around These Dates)
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {exams.slice(0, 3).map((ex) => {
            const days = Math.max(
              0,
              Math.ceil((new Date(ex.dueDateTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            );
            return (
              <div
                key={ex.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#101B35]"
              >
                <p className="font-mono text-xs font-semibold text-[#3867F4]">{ex.courseCode}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{ex.title}</p>
                <p className="mt-2 font-mono text-xs text-amber-600 dark:text-amber-400 tabular-nums">
                  {days} days remaining
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
