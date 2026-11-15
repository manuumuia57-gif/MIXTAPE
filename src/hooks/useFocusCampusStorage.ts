import { useState, useEffect, useCallback } from 'react';
import {
  Task,
  StudySession,
  LectureNote,
  AcademicGoal,
  Priority,
} from '../types/campus';

const STORAGE_KEYS = {
  TASKS: 'fc_tasks',
  STUDIES: 'fc_studies',
  NOTES: 'fc_notes',
  GOALS: 'fc_goals',
  FOCUS_MINUTES: 'fc_focusMinutes',
} as const;

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizePriority(value: unknown): Priority {
  if (value === Priority.High || value === 'High') return Priority.High;
  if (value === Priority.Medium || value === 'Medium') return Priority.Medium;
  return Priority.Low;
}

function loadInitialTasks(): Task[] {
  const parsed = readJsonStorage<unknown[]>(STORAGE_KEYS.TASKS, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: String(item.id ?? `${Date.now()}-${Math.random()}`),
      title: String(item.title ?? ''),
      date: String(item.date ?? ''),
      priority: normalizePriority(item.priority),
      completed: Boolean(item.completed),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : undefined,
    }))
    .filter((item) => item.title.trim().length > 0);
}

function loadInitialStudies(): StudySession[] {
  const parsed = readJsonStorage<unknown[]>(STORAGE_KEYS.STUDIES, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: String(item.id ?? `${Date.now()}-${Math.random()}`),
      subject: String(item.subject ?? ''),
      date: String(item.date ?? ''),
      time: String(item.time ?? ''),
    }))
    .filter((item) => item.subject.trim().length > 0);
}

function loadInitialNotes(): LectureNote[] {
  const parsed = readJsonStorage<unknown[]>(STORAGE_KEYS.NOTES, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: String(item.id ?? `${Date.now()}-${Math.random()}`),
      title: String(item.title ?? ''),
      content: String(item.content ?? ''),
      date: String(item.date ?? new Date().toLocaleString()),
    }))
    .filter((item) => item.title.trim().length > 0);
}

function loadInitialGoals(): AcademicGoal[] {
  const parsed = readJsonStorage<unknown[]>(STORAGE_KEYS.GOALS, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      id: String(item.id ?? `${Date.now()}-${Math.random()}`),
      title: String(item.title ?? ''),
      completed: Boolean(item.completed),
    }))
    .filter((item) => item.title.trim().length > 0);
}

function loadInitialFocusMinutes(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_MINUTES);
    const num = Number(raw || 0);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch {
    return 0;
  }
}

export function useFocusCampusStorage() {
  const [tasks, setTasks] = useState<Task[]>(loadInitialTasks);
  const [studies, setStudies] = useState<StudySession[]>(loadInitialStudies);
  const [notes, setNotes] = useState<LectureNote[]>(loadInitialNotes);
  const [goals, setGoals] = useState<AcademicGoal[]>(loadInitialGoals);
  const [focusMinutes, setFocusMinutes] = useState<number>(loadInitialFocusMinutes);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch {
      // ignore quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
    } catch {
      // ignore quota errors
    }
  }, [studies]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch {
      // ignore quota errors
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch {
      // ignore quota errors
    }
  }, [goals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS_MINUTES, String(focusMinutes));
    } catch {
      // ignore quota errors
    }
  }, [focusMinutes]);

  const addTask = useCallback((title: string, date: string, priority: Priority) => {
    const newTask: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      date,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const addStudy = useCallback((subject: string, date: string, time: string) => {
    const newSession: StudySession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      subject: subject.trim(),
      date,
      time,
    };
    setStudies((prev) => [...prev, newSession]);
  }, []);

  const deleteStudy = useCallback((id: string) => {
    setStudies((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addNote = useCallback((title: string, content: string) => {
    const newNote: LectureNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  }, []);

  const updateNote = useCallback((id: string, title: string, content: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? {
              ...note,
              title: title.trim(),
              content: content.trim(),
              date: `Edited ${new Date().toLocaleString()}`,
            }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const addGoal = useCallback((title: string) => {
    const newGoal: AcademicGoal = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      completed: false,
    };
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }, []);

  const addFocusMinutes = useCallback((minutes: number) => {
    setFocusMinutes((prev) => prev + minutes);
  }, []);

  return {
    tasks,
    studies,
    notes,
    goals,
    focusMinutes,
    addTask,
    toggleTask,
    deleteTask,
    addStudy,
    deleteStudy,
    addNote,
    updateNote,
    deleteNote,
    addGoal,
    toggleGoal,
    deleteGoal,
    addFocusMinutes,
  };
}
