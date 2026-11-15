import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Menu,
  Moon,
  Sparkles,
  Sun,
  Target,
  Users,
  X,
} from 'lucide-react';
import { HERO_WORKSPACE_IMAGE } from '../data/seedData';
import { NavSection } from '../types/campus';
import { BrandLogo } from './BrandLogo';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onEnterWorkspace: (initialSection?: NavSection) => void;
  onOpenAuth: (tab: 'login' | 'signup') => void;
  isSignedIn: boolean;
  userName?: string;
}

function useAnimatedCounter(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return value;
}

const FAQS = [
  {
    q: 'Is FocusCampus free for university and college students?',
    a: 'Yes. The Free plan includes the Smart Task Manager, Weekly Study Planner, 25-minute Focus Timer, Digital Lecture Notes, and basic goal tracking with no time limit.',
  },
  {
    q: 'How does FocusCampus save my tasks, notes, and study sessions?',
    a: 'Your workspace automatically persists in local browser storage so every edit works immediately offline or online. For multi-device cloud sync, a complete PostgreSQL and Supabase schema is included in the repository.',
  },
  {
    q: 'How does the AI Study Assistant work?',
    a: 'When connected to a server-side Gemini API key, the AI Study Assistant generates personalized study schedules, note summaries, and revision questions. Without an API key, it runs in a clearly labeled Demo Mode with realistic sample guidance.',
  },
  {
    q: 'Can I share study notes or join accountability groups safely?',
    a: 'Yes. In the Student Community, only your chosen display name, major, and academic year appear alongside posts—your email address and private tasks remain strictly private.',
  },
  {
    q: 'Does FocusCampus support both Light Mode and Dark Mode?',
    a: 'Yes. You can switch seamlessly between Light Mode and Dark Mode from the top navigation bar or inside Profile & Settings, and your preference is remembered automatically.',
  },
];

export function LandingPage({
  theme,
  onToggleTheme,
  onEnterWorkspace,
  onOpenAuth,
  isSignedIn,
  userName,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [demoBillingMessage, setDemoBillingMessage] = useState<string | null>(null);

  const sessionsCount = useAnimatedCounter(48240);
  const tasksCount = useAnimatedCounter(312900);
  const hoursCount = useAnimatedCounter(195600);
  const goalsCount = useAnimatedCounter(64850);

  return (
    <div id="home" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1221] dark:text-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F172A]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#home"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#3867F4] rounded-md"
          >
            <BrandLogo className="h-8 w-8" />
            <span className="font-display text-lg font-bold tracking-tight text-[#101B35] dark:text-white">
              FocusCampus
            </span>
          </a>

          <nav aria-label="Landing page navigation" className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Home
            </a>
            <a href="#features" className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#study-tools" className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Study Tools
            </a>
            <button
              type="button"
              onClick={() => onEnterWorkspace(NavSection.Resources)}
              className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Resources
            </button>
            <button
              type="button"
              onClick={() => onEnterWorkspace(NavSection.Community)}
              className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Community
            </button>
            <a href="#pricing" className="hover:text-[#3867F4] dark:hover:text-white transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2.5">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Dashboard)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open Dashboard ({userName?.split(' ')[0] || 'Student'})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="rounded-lg bg-[#3867F4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap shrink-0"
                  >
                    Sign Up Free
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200 xl:hidden"
            >
              {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-[#0F172A] xl:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">How It Works</a>
              <a href="#study-tools" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Study Tools</a>
              <button type="button" onClick={() => onEnterWorkspace(NavSection.Resources)} className="rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">Resources</button>
              <button type="button" onClick={() => onEnterWorkspace(NavSection.Community)} className="rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">Community</button>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Pricing</a>
              <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold dark:border-slate-700"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Dashboard)}
                  className="flex-1 rounded-lg bg-[#3867F4] px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Launch Workspace
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-sm font-semibold text-[#3867F4] dark:text-[#818CF8]">
                Focus Better · Study Smarter · Achieve More
              </p>
              <h1
                style={{ textWrap: 'balance' }}
                className="mt-3 font-display text-4xl font-bold tracking-tight text-[#101B35] dark:text-white sm:text-5xl lg:leading-[1.12]"
              >
                Take Control of Your Studies. Unlock Your Full Potential.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
                FocusCampus gives you everything you need to organize your academic life,
                eliminate distractions, build powerful study habits, and achieve your goals.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Dashboard)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3867F4] to-[#7856FF] px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <span>No credit card required</span>
                <span aria-hidden="true">·</span>
                <span>20+ sample academic workflows preloaded</span>
                <span aria-hidden="true">·</span>
                <span>Light &amp; Dark workspace</span>
              </div>
            </div>

            {/* Hero Visual + Live Interactive Dashboard Preview */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl dark:border-slate-800 dark:bg-[#101B35]">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  {!heroImgFailed ? (
                    <img
                      src={HERO_WORKSPACE_IMAGE}
                      alt="University student studying at a sunlit library desk with FocusCampus open"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#101B35] to-[#3867F4] text-white">
                      <GraduationCap className="h-14 w-14 opacity-80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/90 via-[#101B35]/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
                    <div>
                      <p className="text-xs font-medium text-indigo-200">Live Student Command Center</p>
                      <p className="font-display text-lg font-semibold">
                        Distributed Systems &amp; Midterm Prep
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#101B35]/90 px-3.5 py-2 backdrop-blur-xs border border-white/15">
                      <p className="text-[11px] text-slate-300">Focus Timer</p>
                      <p className="font-mono text-lg font-bold text-white tabular-nums">25:00</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-200 bg-white p-4 dark:divide-slate-800 dark:bg-[#0F172A]">
                  <div className="px-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tasks Done</p>
                    <p className="mt-1 font-mono text-xl font-bold text-[#101B35] dark:text-white tabular-nums">
                      14 / 20
                    </p>
                  </div>
                  <div className="px-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Focus</p>
                    <p className="mt-1 font-mono text-xl font-bold text-[#3867F4] tabular-nums">
                      18.5 hrs
                    </p>
                  </div>
                  <div className="px-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Study Streak</p>
                    <p className="mt-1 font-mono text-xl font-bold text-[#22C55E] tabular-nums">
                      7 days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animated Statistics Strip */}
          <div className="mt-14 grid grid-cols-2 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#101B35] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            <div className="p-6">
              <p className="font-mono text-2xl font-bold text-[#101B35] dark:text-white tabular-nums sm:text-3xl">
                {sessionsCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Study sessions completed
              </p>
            </div>
            <div className="p-6">
              <p className="font-mono text-2xl font-bold text-[#3867F4] tabular-nums sm:text-3xl">
                {tasksCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Academic tasks organized
              </p>
            </div>
            <div className="p-6">
              <p className="font-mono text-2xl font-bold text-[#7856FF] tabular-nums sm:text-3xl">
                {hoursCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Deep work hours focused
              </p>
            </div>
            <div className="p-6">
              <p className="font-mono text-2xl font-bold text-[#22C55E] tabular-nums sm:text-3xl">
                {goalsCount.toLocaleString()}+
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Academic goals achieved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Students Need FocusCampus */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold text-[#3867F4]">Why FocusCampus</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
              Replace scattered tabs and last-minute cramming with one calm system.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              University coursework spans lecture PDFs, lab deadlines, exam timetables, and group projects.
              Juggling five disconnected tools drains cognitive energy before you even start studying.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
              <h3 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                01. Zero Deadline Blindspots
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Visual countdowns and priority filters highlight today’s urgent labs and upcoming midterms automatically.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
              <h3 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                02. Distraction-Free Deep Work
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Full-screen Pomodoro timer with optional original ambient soundscapes builds sustained 25-minute focus blocks.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
              <h3 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                03. Active Recall Built In
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Convert subject notes into flip flashcards and practice quizzes instead of passively rereading slides.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0F172A]">
              <h3 className="font-display text-base font-semibold text-[#101B35] dark:text-white">
                04. Measurable Weekly Momentum
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Study hours, task completion rates, streaks, and milestone badges keep motivation steady through finals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Platform Features & Study Tools */}
      <section id="features" className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-[#0F172A]">
        <div id="study-tools" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#7856FF]">Integrated Study Suite</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
              Twelve purpose-built modules working together
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-3">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-[#3867F4]" />
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Tasks)}
                  className="text-xs font-semibold text-[#3867F4] hover:underline"
                >
                  Open Task Manager
                </button>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#101B35] dark:text-white">
                Smart Task Manager &amp; Deadline Radar
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Organize Assignments, Examinations, Research, Reading, and Group Work across Today, Upcoming, Completed, and Overdue queues with progress sliders.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-3">
              <div className="flex items-center justify-between">
                <Calendar className="h-5 w-5 text-[#7856FF]" />
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Planner)}
                  className="text-xs font-semibold text-[#7856FF] hover:underline"
                >
                  Open Study Planner
                </button>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#101B35] dark:text-white">
                Daily, Weekly &amp; Monthly Study Planner
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Schedule subject blocks with locations, objectives, and breaks—plus smart suggested revision plans generated around your upcoming deadlines.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-2">
              <Clock className="h-5 w-5 text-[#3867F4]" />
              <h3 className="mt-4 font-display text-base font-semibold text-[#101B35] dark:text-white">
                Focus Timer &amp; Deep Work
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Animated circular Pomodoro countdown, custom durations, ambient audio synthesizer, and full-screen focus mode.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-2">
              <BookOpen className="h-5 w-5 text-[#22C55E]" />
              <h3 className="mt-4 font-display text-base font-semibold text-[#101B35] dark:text-white">
                Digital Notes &amp; Knowledge Hub
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Subject folders, rich formatting toolbar (headings, checklists, tables, highlights), pinning, tags, and instant autosave.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-2">
              <Target className="h-5 w-5 text-[#F59E0B]" />
              <h3 className="mt-4 font-display text-base font-semibold text-[#101B35] dark:text-white">
                Goals, Badges &amp; Exam Center
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Live examination countdown cards, daily-to-semester goal progress bars, streaks, and 8 unlockable achievement badges.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-3">
              <div className="flex items-center justify-between">
                <Sparkles className="h-5 w-5 text-[#7856FF]" />
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.AIAssistant)}
                  className="text-xs font-semibold text-[#7856FF] hover:underline"
                >
                  Try AI Assistant
                </button>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#101B35] dark:text-white">
                AI Study Assistant, Flashcards &amp; Active Recall Quizzes
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Generate tailored revision schedules, test memory with 3D flip flashcards, and check mastery with scored quizzes and detailed explanations.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35] md:col-span-3">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-[#3867F4]" />
                <button
                  type="button"
                  onClick={() => onEnterWorkspace(NavSection.Community)}
                  className="text-xs font-semibold text-[#3867F4] hover:underline"
                >
                  Browse Community
                </button>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#101B35] dark:text-white">
                Student Community &amp; 12-Guide Resource Library
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Join subject-based study groups, discuss tough coursework safely with peers, and read practical guides on memory, writing, and stress management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#3867F4]">How FocusCampus Works</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
            From overwhelming syllabus to calm daily execution
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: '01. Capture',
              title: 'Log Syllabi & Deadlines',
              body: 'Enter assignments, exam dates, and academic goals into one unified timeline.',
            },
            {
              step: '02. Schedule',
              title: 'Time-Block Your Week',
              body: 'Assign study sessions to subjects with locations and concrete objectives.',
            },
            {
              step: '03. Focus',
              title: 'Run Deep Work Blocks',
              body: 'Enter distraction-free timer mode and log focused study minutes automatically.',
            },
            {
              step: '04. Master',
              title: 'Review & Retain',
              body: 'Synthesize rich notes, flip flashcards, pass quizzes, and watch streaks grow.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F172A]"
            >
              <p className="font-mono text-xs font-semibold text-[#3867F4]">{item.step}</p>
              <h3 className="mt-3 font-display text-lg font-semibold text-[#101B35] dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#3867F4]">Student Outcomes</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
              Built around real university study habits
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  'Before FocusCampus I kept lab deadlines in sticky notes and missed early prep. Moving everything into the Exam Center and 25-minute morning blocks raised my term GPA from 3.4 to 3.85.',
                name: 'Daniela Ortiz',
                role: 'B.S. Mechanical Engineering, Year 3 · Delft Technical',
              },
              {
                quote:
                  'Having Cornell-style notes right next to flashcards and quizzes cut my biology midterm revision time by nearly a third while improving my recall.',
                name: 'Marcus Chen',
                role: 'Pre-Med & Molecular Biology, Year 2 · McGill University',
              },
              {
                quote:
                  'The morning study groups kept me consistent during thesis writing. Logging 15 focused hours a week felt calm instead of frantic.',
                name: 'Amara Osei',
                role: 'M.A. Economics & Public Policy · University of Manchester',
              },
            ].map((item) => (
              <blockquote
                key={item.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#101B35]"
              >
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  “{item.quote}”
                </p>
                <footer className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <p className="text-sm font-semibold text-[#101B35] dark:text-white">{item.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-[#3867F4]">Transparent Plans</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
              Start free, upgrade only when you need team or advanced analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Note: Billing selection runs in Demo Mode (no live payment gateway connected).
          </p>
        </div>

        {demoBillingMessage && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-[#3867F4]/30 bg-[#3867F4]/10 px-4 py-3 text-sm text-[#101B35] dark:text-white">
            <span>{demoBillingMessage}</span>
            <button
              type="button"
              onClick={() => setDemoBillingMessage(null)}
              className="text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[
            {
              name: 'Free',
              audience: 'For individual daily focus',
              price: '$0',
              period: 'forever',
              features: [
                'Smart Task Manager (unlimited tasks)',
                'Weekly Study Planner & calendar',
                'Pomodoro Focus Timer & ambient audio',
                'Digital Notes Hub (up to 8 subjects)',
                'Basic goal & streak tracking',
              ],
              cta: 'Start Free Workspace',
              highlighted: false,
            },
            {
              name: 'Pro',
              audience: 'For high-output exam & thesis terms',
              price: '$7',
              period: 'per month (demo)',
              features: [
                'Everything in Free',
                'Advanced Recharts productivity analytics',
                'Unlimited study plans & exam countdowns',
                'Interactive Flashcards & Scored Quizzes',
                'AI Study Assistant (live Gemini or Demo Mode)',
              ],
              cta: 'Preview Pro Demo',
              highlighted: true,
            },
            {
              name: 'Campus',
              audience: 'For student cohorts & universities',
              price: '$4',
              period: 'per student / mo (demo)',
              features: [
                'Everything in Pro',
                'Dedicated study group collaboration rooms',
                'Shared department resource libraries',
                'Role-based Administrator Dashboard',
                'Community moderation & campus reports',
              ],
              cta: 'Explore Campus Demo',
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-2xl border p-7 ${
                plan.highlighted
                  ? 'border-[#3867F4] bg-white shadow-lg dark:bg-[#0F172A]'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0F172A]'
              }`}
            >
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-bold text-[#101B35] dark:text-white">
                    {plan.name}
                  </h3>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {plan.audience}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-bold text-[#101B35] dark:text-white tabular-nums">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{plan.period}</span>
                </div>

                <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (plan.name === 'Free') {
                    onEnterWorkspace(NavSection.Dashboard);
                  } else {
                    setDemoBillingMessage(
                      `Demo Mode: ${plan.name} features are already unlocked in your interactive FocusCampus workspace—no payment required.`
                    );
                  }
                }}
                className={`mt-8 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-[#3867F4] text-white hover:bg-[#2952d6]'
                    : 'border border-slate-300 text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-[#101B35] dark:text-white">
            Frequently Asked Questions
          </h2>

          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
            {FAQS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-1 text-left font-medium text-[#101B35] dark:text-white"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#101B35] py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Ready for your calmest, most productive semester?
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Launch the interactive FocusCampus workspace immediately or sign in with a demo account.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEnterWorkspace(NavSection.Dashboard)}
              className="rounded-xl bg-[#3867F4] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2952d6] transition-colors whitespace-nowrap"
            >
              Launch Student Workspace
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0B1221] px-4 py-10 text-xs text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-6 w-6" />
            <span className="font-display text-sm font-semibold text-white">FocusCampus</span>
            <span aria-hidden="true">·</span>
            <span>Focus Better. Study Smarter. Achieve More.</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <button type="button" onClick={() => onEnterWorkspace(NavSection.Resources)} className="hover:text-white">
              Resources
            </button>
            <button type="button" onClick={() => onEnterWorkspace(NavSection.Community)} className="hover:text-white">
              Community
            </button>
            <span>© 2026 FocusCampus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
