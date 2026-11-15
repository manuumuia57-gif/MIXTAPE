import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Plus,
  RefreshCw,
  Target,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AcademicGoal,
  ExamItem,
  FocusSessionRecord,
  NavSection,
  Priority,
  StudySession,
  Task,
  UserProfile,
} from '../types/campus';
import { MOTIVATIONAL_QUOTES } from '../data/seedData';

interface DashboardOverviewProps {
  profile: UserProfile;
  tasks: Task[];
  studies: StudySession[];
  goals: AcademicGoal[];
  exams: ExamItem[];
  focusMinutes: number;
  focusHistory: FocusSessionRecord[];
  streakDays: number;
  studyPoints: number;
  timerRunning: boolean;
  formattedTimeLeft: string;
  onToggleTask: (id: string) => void;
  onNavigate: (section: NavSection) => void;
}

const CHART_COLORS = ['#3867F4', '#7856FF', '#22C55E', '#F59E0B', '#0EA5E9'];

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardOverview({
  profile,
  tasks,
  studies,
  goals,
  exams,
  focusMinutes,
  focusHistory,
  streakDays,
  studyPoints,
  timerRunning,
  formattedTimeLeft,
  onToggleTask,
  onNavigate,
}: DashboardOverviewProps) {
  const [now, setNow] = useState(() => new Date());
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taskPct = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const completedGoals = goals.filter((g) => g.completed).length;
  const goalPct = goals.length === 0 ? 0 : Math.round((completedGoals / goals.length) * 100);

  const totalHours = (focusMinutes / 60).toFixed(1);
  const weeklyProductivityScore = Math.min(
    99,
    Math.round(taskPct * 0.45 + Math.min(100, (focusMinutes / 240) * 100) * 0.35 + goalPct * 0.2)
  );

  // Weekly Study Activity Chart Data
  const baseWeeklyHours = [2.2, 2.8, 1.9, 3.1, 2.6, 1.5, Math.max(0.8, Number((focusMinutes / 60 - 11.5).toFixed(1)))];
  const weeklyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => ({
    day,
    hours: Math.max(0.5, Number(baseWeeklyHours[idx].toFixed(1))),
    tasks: idx === 6 ? completedTasks % 5 || 2 : [3, 4, 2, 5, 3, 2][idx],
  }));

  // Monthly Productivity Trend
  const monthlyData = [
    { week: 'Week 1', score: 68 },
    { week: 'Week 2', score: 74 },
    { week: 'Week 3', score: 81 },
    { week: 'Current', score: weeklyProductivityScore },
  ];

  // Subject Performance / Time Distribution
  const subjectCounts: Record<string, number> = {};
  focusHistory.forEach((f) => {
    subjectCounts[f.subject] = (subjectCounts[f.subject] || 0) + f.durationMinutes;
  });
  studies.forEach((s) => {
    const shortName = s.subject.split('(')[0].trim();
    subjectCounts[shortName] = (subjectCounts[shortName] || 0) + 45;
  });
  const subjectDistData = Object.entries(subjectCounts)
    .slice(0, 5)
    .map(([name, minutes]) => ({
      name: name.length > 18 ? `${name.slice(0, 16)}…` : name,
      hours: Number((minutes / 60).toFixed(1)),
    }));

  // Task Category Completion
  const categoryStats = Object.entries(
    tasks.reduce<Record<string, { total: number; done: number }>>((acc, t) => {
      if (!acc[t.category]) acc[t.category] = { total: 0, done: 0 };
      acc[t.category].total += 1;
      if (t.completed) acc[t.category].done += 1;
      return acc;
    }, {})
  ).map(([category, stats]) => ({
    category: category.split(' ')[0],
    completed: stats.done,
    pending: stats.total - stats.done,
  }));

  const upcomingDeadlines = [...exams]
    .filter((e) => !e.submitted)
    .sort((a, b) => a.dueDateTime.localeCompare(b.dueDateTime))
    .slice(0, 4);

  const priorityTasks = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const weights = {
        [Priority.Urgent]: 0,
        [Priority.High]: 1,
        [Priority.Medium]: 2,
        [Priority.Low]: 3,
      };
      return weights[a.priority] - weights[b.priority] || (a.date || '9999').localeCompare(b.date || '9999');
    })
    .slice(0, 5);

  const quote = MOTIVATIONAL_QUOTES[quoteIdx % MOTIVATIONAL_QUOTES.length];

  return (
    <div className="space-y-6">
      {/* Welcome & Daily Quote Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              {!avatarError && profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#3867F4] font-display text-lg font-bold text-white">
                  {profile.fullName.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {now.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                ·{' '}
                {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#101B35] dark:text-white">
                {getGreeting(now.getHours())}, {profile.fullName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile.course} · {profile.institution}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#101B35] lg:max-w-md">
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-[#3867F4] dark:text-[#818CF8]">
                Daily Motivation
              </span>
              <button
                type="button"
                onClick={() => setQuoteIdx((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Next Quote</span>
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              “{quote.text}” — <span className="text-slate-500 dark:text-slate-400">{quote.author}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Tasks)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3867F4] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Task</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Focus)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7856FF] px-3.5 py-2 text-xs font-semibold text-white hover:opacity-95 transition-opacity whitespace-nowrap"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{timerRunning ? `Focus Active (${formattedTimeLeft})` : 'Start Focus Session'}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Planner)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Create Study Plan</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Notes)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Write a Note</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Goals)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <Target className="h-3.5 w-3.5" />
            <span>Set Academic Goal</span>
          </button>
        </div>
      </section>

      {/* Core KPI Grid */}
      <section className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F172A] sm:grid-cols-2 sm:divide-x lg:grid-cols-4 lg:divide-y-0">
        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Study Hours</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#3867F4] tabular-nums">
            {totalHours} hrs
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {focusMinutes} focus min · {focusHistory.length} sessions
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tasks Completed</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#22C55E] tabular-nums">
            {completedTasks} / {totalTasks}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {pendingTasks} pending · {taskPct}% completion
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly Productivity</p>
          <p className="mt-2 font-mono text-3xl font-bold text-[#7856FF] tabular-nums">
            {weeklyProductivityScore}%
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {goalPct}% goal progress · {studyPoints} pts
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Study Streak</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-3xl font-bold text-[#F59E0B] tabular-nums">
            <Flame className="h-6 w-6 shrink-0" />
            <span>{streakDays} days</span>
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {upcomingDeadlines.length} upcoming deadlines
          </p>
        </div>
      </section>

      {/* Analytics Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                Weekly Study Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily focused study hours across the current week
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-[#3867F4] tabular-nums">
              {totalHours} hrs total
            </span>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="hours" name="Study Hours" fill="#3867F4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                Monthly Productivity Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Composite score of task velocity, focus hours, and goals
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-[#22C55E] tabular-nums">
              +13% vs Week 1
            </span>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Productivity %"
                  stroke="#7856FF"
                  fill="#7856FF"
                  fillOpacity={0.18}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div>
            <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
              Subject Time Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scheduled &amp; focused study hours by course
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectDistData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {subjectDistData.map((entry, idx) => (
                      <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2 text-xs">
              {subjectDistData.map((item, idx) => (
                <li key={item.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-xs"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums">
                    {item.hours}h
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div>
            <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
              Task Completion by Category
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completed vs. pending items across academic categories
            </p>
          </div>
          <div className="mt-4 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#22C55E" />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Actionable Queues: Priority Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                Today &amp; Priority Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any item to mark complete
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(NavSection.Tasks)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3867F4] hover:underline whitespace-nowrap"
            >
              <span>View All ({totalTasks})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {priorityTasks.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#22C55E]" />
              <p className="mt-2 text-sm font-medium">All tasks completed!</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {priorityTasks.map((task) => (
                <li key={task.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="flex w-full items-start gap-3 text-left group"
                  >
                    <Circle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400 group-hover:text-[#3867F4]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-[#3867F4]">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>{task.category}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">{task.date || 'No date'}</span>
                        <span aria-hidden="true"> · </span>
                        <span
                          className={
                            task.priority === Priority.Urgent || task.priority === Priority.High
                              ? 'font-semibold text-red-600 dark:text-red-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {task.priority}
                        </span>
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h2 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                Upcoming Exams &amp; Deadlines
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sample &amp; personal deadlines sorted chronologically
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(NavSection.Exams)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3867F4] hover:underline whitespace-nowrap"
            >
              <span>Exam Center</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingDeadlines.map((item) => {
              const target = new Date(item.dueDateTime);
              const hoursLeft = Math.max(
                0,
                Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60))
              );
              const daysLeft = Math.floor(hoursLeft / 24);
              const urgent = hoursLeft <= 48;

              return (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {item.courseCode} · {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.type} · {item.location}
                    </p>
                  </div>
                  <span
                    className={`font-mono text-xs font-semibold whitespace-nowrap tabular-nums ${
                      urgent ? 'text-amber-600 dark:text-amber-400' : 'text-[#3867F4]'
                    }`}
                  >
                    {daysLeft > 0 ? `${daysLeft}d ${hoursLeft % 24}h` : `${hoursLeft}h left`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
