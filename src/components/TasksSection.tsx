import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Search, Trash2 } from 'lucide-react';
import { Priority, Task } from '../types/campus';

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (title: string, date: string, priority: Priority) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

type StatusFilter = 'all' | 'active' | 'completed';

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return 'No deadline';
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isOverdue(dateStr: string, completed: boolean): boolean {
  if (!dateStr || completed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateStr}T00:00:00`);
  return due.getTime() < today.getTime();
}

function getPriorityStyle(priority: Priority): string {
  switch (priority) {
    case Priority.High:
      return 'text-red-700 font-semibold';
    case Priority.Medium:
      return 'text-amber-700 font-medium';
    default:
      return 'text-slate-600 font-medium';
  }
}

export function TasksSection({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onNotify,
}: TasksSectionProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [errorMsg, setErrorMsg] = useState('');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an assignment or task title.');
      return;
    }
    setErrorMsg('');
    onAddTask(title, date, priority);
    setTitle('');
    setDate('');
    onNotify('Academic task added.', 'success');
  };

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'active' && task.completed) return false;
    if (statusFilter === 'completed' && !task.completed) return false;
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
    if (
      searchQuery.trim() &&
      !task.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Academic Tasks</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track assignments, exams, and deadlines by priority.
            </p>
          </div>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            {completedCount} of {tasks.length} completed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <label htmlFor="taskInput" className="block text-xs font-medium text-slate-600">
              Assignment or task
            </label>
            <input
              id="taskInput"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g., Biology Lab Report"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="taskDate" className="block text-xs font-medium text-slate-600">
              Deadline
            </label>
            <input
              id="taskDate"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="taskPriority" className="block text-xs font-medium text-slate-600">
              Priority
            </label>
            <select
              id="taskPriority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            >
              <option value={Priority.Low}>Low Priority</option>
              <option value={Priority.Medium}>Medium Priority</option>
              <option value={Priority.High}>High Priority</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 sm:col-span-12 pt-1">
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
              <span>Add Task</span>
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
            {(['all', 'active', 'completed'] as StatusFilter[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none sm:w-52"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'All' | Priority)}
              aria-label="Filter by priority"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-600 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value={Priority.High}>High Priority</option>
              <option value={Priority.Medium}>Medium Priority</option>
              <option value={Priority.Low}>Low Priority</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              {tasks.length === 0 ? 'No tasks added yet' : 'No tasks match your current filters'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {tasks.length === 0
                ? 'Use the form above to add your first academic assignment.'
                : 'Try clearing your search or switching status filters.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const overdue = isOverdue(task.date, task.completed);
              const confirming = confirmDeleteId === task.id;
              return (
                <li
                  key={task.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Complete "${task.title}"`}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-full"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium break-words ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">
                          {formatDateLabel(task.date)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={getPriorityStyle(task.priority)}>
                          {task.priority} Priority
                        </span>
                        {overdue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-red-600">Overdue</span>
                          </>
                        )}
                        {task.completed && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-emerald-700">Completed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      {task.completed ? 'Undo' : 'Complete'}
                    </button>

                    {confirming ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTask(task.id);
                            setConfirmDeleteId(null);
                            onNotify('Task deleted.', 'info');
                          }}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(task.id)}
                        aria-label={`Delete task "${task.title}"`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors whitespace-nowrap"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
