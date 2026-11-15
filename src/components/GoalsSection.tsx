import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Flame,
  Plus,
  Sunrise,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { AcademicGoal, AchievementBadge, GoalTimeframe } from '../types/campus';

interface GoalsSectionProps {
  goals: AcademicGoal[];
  badges: AchievementBadge[];
  studyPoints: number;
  streakDays: number;
  onAddGoal: (input: {
    title: string;
    timeframe: GoalTimeframe;
    targetValue: number;
    unit: string;
  }) => void;
  onUpdateGoalProgress: (id: string, currentValue: number) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

const TIMEFRAMES = Object.values(GoalTimeframe);

function BadgeIcon({ name, unlocked }: { name: string; unlocked: boolean }) {
  const cls = `h-5 w-5 ${unlocked ? 'text-[#3867F4]' : 'text-slate-400'}`;
  switch (name) {
    case 'Flame':
      return <Flame className={cls} />;
    case 'CalendarCheck':
      return <CalendarCheck className={cls} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={cls} />;
    case 'Sunrise':
      return <Sunrise className={cls} />;
    case 'Brain':
      return <Brain className={cls} />;
    case 'BookOpen':
      return <BookOpen className={cls} />;
    case 'Award':
      return <Award className={cls} />;
    default:
      return <Trophy className={cls} />;
  }
}

export function GoalsSection({
  goals,
  badges,
  studyPoints,
  streakDays,
  onAddGoal,
  onUpdateGoalProgress,
  onToggleGoal,
  onDeleteGoal,
  onNotify,
}: GoalsSectionProps) {
  const [title, setTitle] = useState('');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>(GoalTimeframe.Weekly);
  const [targetValue, setTargetValue] = useState(5);
  const [unit, setUnit] = useState('tasks');
  const [filterTimeframe, setFilterTimeframe] = useState<'All' | GoalTimeframe>('All');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an academic goal.');
      return;
    }
    setErrorMsg('');
    onAddGoal({ title, timeframe, targetValue: Math.max(1, targetValue), unit });
    setTitle('');
    onNotify('Academic goal added.', 'success');
  };

  const level = Math.floor(studyPoints / 300) + 1;
  const levelTitles = ['Freshman Explorer', 'Focused Scholar', 'Deep Work Fellow', 'Honor Strategist', 'Study Legend'];
  const levelTitle = levelTitles[Math.min(level - 1, levelTitles.length - 1)];
  const nextLevelPct = Math.round(((studyPoints % 300) / 300) * 100);

  const achievedCount = goals.filter((g) => g.completed).length;
  const filteredGoals = goals.filter(
    (g) => filterTimeframe === 'All' || g.timeframe === filterTimeframe
  );

  return (
    <div className="space-y-6">
      {/* Gamification Overview */}
      <section className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F172A] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Study Points &amp; Level</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#3867F4] tabular-nums">
            {studyPoints} pts · Lv.{level}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            {levelTitle} ({nextLevelPct}% to Lv.{level + 1})
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Goals Completed</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#22C55E] tabular-nums">
            {achievedCount} / {goals.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Weekly &amp; semester milestones
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Streak &amp; Badges</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#F59E0B] tabular-nums">
            {streakDays}d · {badges.filter((b) => b.unlocked).length}/{badges.length} badges
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Weekly Challenge: 5 Pomodoro blocks
          </p>
        </div>
      </section>

      {/* Add Goal Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
          Academic Goals &amp; Progress Tracker
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Set daily, weekly, monthly, semester, and long-term academic targets.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label htmlFor="g-title" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Goal Title
            </label>
            <input
              id="g-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Study 3 hours daily or improve GPA to 3.9"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="g-tf" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Timeframe
            </label>
            <select
              id="g-tf"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as GoalTimeframe)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="g-target" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Target
            </label>
            <input
              id="g-target"
              type="number"
              min={1}
              max={1000}
              value={targetValue}
              onChange={(e) => setTargetValue(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="g-unit" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Unit
            </label>
            <input
              id="g-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="hrs / tasks / %"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:col-span-12">
            {errorMsg ? (
              <p className="text-xs font-medium text-red-600" role="alert">{errorMsg}</p>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>
        </form>
      </section>

      {/* Goals List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
            Active Milestones
          </h2>
          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {(['All', ...TIMEFRAMES] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setFilterTimeframe(tf)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  filterTimeframe === tf
                    ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {filteredGoals.length === 0 ? (
          <div className="py-10 text-center">
            <Target className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No goals in this timeframe.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
              return (
                <li key={goal.id} className="py-4 space-y-2.5">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          goal.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {goal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {goal.timeframe} · <span className="font-mono tabular-nums">{goal.milestoneLabel}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <input
                        type="range"
                        min={0}
                        max={goal.targetValue}
                        value={goal.currentValue}
                        onChange={(e) => onUpdateGoalProgress(goal.id, Number(e.target.value))}
                        aria-label={`Progress for ${goal.title}`}
                        className="w-28 accent-[#3867F4]"
                      />
                      <span className="w-10 text-right font-mono text-xs font-semibold text-[#3867F4] tabular-nums">
                        {pct}%
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleGoal(goal.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {goal.completed ? 'Undo' : 'Mark Achieved'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteGoal(goal.id);
                          onNotify('Goal deleted.', 'info');
                        }}
                        aria-label={`Delete goal ${goal.title}`}
                        className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-[width] duration-300 ${
                        goal.completed ? 'bg-[#22C55E]' : 'bg-[#3867F4]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Achievement Badges */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
              Achievement Badges (8 Milestones)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Badges unlock automatically as you complete focus sessions, tasks, notes, and quizzes.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`rounded-xl border p-4 transition-colors ${
                badge.unlocked
                  ? 'border-[#3867F4]/30 bg-[#3867F4]/5 dark:bg-[#3867F4]/10'
                  : 'border-slate-200 bg-slate-50 opacity-75 dark:border-slate-800 dark:bg-[#101B35]'
              }`}
            >
              <div className="flex items-center justify-between">
                <BadgeIcon name={badge.iconName} unlocked={badge.unlocked} />
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  +{badge.points} pts
                </span>
              </div>
              <h3 className="mt-3 font-display text-sm font-semibold text-[#101B35] dark:text-white">
                {badge.title}
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{badge.description}</p>
              <p
                className={`mt-2.5 text-[11px] font-semibold ${
                  badge.unlocked ? 'text-[#22C55E]' : 'text-slate-400'
                }`}
              >
                {badge.unlocked ? 'Unlocked' : `Requirement: ${badge.requirementText}`}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
