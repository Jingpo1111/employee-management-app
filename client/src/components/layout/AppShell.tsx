import { Bell, BriefcaseBusiness, ChartColumn, LayoutDashboard, LogOut, Menu, QrCode, Search, Settings2, Sparkles, UserCircle2, Users, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  caption: string;
};

const adminItems: NavItem[] = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard, caption: 'Pulse and priorities' },
  { to: '/admin/employees', label: 'Employees', icon: Users, caption: 'Directory and actions' },
  { to: '/admin/qr-access', label: 'QR Access', icon: QrCode, caption: 'Daily scan control' },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartColumn, caption: 'Signals and trends' }
];

const employeeItems: NavItem[] = [
  { to: '/employee/overview', label: 'Overview', icon: LayoutDashboard, caption: 'Daily summary' },
  { to: '/employee/profile', label: 'Profile', icon: UserCircle2, caption: 'Personal details' },
  { to: '/employee/workspace', label: 'Workspace', icon: BriefcaseBusiness, caption: 'Tasks and focus' }
];

const pageLabels: Record<string, string> = {
  overview: 'Overview',
  employees: 'Employees',
  analytics: 'Analytics',
  'qr-access': 'QR Access',
  profile: 'Profile',
  workspace: 'Workspace'
};

export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = user?.role === 'ADMIN' ? adminItems : employeeItems;
  const leaf = location.pathname.split('/').slice(-1)[0];
  const pageTitle = pageLabels[leaf] || 'Dashboard';
  const pageEyebrow = user?.role === 'ADMIN' ? 'Operations command' : 'Personal workspace';

  const activeItem = useMemo(() => items.find((item) => location.pathname.startsWith(item.to)) || items[0], [items, location.pathname]);

  return (
    <div className="min-h-screen px-3 py-3 sm:px-5 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1680px] grid-cols-1 overflow-hidden rounded-[2.25rem] border border-white/40 bg-white/55 shadow-shell backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 lg:grid-cols-[310px_minmax(0,1fr)]">
        <div className={cn('fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden', open ? 'block' : 'hidden')} onClick={() => setOpen(false)} />

        <aside className={cn('fixed inset-y-3 left-3 z-50 w-[min(320px,calc(100vw-1.5rem))] rounded-[2rem] border border-white/50 bg-[rgba(18,31,54,0.94)] p-5 text-white shadow-shell transition lg:static lg:inset-auto lg:w-auto lg:rounded-none lg:border-0 lg:border-r lg:border-white/10 lg:bg-slate-950/90 lg:p-6', open ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ffb38f]">Employee OS</p>
              <h1 className="mt-2 font-display text-2xl font-semibold">People command</h1>
            </div>
            <button className="rounded-2xl border border-white/15 bg-white/5 p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <div className="hero-chip">{user?.role === 'ADMIN' ? 'Admin flow' : 'Employee flow'}</div>
            <h2 className="mt-4 font-display text-[1.65rem] font-semibold leading-tight">{activeItem?.caption}</h2>
            <p className="mt-2 text-sm text-slate-300">A brighter dashboard system with clearer hierarchy, calmer spacing, and faster mobile access.</p>
          </div>

          <nav className="mt-6 space-y-2" aria-label="Sidebar navigation">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-[1.4rem] px-4 py-3.5 transition',
                      isActive ? 'bg-white text-slate-900 shadow-card' : 'text-slate-300 hover:bg-white/8 hover:text-white'
                    )
                  }
                  onClick={() => setOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn('rounded-2xl p-2', isActive ? 'bg-[rgba(255,138,100,0.16)] text-[#ee5d50]' : 'bg-white/8 text-slate-300 group-hover:bg-white/12')}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className={cn('text-xs', isActive ? 'text-slate-500' : 'text-slate-400')}>{item.caption}</p>
                      </div>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-6 rounded-[1.6rem] gradient-stroke p-[1px] animate-float">
            <div className="rounded-[calc(1.6rem-1px)] bg-[rgba(9,19,35,0.95)] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2 text-[#ffb38f]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="font-semibold">Responsive by default</p>
              </div>
              <p className="mt-3 text-sm text-slate-300">Dense data stays readable on desktop, and core actions remain reachable on mobile without hunting.</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="border-b border-border/70 bg-white/35 px-4 py-4 backdrop-blur-xl dark:bg-white/5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-border bg-surface/90 p-2.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{pageEyebrow}</p>
                  <h2 className="mt-1 font-display text-3xl font-semibold">{pageTitle}</h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden items-center gap-2 rounded-2xl border border-border bg-surface/80 px-3 py-2 text-sm text-muted shadow-sm md:flex">
                  <Search className="h-4 w-4" />
                  <span>Quick find</span>
                </div>
                <ThemeToggle />
                <button className="rounded-2xl border border-border bg-surface/80 p-2.5 text-muted shadow-sm hover:text-text" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="rounded-2xl border border-border bg-surface/80 p-2.5 text-muted shadow-sm hover:text-text" aria-label="Settings">
                  <Settings2 className="h-5 w-5" />
                </button>
                <div className="hidden rounded-2xl border border-border bg-surface/85 px-3 py-2 shadow-sm sm:block">
                  <p className="text-sm font-semibold">{user?.employee?.fullName || 'System Admin'}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <button className="rounded-2xl border border-border bg-surface/80 p-2.5 text-muted shadow-sm hover:text-danger" onClick={logout} aria-label="Log out">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-grid bg-[size:18px_18px] p-4 sm:p-6 lg:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
