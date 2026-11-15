/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Menu, Moon, Play, Sun, X } from 'lucide-react';
import {
  AmbientSoundType,
  NavSection,
  TimerModeId,
  ToastMessage,
} from './types/campus';
import { SEED_QUIZZES } from './data/seedData';
import { useFocusCampusStore } from './hooks/useFocusCampusStore';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { TasksSection } from './components/TasksSection';
import { PlannerSection } from './components/PlannerSection';
import { FocusTimerSection } from './components/FocusTimerSection';
import { NotesSection } from './components/NotesSection';
import { GoalsSection } from './components/GoalsSection';
import { ExamsCenterSection } from './components/ExamsCenterSection';
import { FlashcardsQuizSection } from './components/FlashcardsQuizSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CommunitySection } from './components/CommunitySection';
import { AIAssistantSection } from './components/AIAssistantSection';
import { ProfileSettingsSection } from './components/ProfileSettingsSection';
import { AdminDashboardSection } from './components/AdminDashboardSection';

const SECTION_TITLES: Record<NavSection, string> = {
  [NavSection.Dashboard]: 'Student Dashboard',
  [NavSection.Tasks]: 'Smart Task Manager',
  [NavSection.Planner]: 'Study Planner',
  [NavSection.Focus]: 'Focus Timer & Deep Work',
  [NavSection.Notes]: 'Digital Notes Hub',
  [NavSection.Goals]: 'Goals & Badges',
  [NavSection.Exams]: 'Exam & Assignment Center',
  [NavSection.Flashcards]: 'Flashcards & Quizzes',
  [NavSection.Resources]: 'Student Resource Library',
  [NavSection.Community]: 'Student Community',
  [NavSection.AIAssistant]: 'AI Study Assistant',
  [NavSection.Profile]: 'Profile & Settings',
  [NavSection.Admin]: 'Administrator Dashboard',
};

function playCompletionChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.14);
      gain.gain.setValueAtTime(0.001, now + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.14 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.14);
      osc.stop(now + idx * 0.14 + 0.48);
    });
  } catch {
    // ignore Web Audio restriction
  }
}

function getMinutesForMode(mode: TimerModeId, customMinutes: number): number {
  switch (mode) {
    case 'short-break':
      return 5;
    case 'long-break':
      return 15;
    case 'custom':
      return customMinutes;
    default:
      return 25;
  }
}

export default function App() {
  const store = useFocusCampusStore();

  const [surface, setSurface] = useState<'landing' | 'workspace'>('landing');
  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.Dashboard);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [notifOpen, setNotifOpen] = useState(false);

  // Focus Timer State (persists across section navigation)
  const [timerMode, setTimerMode] = useState<TimerModeId>('pomodoro');
  const [customMinutes, setCustomMinutes] = useState<number>(45);
  const [focusSubject, setFocusSubject] = useState<string>('Distributed Systems');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [soundChime, setSoundChime] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');
  const [fullscreenFocus, setFullscreenFocus] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const soundChimeRef = useRef(soundChime);
  soundChimeRef.current = soundChime;

  const notify = useCallback(
    (text: string, tone: 'info' | 'success' | 'warning' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4200);
    },
    []
  );

  const totalTimerSeconds = getMinutesForMode(timerMode, customMinutes) * 60;

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          setHasStarted(false);

          if (soundChimeRef.current) {
            playCompletionChime();
          }

          const mins = getMinutesForMode(timerMode, customMinutes);
          const modeLabel =
            timerMode === 'pomodoro'
              ? 'Pomodoro'
              : timerMode === 'short-break'
              ? 'Short Break'
              : timerMode === 'long-break'
              ? 'Long Break'
              : 'Custom';

          store.recordFocusSession(modeLabel, mins, focusSubject);
          notify(
            timerMode === 'pomodoro' || timerMode === 'custom'
              ? `Focus block complete (+${mins} min logged). Take a break!`
              : 'Break complete. Ready to resume deep work.',
            'success'
          );
          return mins * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning, timerMode, customMinutes, focusSubject, store, notify]);

  const handleSelectTimerMode = (nextMode: TimerModeId) => {
    setTimerRunning(false);
    setHasStarted(false);
    setTimerMode(nextMode);
    setTimeLeft(getMinutesForMode(nextMode, customMinutes) * 60);
  };

  const handleChangeCustomMinutes = (mins: number) => {
    setCustomMinutes(mins);
    if (timerMode === 'custom') {
      setTimerRunning(false);
      setHasStarted(false);
      setTimeLeft(mins * 60);
    }
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setHasStarted(false);
    setTimeLeft(totalTimerSeconds);
  };

  const formattedTimeLeft = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(
    timeLeft % 60
  ).padStart(2, '0')}`;

  const enterWorkspace = (section?: NavSection) => {
    if (section) setActiveSection(section);
    setSurface('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadNotifs = store.notifications.filter((n) => !n.read).length;

  return (
    <>
      {surface === 'landing' ? (
        <LandingPage
          theme={store.theme}
          onToggleTheme={store.toggleTheme}
          onEnterWorkspace={enterWorkspace}
          onOpenAuth={(tab) => {
            setAuthInitialTab(tab);
            setAuthModalOpen(true);
          }}
          isSignedIn={Boolean(store.authToken)}
          userName={store.profile.fullName}
        />
      ) : (
        <div className="flex min-h-screen bg-[#F8FAFC] text-[#101B35] dark:bg-[#0B1221] dark:text-slate-100">
          <Sidebar
            activeSection={activeSection}
            onSelectSection={(sec) => {
              setActiveSection(sec);
              setNotifOpen(false);
            }}
            onGoHome={() => setSurface('landing')}
            userRole={store.profile.role}
            counts={{
              activeTasks: store.tasks.filter((t) => !t.completed).length,
              upcomingStudies: store.studies.length,
              notes: store.notes.filter((n) => !n.archived).length,
              upcomingExams: store.exams.filter((e) => !e.submitted).length,
            }}
            timerRunning={timerRunning}
            formattedTimeLeft={formattedTimeLeft}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/95 sm:px-8">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 lg:hidden"
                >
                  <Menu className="h-4.5 w-4.5" />
                </button>
                <div className="flex items-center gap-2 text-sm min-w-0">
                  <span className="hidden sm:inline font-medium text-slate-400 whitespace-nowrap">
                    FocusCampus
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-600" aria-hidden="true">
                    /
                  </span>
                  <span className="font-display font-semibold text-[#101B35] dark:text-white truncate">
                    {SECTION_TITLES[activeSection]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={store.toggleTheme}
                  aria-label={store.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {store.theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Notifications Center Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifOpen((o) => !o)}
                    aria-label="Notifications center"
                    className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3867F4] px-1 font-mono text-[10px] font-bold text-white tabular-nums">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-[#0F172A]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                        <h3 className="font-display text-sm font-bold text-[#101B35] dark:text-white">
                          Notifications ({unreadNotifs} unread)
                        </h3>
                        <button
                          type="button"
                          onClick={store.markAllNotificationsRead}
                          className="text-xs font-semibold text-[#3867F4] hover:underline"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="mt-2 max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                        {store.notifications.map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => store.markNotificationRead(n.id)}
                            className={`w-full py-2.5 text-left ${n.read ? 'opacity-65' : ''}`}
                          >
                            <p className="text-[11px] font-semibold text-[#3867F4]">
                              {n.category} · {n.timestamp}
                            </p>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {n.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              {n.message}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(NavSection.Focus);
                    if (!timerRunning) {
                      setHasStarted(true);
                      setTimerRunning(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#3867F4] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap shrink-0"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>{timerRunning ? `Focus · ${formattedTimeLeft}` : 'Start Focus'}</span>
                </button>
              </div>
            </header>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
              {activeSection === NavSection.Dashboard && (
                <DashboardOverview
                  profile={store.profile}
                  tasks={store.tasks}
                  studies={store.studies}
                  goals={store.goals}
                  exams={store.exams}
                  focusMinutes={store.focusMinutes}
                  focusHistory={store.focusHistory}
                  streakDays={store.streakDays}
                  studyPoints={store.studyPoints}
                  timerRunning={timerRunning}
                  formattedTimeLeft={formattedTimeLeft}
                  onToggleTask={store.toggleTask}
                  onNavigate={setActiveSection}
                />
              )}

              {activeSection === NavSection.Tasks && (
                <TasksSection
                  tasks={store.tasks}
                  onAddTask={store.addTask}
                  onUpdateTask={store.updateTask}
                  onToggleTask={store.toggleTask}
                  onDeleteTask={store.deleteTask}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Planner && (
                <PlannerSection
                  studies={store.studies}
                  tasks={store.tasks}
                  exams={store.exams}
                  onAddStudy={store.addStudySession}
                  onUpdateStudy={store.updateStudySession}
                  onDeleteStudy={store.deleteStudySession}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Focus && (
                <FocusTimerSection
                  mode={timerMode}
                  customMinutes={customMinutes}
                  subject={focusSubject}
                  timeLeft={timeLeft}
                  totalSeconds={totalTimerSeconds}
                  isRunning={timerRunning}
                  hasStarted={hasStarted}
                  soundChime={soundChime}
                  ambientSound={ambientSound}
                  fullscreenMode={fullscreenFocus}
                  focusMinutes={store.focusMinutes}
                  streakDays={store.streakDays}
                  history={store.focusHistory}
                  onSelectMode={handleSelectTimerMode}
                  onChangeCustomMinutes={handleChangeCustomMinutes}
                  onChangeSubject={setFocusSubject}
                  onStartOrResume={() => {
                    setHasStarted(true);
                    setTimerRunning(true);
                  }}
                  onPause={() => setTimerRunning(false)}
                  onReset={handleResetTimer}
                  onToggleChime={() => setSoundChime((s) => !s)}
                  onChangeAmbientSound={setAmbientSound}
                  onToggleFullscreen={() => setFullscreenFocus((f) => !f)}
                />
              )}

              {activeSection === NavSection.Notes && (
                <NotesSection
                  notes={store.notes}
                  onAddNote={store.addNote}
                  onUpdateNote={store.updateNote}
                  onDeleteNote={store.deleteNote}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Goals && (
                <GoalsSection
                  goals={store.goals}
                  badges={store.badges}
                  studyPoints={store.studyPoints}
                  streakDays={store.streakDays}
                  onAddGoal={store.addGoal}
                  onUpdateGoalProgress={store.updateGoalProgress}
                  onToggleGoal={store.toggleGoal}
                  onDeleteGoal={store.deleteGoal}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Exams && (
                <ExamsCenterSection
                  exams={store.exams}
                  onAddExam={store.addExam}
                  onUpdateExam={store.updateExam}
                  onDeleteExam={store.deleteExam}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Flashcards && (
                <FlashcardsQuizSection
                  flashcards={store.flashcards}
                  quizzes={SEED_QUIZZES}
                  onAddFlashcard={store.addFlashcard}
                  onToggleMastered={store.toggleFlashcardMastered}
                  onDeleteFlashcard={store.deleteFlashcard}
                  onQuizComplete={store.recordQuizCompletion}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Resources && (
                <ResourcesSection
                  bookmarkedIds={store.bookmarkedArticleIds}
                  onToggleBookmark={store.toggleBookmark}
                />
              )}

              {activeSection === NavSection.Community && (
                <CommunitySection
                  posts={store.communityPosts}
                  studyGroups={store.studyGroups}
                  onAddPost={store.addCommunityPost}
                  onToggleLike={store.togglePostLike}
                  onAddComment={store.addPostComment}
                  onReportPost={store.reportCommunityPost}
                  onToggleJoinGroup={store.toggleJoinStudyGroup}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.AIAssistant && (
                <AIAssistantSection
                  tasks={store.tasks}
                  courseName={store.profile.course}
                />
              )}

              {activeSection === NavSection.Profile && (
                <ProfileSettingsSection
                  profile={store.profile}
                  theme={store.theme}
                  authToken={store.authToken}
                  onUpdateProfile={store.setProfile}
                  onToggleTheme={store.toggleTheme}
                  onLogout={() => {
                    store.setAuthToken(null);
                    store.setProfile((prev) => ({ ...prev, role: 'student' }));
                    notify('Signed out of server session.', 'info');
                  }}
                  onResetDemoData={store.resetDemoWorkspace}
                  onOpenAuth={() => {
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  onNotify={notify}
                />
              )}

              {activeSection === NavSection.Admin && (
                <AdminDashboardSection
                  profile={store.profile}
                  authToken={store.authToken}
                  communityPosts={store.communityPosts}
                  onModeratePost={store.moderateCommunityPost}
                  onOpenAuth={() => {
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  }}
                  onNotify={notify}
                />
              )}
            </main>

            <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#0F172A] sm:px-8">
              <span>FocusCampus</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Focus Better. Study Smarter. Achieve More.</span>
            </footer>
          </div>
        </div>
      )}

      <AuthModal
        open={authModalOpen}
        initialTab={authInitialTab}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user, token) => {
          store.setAuthToken(token);
          store.setProfile((prev) => ({
            ...prev,
            ...user,
          }));
          setSurface('workspace');
          if (user.role === 'admin') {
            setActiveSection(NavSection.Admin);
          } else {
            setActiveSection(NavSection.Dashboard);
          }
          notify(`Signed in as ${user.fullName || user.email}.`, 'success');
        }}
      />

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#101B35] px-4 py-3 text-xs font-medium text-white shadow-xl"
            >
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
