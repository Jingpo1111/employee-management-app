import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, Clock3, PencilLine, Sparkles, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { Employee, EmployeeDashboardResponse } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Textarea } from '../../components/ui/Textarea';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

function SectionHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.18),transparent_20%),radial-gradient(circle_at_75%_78%,rgba(59,130,246,0.16),transparent_25%)]" />
      <div className="relative z-10 max-w-2xl">
        <div className="hero-chip">{eyebrow}</div>
        <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{title}</h3>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">{description}</p>
      </div>
    </section>
  );
}

export function EmployeeOverviewPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => apiFetch<EmployeeDashboardResponse>('/employee/dashboard')
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading personal dashboard..." />;
  }

  const cards = [
    { label: t('employee.performanceScore'), value: `${data.overview.performanceScore}%`, icon: Sparkles, tint: 'from-[#ff8a64] to-[#f59e0b]' },
    { label: t('employee.attendanceRate'), value: data.overview.attendanceRate, icon: Clock3, tint: 'from-[#14b8a6] to-[#0ea5e9]' },
    { label: t('employee.completedTasks'), value: String(data.overview.completedTasks), icon: Target, tint: 'from-[#2563eb] to-[#38bdf8]' },
    { label: t('employee.unreadMessages'), value: String(data.notifications.filter((item) => !item.read).length), icon: Bell, tint: 'from-[#ef4444] to-[#fb7185]' }
  ];

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow={t('employee.dashboard')}
        title={`${t('employee.welcome')}, ${data.overview.name.split(' ')[0]}.`}
        description={t('employee.dashboardDescription')}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tint }) => (
          <Card key={label} className="relative overflow-hidden">
            <div className={`absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r ${tint}`} />
            <div className="flex items-center justify-between gap-4 pt-2">
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
              </div>
              <div className="rounded-[1.2rem] bg-accentSoft p-3 text-accent"><Icon className="h-5 w-5" /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <h3 className="font-display text-xl font-semibold">{t('employee.attendance')}</h3>
          <div className="mt-4 space-y-3">
            {data.attendance.map((item) => (
              <div key={item.id} className="metric-tile flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{formatDate(item.date)}</p>
                  <p className="text-sm text-muted">{item.checkIn || t('attendance.noCheckIn')} to {item.checkOut || '-'}</p>
                </div>
                <Badge label={t(`status.${item.status}` as Parameters<typeof t>[0])} variant={item.status === 'PRESENT' ? 'success' : item.status === 'REMOTE' ? 'info' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-xl font-semibold">{t('employee.currentTasks')}</h3>
          <div className="mt-4 space-y-3">
            {data.tasks.map((task) => (
              <div key={task.id} className="metric-tile">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="mt-1 text-sm text-muted">{task.description}</p>
                  </div>
                  <Badge label={task.priority} variant={task.priority === 'High' ? 'danger' : 'info'} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted">
                  <span>{formatDate(task.dueDate)}</span>
                  <span>{task.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-display text-xl font-semibold">{t('employee.messages')}</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.notifications.map((item) => (
            <div key={item.id} className="metric-tile">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{item.title}</p>
                {!item.read ? <Badge label={t('employee.new')} variant="info" /> : null}
              </div>
              <p className="mt-2 text-sm text-muted">{item.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EmployeeProfilePage() {
  const { refreshUser } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['employee-profile'],
    queryFn: () => apiFetch<Employee & { user: { email: string } }>('/employee/profile')
  });

  const [form, setForm] = useState({ fullName: '', title: '', phone: '', location: '', bio: '', avatar: '' });

  const updateMutation = useMutation({
    mutationFn: (payload: typeof form) => apiFetch<Employee>('/employee/profile', { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await refreshUser();
    }
  });

  useEffect(() => {
    if (data) {
      setForm({
        fullName: data.fullName,
        title: data.title,
        phone: data.phone || '',
        location: data.location,
        bio: data.bio || '',
        avatar: data.avatar || ''
      });
    }
  }, [data]);

  if (isLoading || !data) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow="Profile"
        title="Personal details that stay editable without exposing admin-only controls."
        description="This flow keeps employee self-service lightweight: identity, contact info, and bio are easy to update while team structure stays protected."
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <div className="flex items-center gap-4">
            <img className="h-20 w-20 rounded-[1.6rem] object-cover" src={data.avatar || 'https://placehold.co/120x120'} alt={data.fullName} />
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted">Employee profile</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{data.fullName}</h3>
              <p className="text-sm text-muted">{data.user.email}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="metric-tile"><p className="text-xs uppercase tracking-[0.18em] text-muted">Department</p><p className="mt-2 font-semibold">{data.department}</p></div>
            <div className="metric-tile"><p className="text-xs uppercase tracking-[0.18em] text-muted">Team</p><p className="mt-2 font-semibold">{data.team}</p></div>
            <div className="metric-tile"><p className="text-xs uppercase tracking-[0.18em] text-muted">Start date</p><p className="mt-2 font-semibold">{formatDate(data.startDate)}</p></div>
            <div className="metric-tile"><p className="text-xs uppercase tracking-[0.18em] text-muted">Manager</p><p className="mt-2 font-semibold">{data.managerName || 'Not assigned'}</p></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-[1.2rem] bg-accentSoft p-3 text-accent"><PencilLine className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display text-xl font-semibold">Edit profile</h3>
              <p className="text-sm text-muted">The form is spaced and grouped for mobile input, not only desktop editing.</p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); updateMutation.mutate(form); }}>
            <Field label="Full name"><Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} /></Field>
            <Field label="Job title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></Field>
            <Field label="Location"><Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} /></Field>
            <div className="md:col-span-2"><Field label="Avatar URL"><Input value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} /></Field></div>
            <div className="md:col-span-2"><Field label="Bio"><Textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} /></Field></div>
            <div className="md:col-span-2 flex justify-end"><Button type="submit">{updateMutation.isPending ? 'Saving...' : 'Save changes'}</Button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function EmployeeWorkspacePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard-workspace'],
    queryFn: () => apiFetch<EmployeeDashboardResponse>('/employee/dashboard')
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading workspace..." />;
  }

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow="Workspace"
        title="A task board that stays readable on narrow screens."
        description="Columns collapse cleanly and keep strong visual contrast so status changes are still obvious on mobile."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status, index) => (
          <Card key={status} className={index === 1 ? 'bg-[linear-gradient(135deg,rgba(255,138,100,0.12),rgba(255,255,255,0.4))]' : index === 2 ? 'bg-[linear-gradient(135deg,rgba(45,212,191,0.12),rgba(255,255,255,0.35))]' : ''}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold">{status.replace('_', ' ')}</p>
              <Badge label={String(data.tasks.filter((task) => task.status === status).length)} variant="info" />
            </div>
            <div className="mt-4 space-y-3">
              {data.tasks.filter((task) => task.status === status).map((task) => (
                <div key={task.id} className="metric-tile">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-1 text-sm text-muted">{task.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted">
                    <span>{formatDate(task.dueDate)}</span>
                    <span>{task.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
