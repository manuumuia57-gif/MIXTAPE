import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Target, Trash2 } from 'lucide-react';
import { AcademicGoal } from '../types/campus';

interface GoalsSectionProps {
  goals: AcademicGoal[];
  onAddGoal: (title: string) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

export function GoalsSection({
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onNotify,
}: GoalsSectionProps) {
  const [goalText, setGoalText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) {
      setErrorMsg('Please enter an academic goal.');
      return;
    }
    setErrorMsg('');
    onAddGoal(goalText);
    setGoalText('');
    onNotify('Academic goal added.', 'success');
  };

  const achievedCount = goals.filter((g) => g.completed).length;
  const pct = goals.length === 0 ? 0 : Math.round((achievedCount / goals.length) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Academic Goals</h1>
            <p className="mt-1 text-sm text-slate-500">
              Define semester milestones and track long-term outcomes.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            {achievedCount} of {goals.length} achieved ({pct}%)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="goalInput" className="block text-xs font-medium text-slate-600">
              Academic goal
            </label>
            <input
              id="goalInput"
              type="text"
              value={goalText}
              onChange={(e) => {
                setGoalText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Earn an A in Linear Algebra"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Plus className="h-4 w-4" />
            <span>Add Goal</span>
          </button>
        </form>
        {errorMsg && (
          <p className="mt-2 text-xs font-medium text-red-600" role="alert">
            {errorMsg}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="border-b border-slate-100 pb-4 text-base font-semibold text-slate-900">
          Goal Checklist
        </h2>

        {goals.length === 0 ? (
          <div className="py-12 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No academic goals set yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Add GPA targets, research milestones, or semester objectives above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {goals.map((goal) => (
              <li
                key={goal.id}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleGoal(goal.id)}
                    aria-label={goal.completed ? `Undo "${goal.title}"` : `Mark "${goal.title}" achieved`}
                    className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 rounded-full focus-visible:outline-2 focus-visible:outline-indigo-600"
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium break-words ${
                        goal.completed ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {goal.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {goal.completed ? (
                        <span className="font-medium text-emerald-700">Achieved</span>
                      ) : (
                        <span>In progress</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onToggleGoal(goal.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    {goal.completed ? 'Undo' : 'Achieved'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteGoal(goal.id);
                      onNotify('Academic goal removed.', 'info');
                    }}
                    aria-label={`Delete goal "${goal.title}"`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
