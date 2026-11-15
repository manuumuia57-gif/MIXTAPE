/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Play, X } from 'lucide-react';
import {
  NavSection,
  TimerPreset,
  TimerPresetId,
  ToastMessage,
} from './types/campus';
import { useFocusCampusStorage } from './hooks/useFocusCampusStorage';
import { Sidebar } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { TasksSection } from './components/TasksSection';
import { PlannerSection } from './components/PlannerSection';
import { FocusTimerSection } from './components/FocusTimerSection';
import { NotesSection } from './components/NotesSection';
import { GoalsSection } from './components/GoalsSection';

const TIMER_PRESETS: TimerPreset[] = [
  { id: 'focus-25', label: '25m Focus', minutes: 25, isFocusSession: true },
  { id: 'sprint-15', label: '15m Sprint', minutes: 15, isFocusSession: true },
  { id: 'break-5', label: '5m Break', minutes: 5, isFocusSession: false },
];

const SECTION_TITLES: Record<NavSection, string> = {
  [NavSection.Dashboard]: 'Dashboard',
  [NavSection.Tasks]: 'Academic Tasks',
  [NavSection.Planner]: 'Study Planner',
  [NavSection.Focus]: 'Focus Timer',
  [NavSection.Notes]: 'Lecture Notes',
  [NavSection.Goals]: 'Academic Goals',
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
    // Ignore Web Audio errors when autoplay is restricted
  }
}

export default function App() {
  const {
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
  } = useFocusCampusStorage();

  const [activeSection, setActiveSection] = useState<NavSection>(NavSection.Dashboard);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [presetId, setPresetId] = useState<TimerPresetId>('focus-25');
  const activePreset =
    TIMER_PRESETS.find((p) => p.id === presetId) ?? TIMER_PRESETS[0];
  const [timeLeft, setTimeLeft] = useState<number>(activePreset.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const notify = useCallback(
    (text: string, tone: 'info' | 'success' | 'warning' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, text, tone }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4000);
    },
    []
  );

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);

          if (soundEnabledRef.current) {
            playCompletionChime();
          }

          if (activePreset.isFocusSession) {
            addFocusMinutes(activePreset.minutes);
            notify(
              `Focus session complete (+${activePreset.minutes} min logged). Take a break.`,
              'success'
            );
          } else {
            notify('Break complete. Ready for your next focus session.', 'info');
          }

          return activePreset.minutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning, activePreset, addFocusMinutes, notify]);

  const handleSelectPreset = (id: TimerPresetId) => {
    const nextPreset = TIMER_PRESETS.find((p) => p.id === id);
    if (!nextPreset) return;
    setIsRunning(false);
    setPresetId(id);
    setTimeLeft(nextPreset.minutes * 60);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(activePreset.minutes * 60);
  };

  const formattedTimeLeft = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(
    timeLeft % 60
  ).padStart(2, '0')}`;

  const activeTasksCount = tasks.filter((t) => !t.completed).length;
  const activeGoalsCount = goals.filter((g) => !g.completed).length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        counts={{
          activeTasks: activeTasksCount,
          upcomingStudies: studies.length,
          notes: notes.length,
          activeGoals: activeGoalsCount,
        }}
        timerRunning={isRunning}
        formattedTimeLeft={formattedTimeLeft}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3.5 backdrop-blur-xs sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 lg:hidden focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-medium text-slate-400 whitespace-nowrap">FocusCampus</span>
              <span className="text-slate-300" aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 truncate">
                {SECTION_TITLES[activeSection]}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {activeSection === NavSection.Focus ? (
              <button
                type="button"
                onClick={() => setActiveSection(NavSection.Tasks)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
              >
                View Tasks
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(NavSection.Focus);
                  if (!isRunning) setIsRunning(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Play className="h-3.5 w-3.5" />
                <span>
                  {isRunning ? `Focus · ${formattedTimeLeft}` : 'Start 25m Focus'}
                </span>
              </button>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {activeSection === NavSection.Dashboard && (
            <DashboardOverview
              tasks={tasks}
              studies={studies}
              goals={goals}
              focusMinutes={focusMinutes}
              timerRunning={isRunning}
              formattedTimeLeft={formattedTimeLeft}
              onToggleTask={toggleTask}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === NavSection.Tasks && (
            <TasksSection
              tasks={tasks}
              onAddTask={addTask}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onNotify={notify}
            />
          )}

          {activeSection === NavSection.Planner && (
            <PlannerSection
              studies={studies}
              onAddStudy={addStudy}
              onDeleteStudy={deleteStudy}
              onNotify={notify}
            />
          )}

          {activeSection === NavSection.Focus && (
            <FocusTimerSection
              presets={TIMER_PRESETS}
              activePreset={activePreset}
              timeLeft={timeLeft}
              isRunning={isRunning}
              soundEnabled={soundEnabled}
              focusMinutes={focusMinutes}
              onSelectPreset={handleSelectPreset}
              onStart={() => setIsRunning(true)}
              onPause={() => setIsRunning(false)}
              onReset={handleResetTimer}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
            />
          )}

          {activeSection === NavSection.Notes && (
            <NotesSection
              notes={notes}
              onAddNote={addNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onNotify={notify}
            />
          )}

          {activeSection === NavSection.Goals && (
            <GoalsSection
              goals={goals}
              onAddGoal={addGoal}
              onToggleGoal={toggleGoal}
              onDeleteGoal={deleteGoal}
              onNotify={notify}
            />
          )}
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-500 sm:px-8">
          <span>FocusCampus</span>
          <span className="mx-2" aria-hidden="true">·</span>
          <span>Study Smart, Stay Focused</span>
        </footer>
      </div>

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-lg"
            >
              <span>{toast.text}</span>
              <button
                type="button"
                onClick={() =>
                  setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                }
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
