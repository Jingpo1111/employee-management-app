import { Bell, BriefcaseBusiness, ChartColumn, LayoutDashboard, LogOut, Menu, Settings2, UserCircle2, Users } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { cn } from '../../lib/utils';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const adminItems: NavItem[] = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartColumn }
];

const employeeItems: NavItem[] = [
  { to: '/employee/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/employee/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/employee/workspace', label: 'Workspace', icon: BriefcaseBusiness }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = user?.role === 'ADMIN' ? adminItems : employeeItems;

  return (
    <div className="min-h-screen bg-canvas px-3 py-3 sm:px-5 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1600px] grid-cols-1 overflow-hidden rounded-[2rem] border border-white/40 bg-white/60 shadow-shell backdrop-blur dark:border-white/10 dark:bg-slate-950/50 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className={cn('border-b border-border bg-surface/80 p-4 lg:border-b-0 lg:border-r', open ? 'block' : 'hidden lg:block')}>
          <div className="flex items-center justify-between gap-3 px-2 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Acme HR</p>
              <h1 className="font-display text-xl font-semibold">Employee OS</h1>
            </div>
            <button className="rounded-2xl border border-border p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-8 space-y-2" aria-label="Sidebar navigation">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive ? 'bg-accent text-white dark:text-slate-950' : 'text-muted hover:bg-border/50 hover:text-text'
                    )
                  }
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl bg-gradient-to-br from-accent to-cyan-500 p-[1px] dark:from-cyan-400 dark:to-emerald-300">
            <div className="rounded-[calc(1.5rem-1px)] bg-surface px-5 py-5">
              <p className="text-sm font-semibold text-text">Role and permission control</p>
              <p className="mt-2 text-sm text-muted">Admin can manage records, exports, and analytics. Employees stay focused on their own work.</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface/70 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-border p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">{user?.role === 'ADMIN' ? 'Admin workspace' : 'Employee workspace'}</p>
                <h2 className="font-display text-2xl font-semibold capitalize">{location.pathname.split('/').slice(-1)[0].replace('-', ' ')}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <button className="rounded-2xl border border-border bg-surface p-2.5 text-muted transition hover:text-text" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button className="rounded-2xl border border-border bg-surface p-2.5 text-muted transition hover:text-text" aria-label="Settings">
                <Settings2 className="h-5 w-5" />
              </button>
              <div className="hidden rounded-2xl border border-border bg-surface px-3 py-2 sm:block">
                <p className="text-sm font-semibold">{user?.employee?.fullName || 'System Admin'}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
              <button className="rounded-2xl border border-border bg-surface p-2.5 text-muted transition hover:text-danger" onClick={logout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-grid bg-[size:18px_18px] p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}