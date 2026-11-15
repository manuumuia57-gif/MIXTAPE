import { useState, useEffect, useCallback } from 'react';
import {
  AcademicGoal,
  AchievementBadge,
  AppNotification,
  CommunityPost,
  ExamItem,
  Flashcard,
  FocusSessionRecord,
  GoalTimeframe,
  LectureNote,
  NoteSubject,
  Priority,
  StudyGroup,
  StudySession,
  Task,
  TaskCategory,
  UserProfile,
} from '../types/campus';
import {
  DEFAULT_STUDENT_PROFILE,
  SEED_BADGES,
  SEED_COMMUNITY_POSTS,
  SEED_EXAMS,
  SEED_FLASHCARDS,
  SEED_FOCUS_HISTORY,
  SEED_GOALS,
  SEED_NOTES,
  SEED_NOTIFICATIONS,
  SEED_STUDIES,
  SEED_STUDY_GROUPS,
  SEED_TASKS,
} from '../data/seedData';

const KEYS = {
  TASKS: 'fc_v2_tasks',
  STUDIES: 'fc_v2_studies',
  NOTES: 'fc_v2_notes',
  GOALS: 'fc_v2_goals',
  FOCUS_HISTORY: 'fc_v2_focusHistory',
  FOCUS_MINUTES: 'fc_focusMinutes',
  EXAMS: 'fc_v2_exams',
  FLASHCARDS: 'fc_v2_flashcards',
  POSTS: 'fc_v2_posts',
  GROUPS: 'fc_v2_groups',
  BOOKMARKS: 'fc_v2_bookmarks',
  NOTIFICATIONS: 'fc_v2_notifications',
  PROFILE: 'fc_v2_profile',
  AUTH_TOKEN: 'fc_v2_authToken',
  THEME: 'fc_v2_theme',
  POINTS: 'fc_v2_points',
  STREAK: 'fc_v2_streak',
  QUIZ_PASSED: 'fc_v2_quizPassed',
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function useFocusCampusStore() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    readStorage<'light' | 'dark'>(KEYS.THEME, 'light')
  );
  const [authToken, setAuthToken] = useState<string | null>(() =>
    readStorage<string | null>(KEYS.AUTH_TOKEN, null)
  );
  const [profile, setProfile] = useState<UserProfile>(() =>
    readStorage<UserProfile>(KEYS.PROFILE, DEFAULT_STUDENT_PROFILE)
  );

  const [tasks, setTasks] = useState<Task[]>(() => readStorage(KEYS.TASKS, SEED_TASKS));
  const [studies, setStudies] = useState<StudySession[]>(() =>
    readStorage(KEYS.STUDIES, SEED_STUDIES)
  );
  const [focusHistory, setFocusHistory] = useState<FocusSessionRecord[]>(() =>
    readStorage(KEYS.FOCUS_HISTORY, SEED_FOCUS_HISTORY)
  );
  const [focusMinutes, setFocusMinutes] = useState<number>(() => {
    try {
      const val = Number(localStorage.getItem(KEYS.FOCUS_MINUTES));
      return Number.isFinite(val) && val > 0 ? val : 200;
    } catch {
      return 200;
    }
  });
  const [notes, setNotes] = useState<LectureNote[]>(() =>
    readStorage(KEYS.NOTES, SEED_NOTES)
  );
  const [goals, setGoals] = useState<AcademicGoal[]>(() =>
    readStorage(KEYS.GOALS, SEED_GOALS)
  );
  const [exams, setExams] = useState<ExamItem[]>(() =>
    readStorage(KEYS.EXAMS, SEED_EXAMS)
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() =>
    readStorage(KEYS.FLASHCARDS, SEED_FLASHCARDS)
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() =>
    readStorage(KEYS.POSTS, SEED_COMMUNITY_POSTS)
  );
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(() =>
    readStorage(KEYS.GROUPS, SEED_STUDY_GROUPS)
  );
  const [bookmarkedArticleIds, setBookmarkedArticleIds] = useState<string[]>(() =>
    readStorage(KEYS.BOOKMARKS, ['res-1', 'res-4'])
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    readStorage(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS)
  );
  const [studyPoints, setStudyPoints] = useState<number>(() =>
    readStorage(KEYS.POINTS, 940)
  );
  const [streakDays, setStreakDays] = useState<number>(() =>
    readStorage(KEYS.STREAK, 7)
  );
  const [quizPassed, setQuizPassed] = useState<boolean>(() =>
    readStorage(KEYS.QUIZ_PASSED, false)
  );

  // Sync theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    writeStorage(KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => writeStorage(KEYS.AUTH_TOKEN, authToken), [authToken]);
  useEffect(() => writeStorage(KEYS.PROFILE, profile), [profile]);
  useEffect(() => writeStorage(KEYS.TASKS, tasks), [tasks]);
  useEffect(() => writeStorage(KEYS.STUDIES, studies), [studies]);
  useEffect(() => writeStorage(KEYS.FOCUS_HISTORY, focusHistory), [focusHistory]);
  useEffect(() => {
    try {
      localStorage.setItem(KEYS.FOCUS_MINUTES, String(focusMinutes));
    } catch {
      // ignore
    }
  }, [focusMinutes]);
  useEffect(() => writeStorage(KEYS.NOTES, notes), [notes]);
  useEffect(() => writeStorage(KEYS.GOALS, goals), [goals]);
  useEffect(() => writeStorage(KEYS.EXAMS, exams), [exams]);
  useEffect(() => writeStorage(KEYS.FLASHCARDS, flashcards), [flashcards]);
  useEffect(() => writeStorage(KEYS.POSTS, communityPosts), [communityPosts]);
  useEffect(() => writeStorage(KEYS.GROUPS, studyGroups), [studyGroups]);
  useEffect(() => writeStorage(KEYS.BOOKMARKS, bookmarkedArticleIds), [bookmarkedArticleIds]);
  useEffect(() => writeStorage(KEYS.NOTIFICATIONS, notifications), [notifications]);
  useEffect(() => writeStorage(KEYS.POINTS, studyPoints), [studyPoints]);
  useEffect(() => writeStorage(KEYS.STREAK, streakDays), [streakDays]);
  useEffect(() => writeStorage(KEYS.QUIZ_PASSED, quizPassed), [quizPassed]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const pushNotification = useCallback(
    (category: AppNotification['category'], title: string, message: string) => {
      const next: AppNotification = {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category,
        title,
        message,
        timestamp: 'Just now',
        read: false,
      };
      setNotifications((prev) => [next, ...prev]);
    },
    []
  );

  // Tasks
  const addTask = useCallback(
    (input: {
      title: string;
      description: string;
      category: TaskCategory;
      priority: Priority;
      date: string;
      reminderEnabled: boolean;
    }) => {
      const next: Task = {
        id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        priority: input.priority,
        date: input.date,
        reminderEnabled: input.reminderEnabled,
        progress: 0,
        completed: false,
        createdAt: Date.now(),
        isDemo: false,
      };
      setTasks((prev) => [next, ...prev]);
      setStudyPoints((p) => p + 10);
    },
    []
  );

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const completed = !t.completed;
        if (completed) setStudyPoints((p) => p + 25);
        return { ...t, completed, progress: completed ? 100 : Math.min(t.progress, 90) };
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Study Planner
  const addStudySession = useCallback(
    (input: Omit<StudySession, 'id' | 'completed' | 'isDemo'>) => {
      const next: StudySession = {
        ...input,
        id: `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        completed: false,
        isDemo: false,
      };
      setStudies((prev) => [...prev, next]);
      setStudyPoints((p) => p + 15);
    },
    []
  );

  const updateStudySession = useCallback((id: string, patch: Partial<StudySession>) => {
    setStudies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    setStudies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Focus Sessions
  const recordFocusSession = useCallback(
    (mode: FocusSessionRecord['mode'], durationMinutes: number, subject: string) => {
      const record: FocusSessionRecord = {
        id: `foc-${Date.now()}`,
        mode,
        durationMinutes,
        subject: subject.trim() || 'General Study',
        completedAt: new Date().toISOString(),
        isDemo: false,
      };
      setFocusHistory((prev) => [record, ...prev]);
      if (mode === 'Pomodoro' || mode === 'Custom') {
        setFocusMinutes((m) => m + durationMinutes);
        setStudyPoints((p) => p + 35);
        pushNotification(
          'Study',
          'Focus Block Complete',
          `Logged ${durationMinutes} minutes on ${record.subject} (+35 Study Points).`
        );
      }
    },
    [pushNotification]
  );

  // Notes
  const addNote = useCallback(
    (input: { title: string; content: string; subject: NoteSubject; tags: string[] }) => {
      const next: LectureNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: input.title.trim(),
        content: input.content,
        subject: input.subject,
        tags: input.tags,
        pinned: false,
        favorite: false,
        archived: false,
        updatedAt: 'Just now',
        isDemo: false,
      };
      setNotes((prev) => [next, ...prev]);
      setStudyPoints((p) => p + 20);
      return next.id;
    },
    []
  );

  const updateNote = useCallback((id: string, patch: Partial<LectureNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: 'Saved just now' } : n
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Goals
  const addGoal = useCallback(
    (input: {
      title: string;
      timeframe: GoalTimeframe;
      targetValue: number;
      unit: string;
    }) => {
      const next: AcademicGoal = {
        id: `goal-${Date.now()}`,
        title: input.title.trim(),
        timeframe: input.timeframe,
        targetValue: input.targetValue,
        currentValue: 0,
        unit: input.unit.trim() || '%',
        completed: false,
        milestoneLabel: `0 / ${input.targetValue} ${input.unit || '%'}`,
        isDemo: false,
      };
      setGoals((prev) => [next, ...prev]);
    },
    []
  );

  const updateGoalProgress = useCallback(
    (id: string, currentValue: number) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;
          const clamped = Math.max(0, Math.min(g.targetValue, currentValue));
          const completed = clamped >= g.targetValue;
          if (completed && !g.completed) {
            setStudyPoints((p) => p + 80);
            pushNotification('Goal', 'Goal Milestone Reached', `Completed: ${g.title} (+80 pts).`);
          }
          return {
            ...g,
            currentValue: clamped,
            completed,
            milestoneLabel: `${clamped} / ${g.targetValue} ${g.unit}`,
          };
        })
      );
    },
    [pushNotification]
  );

  const toggleGoal = useCallback(
    (id: string) => {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;
          const completed = !g.completed;
          const currentValue = completed ? g.targetValue : Math.min(g.currentValue, Math.max(0, g.targetValue - 1));
          if (completed) {
            setStudyPoints((p) => p + 80);
            pushNotification('Goal', 'Academic Goal Achieved', `${g.title} (+80 pts).`);
          }
          return {
            ...g,
            completed,
            currentValue,
            milestoneLabel: `${currentValue} / ${g.targetValue} ${g.unit}`,
          };
        })
      );
    },
    [pushNotification]
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  // Exams
  const addExam = useCallback((input: Omit<ExamItem, 'id' | 'isDemo'>) => {
    setExams((prev) => [
      { ...input, id: `exm-${Date.now()}`, isDemo: false },
      ...prev,
    ]);
  }, []);

  const updateExam = useCallback((id: string, patch: Partial<ExamItem>) => {
    setExams((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Flashcards
  const addFlashcard = useCallback((subject: string, front: string, back: string) => {
    setFlashcards((prev) => [
      {
        id: `fc-${Date.now()}`,
        subject: subject.trim() || 'General',
        front: front.trim(),
        back: back.trim(),
        mastered: false,
        isDemo: false,
      },
      ...prev,
    ]);
    setStudyPoints((p) => p + 10);
  }, []);

  const toggleFlashcardMastered = useCallback((id: string) => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Resources Bookmarks
  const toggleBookmark = useCallback((articleId: string) => {
    setBookmarkedArticleIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  }, []);

  // Community
  const addCommunityPost = useCallback(
    (category: string, title: string, body: string, resourceLink?: string) => {
      const next: CommunityPost = {
        id: `post-${Date.now()}`,
        authorName: profile.fullName,
        authorMajor: `${profile.course.split('&')[0].trim()} · ${profile.academicYear}`,
        category,
        title: title.trim(),
        body: body.trim(),
        resourceLink: resourceLink?.trim() || undefined,
        likes: 1,
        likedByMe: true,
        moderationStatus: 'approved',
        createdAt: 'Just now',
        comments: [],
        isDemo: false,
      };
      setCommunityPosts((prev) => [next, ...prev]);
      setStudyPoints((p) => p + 15);
    },
    [profile]
  );

  const togglePostLike = useCallback((id: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id !== id) return post;
        const liked = !post.likedByMe;
        return {
          ...post,
          likedByMe: liked,
          likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      })
    );
  }, []);

  const addPostComment = useCallback(
    (postId: string, body: string) => {
      setCommunityPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `cmt-${Date.now()}`,
                authorName: profile.fullName,
                authorMajor: profile.academicYear,
                body: body.trim(),
                createdAt: 'Just now',
              },
            ],
          };
        })
      );
      setStudyPoints((p) => p + 10);
    },
    [profile]
  );

  const reportCommunityPost = useCallback((id: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, reported: true, moderationStatus: 'flagged' } : post
      )
    );
  }, []);

  const moderateCommunityPost = useCallback(
    (id: string, action: 'approved' | 'removed') => {
      if (action === 'removed') {
        setCommunityPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        setCommunityPosts((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, reported: false, moderationStatus: 'approved' } : p
          )
        );
      }
    },
    []
  );

  const toggleJoinStudyGroup = useCallback((groupId: string) => {
    setStudyGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              joined: !g.joined,
              membersCount: g.joined ? Math.max(1, g.membersCount - 1) : g.membersCount + 1,
            }
          : g
      )
    );
  }, []);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Quiz completion
  const recordQuizCompletion = useCallback((scorePct: number) => {
    setStudyPoints((p) => p + Math.round(scorePct / 2));
    if (scorePct >= 80) {
      setQuizPassed(true);
    }
  }, []);

  // Badges computed dynamically from live activity + seed rules
  const badges: AchievementBadge[] = SEED_BADGES.map((badge) => {
    const completedTasksCount = tasks.filter((t) => t.completed).length;
    switch (badge.id) {
      case 'bdg-1':
        return { ...badge, unlocked: focusHistory.length >= 1 };
      case 'bdg-2':
        return { ...badge, unlocked: streakDays >= 7 };
      case 'bdg-3':
        return { ...badge, unlocked: completedTasksCount >= 5 };
      case 'bdg-4':
        return { ...badge, unlocked: true };
      case 'bdg-5':
        return { ...badge, unlocked: focusMinutes >= 180 };
      case 'bdg-6':
        return { ...badge, unlocked: notes.length >= 3 };
      case 'bdg-7':
        return { ...badge, unlocked: quizPassed };
      case 'bdg-8':
        return { ...badge, unlocked: studyPoints >= 1200 };
      default:
        return badge;
    }
  });

  const resetDemoWorkspace = useCallback(() => {
    setTasks(SEED_TASKS);
    setStudies(SEED_STUDIES);
    setFocusHistory(SEED_FOCUS_HISTORY);
    setFocusMinutes(200);
    setNotes(SEED_NOTES);
    setGoals(SEED_GOALS);
    setExams(SEED_EXAMS);
    setFlashcards(SEED_FLASHCARDS);
    setCommunityPosts(SEED_COMMUNITY_POSTS);
    setStudyGroups(SEED_STUDY_GROUPS);
    setNotifications(SEED_NOTIFICATIONS);
    setStudyPoints(940);
    setStreakDays(7);
    setQuizPassed(false);
  }, []);

  return {
    theme,
    toggleTheme,
    authToken,
    setAuthToken,
    profile,
    setProfile,
    tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    studies,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    focusHistory,
    focusMinutes,
    recordFocusSession,
    notes,
    addNote,
    updateNote,
    deleteNote,
    goals,
    addGoal,
    updateGoalProgress,
    toggleGoal,
    deleteGoal,
    exams,
    addExam,
    updateExam,
    deleteExam,
    flashcards,
    addFlashcard,
    toggleFlashcardMastered,
    deleteFlashcard,
    bookmarkedArticleIds,
    toggleBookmark,
    communityPosts,
    addCommunityPost,
    togglePostLike,
    addPostComment,
    reportCommunityPost,
    moderateCommunityPost,
    studyGroups,
    toggleJoinStudyGroup,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    studyPoints,
    streakDays,
    badges,
    recordQuizCompletion,
    resetDemoWorkspace,
  };
}
