import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Circle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Priority, Task, TaskCategory } from '../types/campus';

interface TasksSectionProps {
  tasks: Task[];
  onAddTask: (input: {
    title: string;
    description: string;
    category: TaskCategory;
    priority: Priority;
    date: string;
    reminderEnabled: boolean;
  }) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onNotify: (text: string, tone?: 'info' | 'success' | 'warning') => void;
}

type TaskView = 'all' | 'today' | 'upcoming' | 'completed' | 'overdue';
type SortKey = 'deadline' | 'priority' | 'progress';

const CATEGORIES = Object.values(TaskCategory);
const PRIORITIES = Object.values(Priority);

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.Urgent:
      return 'text-red-600 dark:text-red-400 font-semibold';
    case Priority.High:
      return 'text-orange-600 dark:text-orange-400 font-semibold';
    case Priority.Medium:
      return 'text-amber-600 dark:text-amber-400 font-medium';
    default:
      return 'text-slate-600 dark:text-slate-400 font-medium';
  }
}

export function TasksSection({
  tasks,
  onAddTask,
  onUpdateTask,
  onToggleTask,
  onDeleteTask,
  onNotify,
}: TasksSectionProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Assignments);
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [date, setDate] = useState(getTodayStr());
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [formError, setFormError] = useState('');

  const [view, setView] = useState<TaskView>('all');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskCategory>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [sortKey, setSortKey] = useState<SortKey>('deadline');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const todayStr = getTodayStr();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a task title.');
      return;
    }
    setFormError('');
    onAddTask({
      title,
      description,
      category,
      priority,
      date,
      reminderEnabled,
    });
    setTitle('');
    setDescription('');
    onNotify('Task added to your Smart Task Manager.', 'success');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;
    onUpdateTask(editingTask.id, {
      title: editingTask.title.trim(),
      description: editingTask.description.trim(),
      category: editingTask.category,
      priority: editingTask.priority,
      date: editingTask.date,
      reminderEnabled: editingTask.reminderEnabled,
    });
    setEditingTask(null);
    onNotify('Task updated.', 'success');
  };

  const priorityRank: Record<Priority, number> = {
    [Priority.Urgent]: 0,
    [Priority.High]: 1,
    [Priority.Medium]: 2,
    [Priority.Low]: 3,
  };

  const filteredTasks = tasks
    .filter((task) => {
      const isOverdue = Boolean(task.date && task.date < todayStr && !task.completed);
      if (view === 'today' && task.date !== todayStr) return false;
      if (view === 'upcoming' && (!task.date || task.date <= todayStr || task.completed)) return false;
      if (view === 'completed' && !task.completed) return false;
      if (view === 'overdue' && !isOverdue) return false;
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (
          !task.title.toLowerCase().includes(q) &&
          !task.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (sortKey === 'priority') return priorityRank[a.priority] - priorityRank[b.priority];
      if (sortKey === 'progress') return b.progress - a.progress;
      return (a.date || '9999-12-31').localeCompare(b.date || '9999-12-31');
    });

  const overdueCount = tasks.filter((t) => t.date && t.date < todayStr && !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Add Task Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
              Smart Task Manager
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Categorize assignments, monitor deadlines, and track progress across 7 academic categories.
            </p>
          </div>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>{completedCount} completed</span>
            <span aria-hidden="true"> · </span>
            <span className={overdueCount > 0 ? 'font-semibold text-red-600 dark:text-red-400' : ''}>
              {overdueCount} overdue
            </span>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <label htmlFor="tm-title" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Task Title
            </label>
            <input
              id="tm-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="e.g., Organic Chemistry Lab Report"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="tm-cat" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Category
            </label>
            <select
              id="tm-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tm-pri" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Priority
            </label>
            <select
              id="tm-pri"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tm-date" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Deadline
            </label>
            <input
              id="tm-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-9">
            <label htmlFor="tm-desc" className="block text-xs font-medium text-slate-600 dark:text-slate-300">
              Description / Notes (optional)
            </label>
            <input
              id="tm-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Subtasks, chapter numbers, or submission requirements..."
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end justify-between gap-3 sm:col-span-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="rounded border-slate-300 text-[#3867F4]"
              />
              <span>Reminder</span>
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          {formError && (
            <p className="sm:col-span-12 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          )}
        </form>
      </section>

      {/* Filter Views & List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 self-start dark:bg-slate-800">
            {(
              [
                ['all', 'All Tasks'],
                ['today', "Today's Tasks"],
                ['upcoming', 'Upcoming'],
                ['completed', 'Completed'],
                ['overdue', 'Overdue'],
              ] as Array<[TaskView, string]>
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  view === key
                    ? 'bg-white text-[#101B35] shadow-xs dark:bg-[#0F172A] dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
            <div className="relative sm:col-span-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or description..."
                aria-label="Search tasks"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#3867F4] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'All' | TaskCategory)}
              aria-label="Filter by category"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:col-span-3"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'All' | Priority)}
              aria-label="Filter by priority"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:col-span-2"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="Sort tasks"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:col-span-2"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="priority">Sort: Priority</option>
              <option value="progress">Sort: Progress</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No tasks found in this view
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Adjust your filters or add a new academic task above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTasks.map((task) => {
              const isOverdue = Boolean(task.date && task.date < todayStr && !task.completed);
              const isDueToday = task.date === todayStr && !task.completed;
              const isConfirming = confirmDeleteId === task.id;

              return (
                <li key={task.id} className="py-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        aria-label={task.completed ? `Undo "${task.title}"` : `Complete "${task.title}"`}
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-[#3867F4]"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-semibold break-words ${
                              task.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.isDemo && (
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                              Sample
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 break-words">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{task.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className={getPriorityColor(task.priority)}>{task.priority}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{task.date || 'No date'}</span>
                          {isOverdue && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-red-600 dark:text-red-400">
                                Overdue Warning
                              </span>
                            </>
                          )}
                          {isDueToday && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-amber-600 dark:text-amber-400">
                                Due Today
                              </span>
                            </>
                          )}
                          {task.reminderEnabled && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="inline-flex items-center gap-1 text-[#3867F4]">
                                <Bell className="h-3 w-3" />
                                Reminder on
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0 self-end lg:self-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={task.progress}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            onUpdateTask(task.id, {
                              progress: next,
                              completed: next === 100,
                            });
                          }}
                          aria-label={`Progress for ${task.title}`}
                          className="w-24 accent-[#3867F4]"
                        />
                        <span className="w-9 text-right font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                          {task.progress}%
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingTask(task)}
                        aria-label={`Edit "${task.title}"`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 whitespace-nowrap"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteTask(task.id);
                              setConfirmDeleteId(null);
                              onNotify('Task deleted.', 'info');
                            }}
                            className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(task.id)}
                          aria-label={`Delete "${task.title}"`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-950/30 whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs" role="dialog" aria-modal="true">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-[#0F172A]"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#101B35] dark:text-white">
                Edit Task
              </h2>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Title</label>
              <input
                type="text"
                required
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Category</label>
                <select
                  value={editingTask.category}
                  onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Priority</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Deadline</label>
                <input
                  type="date"
                  value={editingTask.date}
                  onChange={(e) => setEditingTask({ ...editingTask, date: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#3867F4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2952d6]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
