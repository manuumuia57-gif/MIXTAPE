import React from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckSquare,
  Clock,
  Globe,
  Layers,
  LayoutDashboard,
  Library,
  Settings,
  Shield,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { NavSection } from '../types/campus';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onGoHome: () => void;
  userRole: 'student' | 'admin';
  counts: {
    activeTasks: number;
    upcomingStudies: number;
    notes: number;
    upcomingExams: number;
  };
  timerRunning: boolean;
  formattedTimeLeft: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CORE_ITEMS: NavItem[] = [
  { id: NavSection.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { id: NavSection.Tasks, label: 'Task Manager', icon: CheckSquare },
  { id: NavSection.Planner, label: 'Study Planner', icon: Calendar },
  { id: NavSection.Focus, label: 'Focus Timer', icon: Clock },
  { id: NavSection.Notes, label: 'Notes Hub', icon: BookOpen },
  { id: NavSection.Goals, label: 'Goals & Badges', icon: Target },
  { id: NavSection.Exams, label: 'Exam Center', icon: CalendarClock },
];

const LEARNING_ITEMS: NavItem[] = [
  { id: NavSection.Flashcards, label: 'Flashcards & Quizzes', icon: Layers },
  { id: NavSection.Resources, label: 'Resource Library', icon: Library },
  { id: NavSection.Community, label: 'Community', icon: Users },
  { id: NavSection.AIAssistant, label: 'AI Study Assistant', icon: Sparkles },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  onGoHome,
  userRole,
  counts,
  timerRunning,
  formattedTimeLeft,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const getRightLabel = (id: NavSection): string | null => {
    switch (id) {
      case NavSection.Tasks:
        return counts.activeTasks > 0 ? String(counts.activeTasks) : null;
      case NavSection.Planner:
        return counts.upcomingStudies > 0 ? String(counts.upcomingStudies) : null;
      case NavSection.Notes:
        return counts.notes > 0 ? String(counts.notes) : null;
      case NavSection.Exams:
        return counts.upcomingExams > 0 ? String(counts.upcomingExams) : null;
      case NavSection.Focus:
        return timerRunning ? formattedTimeLeft : null;
      default:
        return null;
    }
  };

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const rightLabel = getRightLabel(item.id);
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavClick(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#3867F4] ${
          isActive
            ? 'bg-[#3867F4] text-white'
            : 'text-slate-300 hover:bg-white/8 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
          <span className="truncate">{item.label}</span>
        </span>
        {rightLabel && (
          <span
            className={`ml-2 font-mono text-xs tabular-nums ${
              isActive ? 'text-blue-100' : 'text-slate-400'
            }`}
          >
            {rightLabel}
          </span>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#101B35] text-slate-200">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <button
          type="button"
          onClick={() => handleNavClick(NavSection.Dashboard)}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-white"
        >
          <BrandLogo className="h-8 w-8" />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            FocusCampus
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-md p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Workspace navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400">Workspace</p>
          <div className="mt-1.5 space-y-0.5">{CORE_ITEMS.map(renderNavButton)}</div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400">Learning &amp; Peers</p>
          <div className="mt-1.5 space-y-0.5">{LEARNING_ITEMS.map(renderNavButton)}</div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400">Account</p>
          <div className="mt-1.5 space-y-0.5">
            {renderNavButton({ id: NavSection.Profile, label: 'Profile & Settings', icon: Settings })}
            {userRole === 'admin' &&
              renderNavButton({ id: NavSection.Admin, label: 'Admin Dashboard', icon: Shield })}
          </div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => {
            onGoHome();
            onCloseMobile();
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
        >
          <Globe className="h-4 w-4 text-slate-400" />
          <span>Public Landing Page</span>
        </button>
        <div className="mt-2 flex items-center gap-2 px-3 text-[11px] text-slate-400">
          <Award className="h-3.5 w-3.5 text-[#22C55E]" />
          <span>Local Persistence Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-64 max-w-[82vw] shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
