export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export enum TaskCategory {
  Assignments = 'Assignments',
  Examinations = 'Examinations',
  Research = 'Research',
  Reading = 'Reading',
  Projects = 'Projects',
  PersonalDevelopment = 'Personal Development',
  GroupWork = 'Group Work',
}

export enum NoteSubject {
  Mathematics = 'Mathematics',
  ComputerScience = 'Computer Science',
  Business = 'Business',
  Engineering = 'Engineering',
  Medicine = 'Medicine',
  Law = 'Law',
  Humanities = 'Humanities',
  OtherSubjects = 'Other Subjects',
}

export enum GoalTimeframe {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Semester = 'Semester',
  LongTerm = 'Long-Term',
}

export enum NavSection {
  Dashboard = 'dashboard',
  Tasks = 'tasks',
  Planner = 'planner',
  Focus = 'focus',
  Notes = 'notes',
  Goals = 'goals',
  Exams = 'exams',
  Flashcards = 'flashcards',
  Resources = 'resources',
  Community = 'community',
  AIAssistant = 'ai-assistant',
  Profile = 'profile',
  Admin = 'admin',
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'student' | 'admin';
  institution: string;
  course: string;
  academicYear: string;
  studyInterests: string[];
  bio: string;
  avatarUrl: string;
  plan: 'free' | 'pro' | 'campus';
  language: string;
  privacyPublicProfile: boolean;
  privacyShowStreak: boolean;
  notificationsEnabled: {
    deadlines: boolean;
    studyReminders: boolean;
    communityReplies: boolean;
    goalAchievements: boolean;
  };
  isDemoAccount?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: Priority;
  date: string;
  reminderEnabled: boolean;
  progress: number;
  completed: boolean;
  createdAt: number;
  isDemo?: boolean;
}

export interface StudySession {
  id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  objective: string;
  breakMinutes: number;
  completed: boolean;
  isDemo?: boolean;
}

export interface FocusSessionRecord {
  id: string;
  mode: 'Pomodoro' | 'Short Break' | 'Long Break' | 'Custom';
  durationMinutes: number;
  subject: string;
  completedAt: string;
  isDemo?: boolean;
}

export interface LectureNote {
  id: string;
  title: string;
  content: string;
  subject: NoteSubject;
  tags: string[];
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  updatedAt: string;
  isDemo?: boolean;
}

export interface AcademicGoal {
  id: string;
  title: string;
  timeframe: GoalTimeframe;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
  milestoneLabel: string;
  isDemo?: boolean;
}

export interface ExamItem {
  id: string;
  courseCode: string;
  title: string;
  type: 'Examination' | 'Assignment' | 'Project';
  dueDateTime: string;
  location: string;
  submitted: boolean;
  revisionProgress: number;
  notes: string;
  isDemo?: boolean;
}

export interface ResourceArticle {
  id: string;
  title: string;
  category: string;
  readMinutes: number;
  summary: string;
  content: string[];
  featured: boolean;
  popularScore: number;
  publishedAt: string;
  author: string;
}

export interface CommunityComment {
  id: string;
  authorName: string;
  authorMajor: string;
  body: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorMajor: string;
  category: string;
  title: string;
  body: string;
  resourceLink?: string;
  likes: number;
  likedByMe?: boolean;
  reported?: boolean;
  moderationStatus?: 'approved' | 'flagged' | 'removed';
  createdAt: string;
  comments: CommunityComment[];
  isDemo?: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  membersCount: number;
  joined: boolean;
  description: string;
}

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  mastered: boolean;
  isDemo?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  questions: QuizQuestion[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  points: number;
  requirementText: string;
  unlocked: boolean;
  iconName: string;
}

export interface AppNotification {
  id: string;
  category: 'Deadline' | 'Study' | 'Goal' | 'Community' | 'System';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type TimerModeId = 'pomodoro' | 'short-break' | 'long-break' | 'custom';

export type AmbientSoundType = 'off' | 'rain' | 'brown-noise' | 'campus-hum';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'info' | 'success' | 'warning';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: 'live' | 'demo';
  timestamp: string;
}
