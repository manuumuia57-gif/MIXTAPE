import {
  Award,
  Bookmark,
  BookOpen,
  CalendarClock,
  CheckSquare,
  FileCheck2,
  FolderKanban,
  Home,
  LayoutDashboard,
  LifeBuoy,
  ShieldAlert,
  UploadCloud,
  X,
} from 'lucide-react';
import { UserRole, VaultSection } from '../types/vault';
import { VaultBrandLogo } from './VaultBrandLogo';

interface VaultSidebarProps {
  activeSection: VaultSection;
  userRole: UserRole | null;
  pendingModerationCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectSection: (sec: VaultSection) => void;
  onGoHome: () => void;
}

interface NavItem {
  id: VaultSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}

export function VaultSidebar({
  activeSection,
  userRole,
  pendingModerationCount,
  mobileOpen,
  onCloseMobile,
  onSelectSection,
  onGoHome,
}: VaultSidebarProps) {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Past Papers Library', icon: BookOpen },
    { id: 'courses', label: 'Courses & Departments', icon: FolderKanban },
    { id: 'marking-schemes', label: 'Marking Schemes', icon: FileCheck2 },
    { id: 'upload', label: 'Upload Center', icon: UploadCloud },
    { id: 'bookmarks', label: 'Bookmarks & Collections', icon: Bookmark },
    { id: 'exam-prep', label: 'Exam Prep Center', icon: CalendarClock },
    { id: 'contributor', label: 'Contributor Profile', icon: Award },
    {
      id: 'moderation',
      label: 'Moderation Queue',
      icon: CheckSquare,
      badge: pendingModerationCount,
      roles: ['lecturer', 'moderator', 'admin'],
    },
    {
      id: 'admin',
      label: 'Administrator Panel',
      icon: ShieldAlert,
      roles: ['admin'],
    },
    { id: 'support', label: 'Notices & Support', icon: LifeBuoy },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return userRole ? item.roles.includes(userRole) : false;
  });

  const handleClick = (sec: VaultSection) => {
    onSelectSection(sec);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#162033]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <button type="button" onClick={onGoHome} className="text-left">
          <VaultBrandLogo />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation drawer"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Vault sections">
        <button
          type="button"
          onClick={onGoHome}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-[#F4F7FB] hover:text-[#14213D] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span className="truncate">Homepage</span>
        </button>

        <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-[#14213D] text-white dark:bg-[#2563EB]'
                  : 'text-slate-600 hover:bg-[#F4F7FB] hover:text-[#14213D] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? 'text-[#F4B400]' : 'text-[#2563EB]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <p className="font-semibold text-[#14213D] dark:text-slate-200">
          {userRole ? `Role: ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : 'Guest Library Access'}
        </p>
        <p className="mt-0.5">Prepare Smart. Practice More. Excel.</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-[#101827]/60" onClick={onCloseMobile} />
          <aside className="relative z-10 w-72 max-w-[85vw]">{sidebarContent}</aside>
        </div>
      )}
    </>
  );
}
