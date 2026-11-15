export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export enum NavSection {
  Dashboard = 'dashboard',
  Tasks = 'tasks',
  Planner = 'planner',
  Focus = 'focus',
  Notes = 'notes',
  Goals = 'goals',
}

export interface Task {
  id: string;
  title: string;
  date: string;
  priority: Priority;
  completed: boolean;
  createdAt?: number;
}

export interface StudySession {
  id: string;
  subject: string;
  date: string;
  time: string;
}

export interface LectureNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface AcademicGoal {
  id: string;
  title: string;
  completed: boolean;
}

export type TimerPresetId = 'focus-25' | 'sprint-15' | 'break-5';

export interface TimerPreset {
  id: TimerPresetId;
  label: string;
  minutes: number;
  isFocusSession: boolean;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
}
