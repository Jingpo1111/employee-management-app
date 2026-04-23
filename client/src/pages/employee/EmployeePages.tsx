import { useMutation, useQuery } from '@tanstack/react-query';
import { Bell, BriefcaseBusiness, Clock3, PencilLine, Sparkles } from 'lucide-react';
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

export function EmployeeOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['employee-dashboard'],
    queryFn: () => apiFetch<EmployeeDashboardResponse>('/employee/dashboard')
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading personal dashboard..." />;
  }

  const cards = [
    { label: 'Performance score', value: `${data.overview.performanceScore}%`, icon: Sparkles },
    { label: 'Attendance rate', value: data.overview.attendanceRate, icon: Clock3 },
    { label: 'Completed tasks', value: String(data.overview.completedTasks), icon: BriefcaseBusiness },
    { label: 'Unread messages', value: String(data.notifications.filter((item) => !item.read).length), icon: Bell }
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-r from-accent to-cyan-500 text-white dark:text-slate-950">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/80 dark:text-slate-900/70">Personal dashboard</p>
            <h3 className="mt-3 font-display text-3xl font-semibold">{data.overview.name}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/90 dark:text-slate-900/80">Your workspace is structured for quick scanning: recent attendance first, active work second, and messages third.</p>
          </div>
          <div className="rounded-3xl bg-white/15 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Current role</p>
            <p className="mt-2 text-2xl font-semibold">{data.overview.title}</p>
            <p className="mt-1 text-sm">{data.overview.department}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
            </div>
            <div className="rounded-2xl bg-accentSoft p-3 text-accent"><Icon className="h-5 w-5" /></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h3 className="font-display text-lg font-semibold">Attendance</h3>
          <div className="mt-4 space-y-3">
            {data.attendance.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="font-medium">{formatDate(item.date)}</p>
                  <p className="text-sm text-muted">{item.checkIn || 'No check-in'} to {item.checkOut || 'No check-out'}</p>
                </div>
                <Badge label={item.status} variant={item.status === 'PRESENT' ? 'success' : item.status === 'REMOTE' ? 'info' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-display text-lg font-semibold">Current tasks</h3>
          <div className="mt-4 space-y-3">
            {data.tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-border px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{task.title}</p>
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
        <h3 className="font-display text-lg font-semibold">Messages from admin</h3>
        <div className="mt-4 space-y-3">
          {data.notifications.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.title}</p>
                {!item.read ? <Badge label="New" variant="info" /> : null}
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
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <div className="flex items-center gap-4">
          <img className="h-20 w-20 rounded-3xl object-cover" src={data.avatar || 'https://placehold.co/120x120'} alt={data.fullName} />
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-muted">Employee profile</p>
            <h3 className="font-display text-2xl font-semibold">{data.fullName}</h3>
            <p className="text-sm text-muted">{data.user.email}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Department</p><p className="mt-2 font-semibold">{data.department}</p></div>
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Team</p><p className="mt-2 font-semibold">{data.team}</p></div>
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Start date</p><p className="mt-2 font-semibold">{formatDate(data.startDate)}</p></div>
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Manager</p><p className="mt-2 font-semibold">{data.managerName || 'Not assigned'}</p></div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-accentSoft p-3 text-accent"><PencilLine className="h-5 w-5" /></div>
          <div>
            <h3 className="font-display text-lg font-semibold">Edit profile</h3>
            <p className="text-sm text-muted">Limit editing to personal details. Department, role, and permissions remain admin-controlled.</p>
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
      <Card>
        <h3 className="font-display text-lg font-semibold">Task pipeline</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((status) => (
            <div key={status} className="rounded-3xl border border-border bg-canvas/70 p-4">
              <p className="font-semibold">{status.replace('_', ' ')}</p>
              <div className="mt-4 space-y-3">
                {data.tasks.filter((task) => task.status === status).map((task) => (
                  <div key={task.id} className="rounded-2xl border border-border bg-surface px-4 py-3">
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-sm text-muted">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
