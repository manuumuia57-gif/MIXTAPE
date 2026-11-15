import React, { useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { StudySession } from '../types/campus';

interface PlannerSectionProps {
  studies: StudySession[];
  onAddStudy: (subject: string, date: string, time: string) => void;
  onDeleteStudy: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

function formatReadableDate(dateStr: string): string {
  if (!dateStr) return 'No date';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getSessionTimingLabel(date: string, time: string): { label: string; className: string } {
  const sessionDt = new Date(`${date}T${time || '00:00'}`);
  if (Number.isNaN(sessionDt.getTime())) {
    return { label: 'Scheduled', className: 'text-slate-600' };
  }
  const now = new Date();
  if (sessionDt.getTime() < now.getTime()) {
    return { label: 'Past session', className: 'text-slate-400' };
  }
  const diffHours = (sessionDt.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (diffHours <= 24) {
    return { label: 'Within 24h', className: 'text-amber-700 font-medium' };
  }
  return { label: 'Upcoming', className: 'text-emerald-700 font-medium' };
}

export function PlannerSection({
  studies,
  onAddStudy,
  onDeleteStudy,
  onNotify,
}: PlannerSectionProps) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !date || !time) {
      setErrorMsg('Please fill in subject, date, and start time.');
      return;
    }
    setErrorMsg('');
    onAddStudy(subject, date, time);
    setSubject('');
    setDate('');
    setTime('');
    onNotify('Study session scheduled.', 'success');
  };

  const sortedStudies = [...studies].sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Study Planner</h1>
            <p className="mt-1 text-sm text-slate-500">
              Schedule subject review blocks sorted chronologically.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            {studies.length} {studies.length === 1 ? 'session' : 'sessions'} planned
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label htmlFor="subjectInput" className="block text-xs font-medium text-slate-600">
              Subject or topic
            </label>
            <input
              id="subjectInput"
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Organic Chemistry Ch. 4"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="studyDate" className="block text-xs font-medium text-slate-600">
              Date
            </label>
            <input
              id="studyDate"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="studyTime" className="block text-xs font-medium text-slate-600">
              Start time
            </label>
            <input
              id="studyTime"
              type="time"
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 sm:col-span-12">
            {errorMsg ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errorMsg}
              </p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Plus className="h-4 w-4" />
              <span>Add Study Session</span>
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="border-b border-slate-100 pb-4 text-base font-semibold text-slate-900">
          Scheduled Sessions
        </h2>

        {sortedStudies.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No study sessions planned</p>
            <p className="mt-1 text-xs text-slate-500">
              Enter a subject, date, and time above to build your study timetable.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sortedStudies.map((study) => {
              const timing = getSessionTimingLabel(study.date, study.time);
              return (
                <li
                  key={study.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {study.subject}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">{formatReadableDate(study.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{study.time}</span>
                      <span aria-hidden="true">·</span>
                      <span className={timing.className}>{timing.label}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onDeleteStudy(study.id);
                      onNotify('Study session removed.', 'info');
                    }}
                    className="inline-flex items-center gap-1.5 self-end rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors whitespace-nowrap shrink-0 sm:self-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
