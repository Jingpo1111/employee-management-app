import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle2, Clock3, Radio, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { formatDate } from '../lib/utils';
import { Notification as AppNotification } from '../types';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function getStatusVariant(message: string) {
  if (message.includes('Status: LATE') || message.toLowerCase().includes('late')) {
    return 'warning';
  }

  if (message.includes('Status: ABSENT') || message.toLowerCase().includes('absent')) {
    return 'danger';
  }

  return 'success';
}

export function NotificationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const notificationsPath = user?.role === 'ADMIN' ? '/admin/notifications' : '/employee/notifications';
  const { data = [], isLoading } = useQuery({
    queryKey: ['notifications-page', user?.role],
    queryFn: () => apiFetch<AppNotification[]>(notificationsPath),
    enabled: Boolean(user),
    refetchInterval: 30000
  });

  const filteredNotifications = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) {
      return data;
    }

    return data.filter((notification) =>
      `${notification.title} ${notification.message}`.toLowerCase().includes(value)
    );
  }, [data, search]);

  const unreadCount = data.filter((notification) => !notification.read).length;
  const todayCount = data.filter((notification) => new Date(notification.createdAt).toDateString() === new Date().toDateString()).length;

  if (isLoading) {
    return <LoadingState label={t('notifications.loading')} />;
  }

  return (
    <div className="space-y-6">
      <section className="panel-strong relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.24),transparent_25%),radial-gradient(circle_at_84%_16%,rgba(45,212,191,0.20),transparent_22%),radial-gradient(circle_at_72%_84%,rgba(59,130,246,0.18),transparent_25%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="hero-chip">{t('notifications.center')}</div>
            <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{t('notifications.pageTitle')}</h3>
            <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">{t('notifications.pageDescription')}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{t('notifications.today')}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{todayCount}</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{t('notifications.unread')}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
      </section>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-2xl font-semibold">{t('notifications.activity')}</h3>
            <p className="mt-1 text-sm text-muted">{t('notifications.activityDescription')}</p>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-11"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('notifications.search')}
            />
          </div>
        </div>

        {filteredNotifications.length ? (
          <div className="grid gap-3">
            {filteredNotifications.map((notification) => {
              const variant = getStatusVariant(notification.message);

              return (
                <article key={notification.id} className="group rounded-[1.5rem] border border-border bg-white/65 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card dark:bg-white/5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] bg-accentSoft text-accent">
                        {notification.read ? <CheckCircle2 className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-xl font-semibold">{notification.title}</h4>
                          {!notification.read ? <Badge label={t('employee.new')} variant="info" /> : null}
                        </div>
                        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">{notification.message}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDate(notification.createdAt)} · {formatTime(notification.createdAt)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/10 px-3 py-1.5">
                            <Radio className="h-3.5 w-3.5" />
                            {t('notifications.autoRefresh')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge label={variant === 'warning' ? t('status.LATE') : variant === 'danger' ? t('status.ABSENT') : t('status.PRESENT')} variant={variant} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title={t('notifications.empty')} description={t('notifications.emptyDescription')} />
        )}
      </Card>
    </div>
  );
}
