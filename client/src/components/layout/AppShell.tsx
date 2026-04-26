import { Bell, BriefcaseBusiness, CalendarDays, ChartColumn, LayoutDashboard, LogOut, Menu, QrCode, Search, Settings2, Sparkles, UserCircle2, Users, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { apiFetch } from '../../lib/api';
import { cn, formatDate } from '../../lib/utils';
import { useLanguage } from '../../context/LanguageContext';
import { Notification as AppNotification } from '../../types';

type NavItem = {
  to: string;
  labelKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
  icon: typeof LayoutDashboard;
  captionKey: Parameters<ReturnType<typeof useLanguage>['t']>[0];
};

const adminItems: NavItem[] = [
  { to: '/admin/overview', labelKey: 'nav.overview', icon: LayoutDashboard, captionKey: 'nav.overviewCaption' },
  { to: '/admin/employees', labelKey: 'nav.employees', icon: Users, captionKey: 'nav.employeesCaption' },
  { to: '/admin/attendance', labelKey: 'nav.attendance', icon: CalendarDays, captionKey: 'nav.attendanceCaption' },
  { to: '/admin/qr-access', labelKey: 'nav.qrAccess', icon: QrCode, captionKey: 'nav.qrCaption' },
  { to: '/admin/analytics', labelKey: 'nav.analytics', icon: ChartColumn, captionKey: 'nav.analyticsCaption' }
];

const employeeItems: NavItem[] = [
  { to: '/employee/overview', labelKey: 'nav.overview', icon: LayoutDashboard, captionKey: 'nav.overviewCaption' },
  { to: '/employee/profile', labelKey: 'nav.profile', icon: UserCircle2, captionKey: 'nav.profileCaption' },
  { to: '/employee/workspace', labelKey: 'nav.workspace', icon: BriefcaseBusiness, captionKey: 'nav.workspaceCaption' }
];

const pageLabels: Record<string, string> = {
  overview: 'nav.overview',
  employees: 'nav.employees',
  attendance: 'nav.attendance',
  analytics: 'nav.analytics',
  'qr-access': 'nav.qrAccess',
  profile: 'nav.profile',
  workspace: 'nav.workspace'
};

export function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const items = user?.role === 'ADMIN' ? adminItems : employeeItems;
  const leaf = location.pathname.split('/').slice(-1)[0];
  const pageTitle = pageLabels[leaf] ? t(pageLabels[leaf] as Parameters<typeof t>[0]) : 'Dashboard';
  const pageEyebrow = user?.role === 'ADMIN' ? t('shell.adminEyebrow') : t('shell.employeeEyebrow');

  const activeItem = useMemo(() => items.find((item) => location.pathname.startsWith(item.to)) || items[0], [items, location.pathname]);
  const notificationsPath = user?.role === 'ADMIN' ? '/admin/notifications' : '/employee/notifications';
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ['shell-notifications', user?.role],
    queryFn: () => apiFetch<AppNotification[]>(notificationsPath),
    enabled: Boolean(user),
    refetchInterval: 30000
  });
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="min-h-screen px-3 py-3 sm:px-5 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1680px] grid-cols-1 overflow-hidden rounded-[2.25rem] border border-white/40 bg-white/55 shadow-shell backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45 lg:grid-cols-[310px_minmax(0,1fr)]">
        <div className={cn('fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden', open ? 'block' : 'hidden')} onClick={() => setOpen(false)} />

        <aside className={cn('fixed inset-y-3 left-3 z-50 w-[min(320px,calc(100vw-1.5rem))] rounded-[2rem] border border-white/50 bg-[rgba(18,31,54,0.94)] p-5 text-white shadow-shell transition lg:static lg:inset-auto lg:w-auto lg:rounded-none lg:border-0 lg:border-r lg:border-white/10 lg:bg-slate-950/90 lg:p-6', open ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#ffb38f]">Employee OS</p>
              <h1 className="mt-2 font-display text-2xl font-semibold">{t('shell.brand')}</h1>
            </div>
            <button className="rounded-2xl border border-white/15 bg-white/5 p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <div className="hero-chip">{user?.role === 'ADMIN' ? t('shell.adminFlow') : t('shell.employeeFlow')}</div>
            <h2 className="mt-4 font-display text-[1.65rem] font-semibold leading-tight">{activeItem ? t(activeItem.captionKey) : ''}</h2>
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
                        <p className="text-sm font-semibold">{t(item.labelKey)}</p>
                        <p className={cn('text-xs', isActive ? 'text-slate-500' : 'text-slate-400')}>{t(item.captionKey)}</p>
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
                  <span>{t('shell.quickFind')}</span>
                </div>
                <LanguageToggle />
                <ThemeToggle />
                <div className="relative">
                  <button
                    className={cn(
                      'relative rounded-2xl border border-border bg-surface/80 p-2.5 text-muted shadow-sm transition hover:-translate-y-0.5 hover:text-text',
                      notificationsOpen && 'border-accent/40 text-text ring-4 ring-accent/10'
                    )}
                    aria-label="Notifications"
                    aria-expanded={notificationsOpen}
                    onClick={() => setNotificationsOpen((value) => !value)}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 ? (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-card">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    ) : null}
                  </button>

                  {notificationsOpen ? (
                    <div className="absolute right-0 top-14 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] border border-border bg-surface/95 shadow-shell backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                        <div>
                          <p className="font-display text-lg font-semibold">{t('notifications.title')}</p>
                          <p className="text-xs text-muted">{unreadCount} {t('notifications.unread')}</p>
                        </div>
                        <div className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                          Live
                        </div>
                      </div>

                      <div className="max-h-[420px] overflow-y-auto p-2">
                        {notificationsLoading ? (
                          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">{t('notifications.loading')}</div>
                        ) : notifications.length ? (
                          notifications.map((notification) => (
                            <div key={notification.id} className="group rounded-2xl p-3 transition hover:bg-muted/10">
                              <div className="flex items-start gap-3">
                                <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', notification.read ? 'bg-muted' : 'bg-accent shadow-[0_0_0_5px_rgba(46,144,250,0.12)]')} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-text">{notification.title}</p>
                                  <p className="mt-1 text-sm leading-5 text-muted">{notification.message}</p>
                                  <p className="mt-2 text-xs font-medium text-muted">{formatDate(notification.createdAt)}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted">{t('notifications.empty')}</div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
                <button className="rounded-2xl border border-border bg-surface/80 p-2.5 text-muted shadow-sm hover:text-text" aria-label="Settings">
                  <Settings2 className="h-5 w-5" />
                </button>
                <div className="hidden rounded-2xl border border-border bg-surface/85 px-3 py-2 shadow-sm sm:block">
                  <p className="text-sm font-semibold">{user?.employee?.fullName || t('shell.systemAdmin')}</p>
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
