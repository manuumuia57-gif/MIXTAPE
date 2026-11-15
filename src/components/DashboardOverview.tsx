import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import {
  AcademicGoal,
  NavSection,
  Priority,
  StudySession,
  Task,
} from '../types/campus';

interface DashboardOverviewProps {
  tasks: Task[];
  studies: StudySession[];
  goals: AcademicGoal[];
  focusMinutes: number;
  timerRunning: boolean;
  formattedTimeLeft: string;
  onToggleTask: (id: string) => void;
  onNavigate: (section: NavSection) => void;
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatReadableDate(dateStr: string): string {
  if (!dateStr) return 'No deadline';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function priorityTextColor(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return 'text-red-700';
    case Priority.Medium:
      return 'text-amber-700';
    default:
      return 'text-slate-600';
  }
}

export function DashboardOverview({
  tasks,
  studies,
  goals,
  focusMinutes,
  timerRunning,
  formattedTimeLeft,
  onToggleTask,
  onNavigate,
}: DashboardOverviewProps) {
  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dateString = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const taskProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const achievedGoals = goals.filter((g) => g.completed).length;

  const activeTasks = [...tasks]
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const weight = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 };
      const diff = weight[a.priority] - weight[b.priority];
      if (diff !== 0) return diff;
      return (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31');
    })
    .slice(0, 5);

  const sortedStudies = [...studies]
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-slate-500">{dateString}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {greeting}, Student
            </h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(NavSection.Focus)}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Clock className="h-4 w-4 text-indigo-600" />
            <span className="font-mono tabular-nums">
              {timerRunning ? `Timer active · ${formattedTimeLeft}` : `Focus Timer · ${formattedTimeLeft}`}
            </span>
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Total Tasks</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              {totalTasks}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {totalTasks - completedTasks} remaining
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Completed Tasks</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-emerald-700 tabular-nums">
              {completedTasks}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {achievedGoals} of {goals.length} goals achieved
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">Focus Minutes</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-indigo-600 tabular-nums">
              {focusMinutes}
            </p>
            <p className="mt-1 text-xs text-slate-500 tabular-nums">
              {Math.floor(focusMinutes / 25)} completed 25m blocks
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">Academic Progress</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">
              {taskProgress}% of tasks completed
            </span>
          </div>
          <div
            className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={taskProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Task completion progress"
          >
            <div
              className="h-full rounded-full bg-indigo-600 transition-[width] duration-300"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Priority Tasks</h2>
              <p className="text-xs text-slate-500">Next assignments sorted by priority and due date</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(NavSection.Tasks)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap shrink-0"
            >
              <span>Manage Tasks</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {activeTasks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No pending tasks</p>
              <p className="mt-1 text-xs text-slate-500">
                Add assignments or exams to track your workload here.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(NavSection.Tasks)}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Add First Task
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activeTasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left group focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-md"
                  >
                    <Circle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-700">
                        {task.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">
                          {formatReadableDate(task.date)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-medium ${priorityTextColor(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Study Schedule</h2>
              <p className="text-xs text-slate-500">Chronological study blocks from your planner</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate(NavSection.Planner)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 whitespace-nowrap shrink-0"
            >
              <span>Open Planner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {sortedStudies.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">No study sessions scheduled</p>
              <p className="mt-1 text-xs text-slate-500">
                Block out dedicated subject review hours in the planner.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(NavSection.Planner)}
                className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                Schedule Study Session
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {sortedStudies.map((session) => (
                <li
                  key={session.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {session.subject}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
                      {formatReadableDate(session.date)} · {session.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
