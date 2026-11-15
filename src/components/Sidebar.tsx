import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Clock,
  BookOpen,
  Target,
  GraduationCap,
  X,
} from 'lucide-react';
import { NavSection } from '../types/campus';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  counts: {
    activeTasks: number;
    upcomingStudies: number;
    notes: number;
    activeGoals: number;
  };
  timerRunning: boolean;
  formattedTimeLeft: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: NavSection.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { id: NavSection.Tasks, label: 'Tasks', icon: CheckSquare },
  { id: NavSection.Planner, label: 'Study Planner', icon: Calendar },
  { id: NavSection.Focus, label: 'Focus Timer', icon: Clock },
  { id: NavSection.Notes, label: 'Lecture Notes', icon: BookOpen },
  { id: NavSection.Goals, label: 'Academic Goals', icon: Target },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  counts,
  timerRunning,
  formattedTimeLeft,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const getCountForSection = (id: NavSection): string | null => {
    switch (id) {
      case NavSection.Tasks:
        return counts.activeTasks > 0 ? String(counts.activeTasks) : null;
      case NavSection.Planner:
        return counts.upcomingStudies > 0 ? String(counts.upcomingStudies) : null;
      case NavSection.Notes:
        return counts.notes > 0 ? String(counts.notes) : null;
      case NavSection.Goals:
        return counts.activeGoals > 0 ? String(counts.activeGoals) : null;
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

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-5">
        <button
          type="button"
          onClick={() => handleNavClick(NavSection.Dashboard)}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <GraduationCap className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            FocusCampus
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const rightLabel = getCountForSection(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </span>
              {rightLabel && (
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {rightLabel}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 px-5 py-4 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Student Success Hub</p>
        <p className="mt-1">Saved locally in your browser</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
