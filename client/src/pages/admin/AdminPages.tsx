import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Pencil, Plus, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { apiFetch, downloadFile } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { AdminDashboardResponse, DailyAttendanceResponse, Employee, PaginatedEmployees } from '../../types';
import { AttendanceTrendChart } from '../../components/charts/AttendanceTrendChart';
import { DepartmentChart } from '../../components/charts/DepartmentChart';
import { StatCard } from '../../components/layout/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { useLanguage } from '../../context/LanguageContext';

const defaultForm = {
  fullName: '',
  email: '',
  password: '',
  title: '',
  department: '',
  team: '',
  phone: '',
  location: '',
  status: 'Active',
  bio: '',
  avatar: '',
  performanceScore: 100,
  managerName: '',
  permissions: ['profile:view', 'profile:edit', 'tasks:view', 'attendance:view'],
  startDate: new Date().toISOString().slice(0, 10)
};

function SectionHero({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <section className="panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.22),transparent_24%),radial-gradient(circle_at_85%_20%,rgba(45,212,191,0.18),transparent_20%),radial-gradient(circle_at_75%_78%,rgba(59,130,246,0.16),transparent_25%)]" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="hero-chip">{eyebrow}</div>
          <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{title}</h3>
          <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

function EmployeeForm({
  initialValue,
  onSubmit,
  submitting,
  mode = 'create'
}: {
  initialValue?: Partial<typeof defaultForm>;
  onSubmit: (payload: typeof defaultForm) => void;
  submitting?: boolean;
  mode?: 'create' | 'edit';
}) {
  const [form, setForm] = useState({ ...defaultForm, ...initialValue, permissions: initialValue?.permissions || defaultForm.permissions });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    ['fullName', 'email', 'title', 'department', 'team', 'location'].forEach((key) => {
      if (!String(form[key as keyof typeof form]).trim()) {
        nextErrors[key] = 'Required';
      }
    });

    if (mode === 'create' && form.password.trim().length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }

    if (form.performanceScore < 0 || form.performanceScore > 100) {
      nextErrors.performanceScore = 'Score must be between 0 and 100.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    onSubmit({ ...form, performanceScore: Number(form.performanceScore) });
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <Field label="Full name" error={errors.fullName}><Input value={form.fullName} onChange={(event) => update('fullName', event.target.value)} /></Field>
      <Field label="Email" error={errors.email}><Input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></Field>
      {mode === 'create' ? (
        <Field label="Login password" error={errors.password} hint="Employee will use this with their email to sign in.">
          <Input
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
          />
        </Field>
      ) : null}
      <Field label="Job title" error={errors.title}><Input value={form.title} onChange={(event) => update('title', event.target.value)} /></Field>
      <Field label="Department" error={errors.department}><Input value={form.department} onChange={(event) => update('department', event.target.value)} /></Field>
      <Field label="Team" error={errors.team}><Input value={form.team} onChange={(event) => update('team', event.target.value)} /></Field>
      <Field label="Location" error={errors.location}><Input value={form.location} onChange={(event) => update('location', event.target.value)} /></Field>
      <Field label="Phone"><Input value={form.phone} onChange={(event) => update('phone', event.target.value)} /></Field>
      <Field label="Manager"><Input value={form.managerName} onChange={(event) => update('managerName', event.target.value)} /></Field>
      <Field label="Status"><Input value={form.status} onChange={(event) => update('status', event.target.value)} /></Field>
      <Field label="Start date"><Input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} /></Field>
      {mode === 'edit' ? (
        <Field label="Performance score" error={errors.performanceScore}><Input type="number" min={0} max={100} step={0.5} value={form.performanceScore} onChange={(event) => update('performanceScore', Number(event.target.value))} /></Field>
      ) : null}
      <Field label="Avatar URL"><Input value={form.avatar} onChange={(event) => update('avatar', event.target.value)} placeholder="https://..." /></Field>
      <div className="md:col-span-2">
        <Field label="Permissions" hint="Comma separated">
          <Input value={form.permissions.join(', ')} onChange={(event) => update('permissions', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} />
        </Field>
      </div>
      <div className="md:col-span-2">
        <Field label="Bio"><Textarea value={form.bio} onChange={(event) => update('bio', event.target.value)} /></Field>
      </div>
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <Button type="submit" className="min-w-32" disabled={submitting}>{submitting ? 'Saving...' : 'Save employee'}</Button>
      </div>
    </form>
  );
}

export function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiFetch<AdminDashboardResponse>('/admin/dashboard')
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading admin overview..." />;
  }

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow="Operations cockpit"
        title="See the team pulse before you touch the table."
        description="A more colorful command surface helps scan headcount, attendance movement, and operational attention without flattening everything into the same tone."
        actions={<Link to="/admin/employees"><Button>Open directory</Button></Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat, index) => <StatCard key={stat.label} stat={stat} index={index} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <AttendanceTrendChart data={data.attendanceTrend} />
        <DepartmentChart data={data.employeesByDepartment} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">UX pattern</p>
          <h4 className="mt-3 font-display text-2xl font-semibold">Keep heavy admin actions close to the dataset, not hidden in global menus.</h4>
          <p className="mt-3 text-sm text-muted">Filters, export, and create actions now sit in a clear band above the directory. It reduces scanning distance and improves touch interaction on smaller screens.</p>
        </Card>
        <Card className="bg-[linear-gradient(135deg,rgba(255,138,100,0.18),rgba(14,165,140,0.12))]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Design principle</p>
          <h4 className="mt-3 font-display text-2xl font-semibold">Signal over chrome</h4>
          <p className="mt-3 text-sm text-muted">Bright accents mark what matters. Neutral surfaces hold everything else back.</p>
        </Card>
      </div>
    </div>
  );
}

export function AdminEmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams({ page: String(page), pageSize: '8', sortBy, sortOrder });
    if (search) searchParams.set('search', search);
    if (department) searchParams.set('department', department);
    return searchParams.toString();
  }, [page, search, department, sortBy, sortOrder]);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', params],
    queryFn: () => apiFetch<PaginatedEmployees>(`/admin/employees?${params}`)
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof defaultForm) => apiFetch<Employee>('/admin/employees', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      setModalOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (payload: typeof defaultForm) => apiFetch<Employee>(`/admin/employees/${editingEmployee?.id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      setEditingEmployee(null);
      setModalOpen(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/admin/employees/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  const departments = Array.from(new Set(data?.data.map((item) => item.department) || []));

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow="Directory"
        title="Manage employees without turning the screen into a spreadsheet wall."
        description="The desktop view preserves density; mobile shifts to stacked profile cards so search, filter, and actions stay touch-friendly."
        actions={(
          <>
            <Button variant="secondary" onClick={() => downloadFile('/admin/employees/export?format=csv', 'employees.csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
            <Button variant="secondary" onClick={() => downloadFile('/admin/employees/export?format=pdf', 'employees.pdf')}><Download className="mr-2 h-4 w-4" />PDF</Button>
            <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add employee</Button>
          </>
        )}
      />

      <Card className="space-y-4">
        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-11" placeholder="Search by name, role, code, or email" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </div>
          <select className="rounded-2xl border border-border/90 bg-white/80 px-4 py-3 text-sm dark:bg-surface/80" value={department} onChange={(event) => { setPage(1); setDepartment(event.target.value); }}>
            <option value="">All departments</option>
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="rounded-2xl border border-border/90 bg-white/80 px-4 py-3 text-sm dark:bg-surface/80" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="fullName">Name</option>
            <option value="department">Department</option>
            <option value="performanceScore">Performance</option>
            <option value="startDate">Start date</option>
            <option value="status">Status</option>
          </select>
          <select className="rounded-2xl border border-border/90 bg-white/80 px-4 py-3 text-sm dark:bg-surface/80" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {isLoading ? <LoadingState label="Loading employee directory..." /> : null}

        {!isLoading && data?.data.length ? (
          <>
            <div className="grid gap-4 lg:hidden">
              {data.data.map((employee) => (
                <div key={employee.id} className="metric-tile">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img className="h-14 w-14 rounded-[1.2rem] object-cover" src={employee.avatar || 'https://placehold.co/96x96'} alt={employee.fullName} />
                      <div>
                        <p className="font-semibold">{employee.fullName}</p>
                        <p className="text-sm text-muted">{employee.title}</p>
                        <p className="text-xs text-muted">{employee.user.email}</p>
                      </div>
                    </div>
                    <Badge label={employee.status} variant={employee.status === 'Active' ? 'success' : 'warning'} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Department</p>
                      <p className="mt-1 font-medium">{employee.department}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted">Performance</p>
                      <p className="mt-1 font-medium">{employee.performanceScore}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link className="flex-1" to={`/admin/employees/${employee.id}`}><Button variant="ghost" className="w-full"><ShieldCheck className="mr-2 h-4 w-4" />View</Button></Link>
                    <Button variant="ghost" onClick={() => { setEditingEmployee(employee); setModalOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="danger" onClick={() => deleteMutation.mutate(employee.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Employee</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Performance</th>
                    <th className="px-4 py-3 font-medium">Start date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((employee) => (
                    <tr key={employee.id} className="border-t border-border/70">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img className="h-12 w-12 rounded-[1.2rem] object-cover" src={employee.avatar || 'https://placehold.co/80x80'} alt={employee.fullName} />
                          <div>
                            <p className="font-semibold">{employee.fullName}</p>
                            <p className="text-muted">{employee.title} • {employee.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{employee.department}<div className="text-muted">{employee.team}</div></td>
                      <td className="px-4 py-4"><Badge label={employee.status} variant={employee.status === 'Active' ? 'success' : 'warning'} /></td>
                      <td className="px-4 py-4">{employee.performanceScore}%</td>
                      <td className="px-4 py-4">{formatDate(employee.startDate)}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Link className="rounded-2xl border border-border p-2 hover:bg-border/40" to={`/admin/employees/${employee.id}`} aria-label={`View ${employee.fullName}`}>
                            <ShieldCheck className="h-4 w-4" />
                          </Link>
                          <button className="rounded-2xl border border-border p-2 hover:bg-border/40" onClick={() => { setEditingEmployee(employee); setModalOpen(true); }} aria-label={`Edit ${employee.fullName}`}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button className="rounded-2xl border border-border p-2 text-danger hover:bg-danger/10" onClick={() => deleteMutation.mutate(employee.id)} aria-label={`Delete ${employee.fullName}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {!isLoading && !data?.data.length ? (
          <EmptyState title="No employees found" description="Adjust your filters or create a new employee record to populate the directory." action={{ label: 'Create employee', onClick: () => setModalOpen(true) }} />
        ) : null}

        {data?.meta ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted">
            <p>Showing page {data.meta.page} of {data.meta.totalPages} • {data.meta.total} employees</p>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={data.meta.page === 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <Button variant="ghost" disabled={data.meta.page === data.meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        ) : null}
      </Card>

      <Modal open={modalOpen} title={editingEmployee ? 'Edit employee' : 'Add employee'} onClose={() => { setModalOpen(false); setEditingEmployee(null); }}>
        <EmployeeForm
          initialValue={editingEmployee ? {
            fullName: editingEmployee.fullName,
            email: editingEmployee.user.email,
            title: editingEmployee.title,
            department: editingEmployee.department,
            team: editingEmployee.team,
            phone: editingEmployee.phone || '',
            location: editingEmployee.location,
            status: editingEmployee.status,
            bio: editingEmployee.bio || '',
            avatar: editingEmployee.avatar || '',
            performanceScore: editingEmployee.performanceScore,
            managerName: editingEmployee.managerName || '',
            permissions: editingEmployee.permissions,
            startDate: editingEmployee.startDate.slice(0, 10)
          } : undefined}
          submitting={createMutation.isPending || updateMutation.isPending}
          mode={editingEmployee ? 'edit' : 'create'}
          onSubmit={(payload) => editingEmployee ? updateMutation.mutate(payload) : createMutation.mutate(payload)}
        />
      </Modal>
    </div>
  );
}

export function AdminAnalyticsPage() {
  return <AdminOverviewPage />;
}

function attendanceVariant(status: string) {
  if (status === 'PRESENT') return 'success';
  if (status === 'ABSENT') return 'danger';
  if (status === 'REMOTE') return 'info';
  return 'warning';
}

export function AdminAttendancePage() {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const { data, isLoading } = useQuery({
    queryKey: ['admin-attendance', date],
    queryFn: () => apiFetch<DailyAttendanceResponse>(`/admin/attendance?date=${date}`)
  });

  const summaryItems = ['PRESENT', 'LATE', 'ABSENT', 'NOT_SCANNED'].map((status) => ({
    status,
    count: data?.summary[status] || 0
  }));

  return (
    <div className="space-y-6">
      <SectionHero
        eyebrow={t('nav.attendance')}
        title={t('attendance.title')}
        description={t('attendance.description')}
        actions={(
          <div className="min-w-[240px]">
            <Field label={t('attendance.date')}>
              <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </Field>
          </div>
        )}
      />

      <div className="grid gap-4 md:grid-cols-4">
        {summaryItems.map((item) => (
          <Card key={item.status}>
            <p className="text-sm text-muted">{t(`status.${item.status}` as Parameters<typeof t>[0])}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{item.count}</p>
          </Card>
        ))}
      </div>

      <Card>
        {isLoading || !data ? <LoadingState label={t('attendance.loading')} /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">{t('attendance.employee')}</th>
                  <th className="px-4 py-3 font-medium">{t('attendance.department')}</th>
                  <th className="px-4 py-3 font-medium">{t('attendance.checkIn')}</th>
                  <th className="px-4 py-3 font-medium">{t('attendance.status')}</th>
                  <th className="px-4 py-3 font-medium">{t('attendance.performance')}</th>
                  <th className="px-4 py-3 font-medium">{t('attendance.note')}</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((record) => {
                  const status = record.attendance?.status || 'NOT_SCANNED';
                  return (
                    <tr key={record.employeeId} className="border-t border-border/70">
                      <td className="px-4 py-4">
                        <p className="font-semibold">{record.fullName}</p>
                        <p className="text-muted">{record.employeeCode} • {record.title}</p>
                      </td>
                      <td className="px-4 py-4">{record.department}<div className="text-muted">{record.team}</div></td>
                      <td className="px-4 py-4">{record.attendance?.checkIn || t('attendance.noCheckIn')}</td>
                      <td className="px-4 py-4"><Badge label={t(`status.${status}` as Parameters<typeof t>[0])} variant={attendanceVariant(status)} /></td>
                      <td className="px-4 py-4">{record.performanceScore}%</td>
                      <td className="px-4 py-4 text-muted">{record.attendance?.note || t('attendance.noNote')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export function AdminEmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['employee-detail', id],
    queryFn: () => apiFetch<Employee & { attendanceRecords: Array<{ id: string; date: string; checkIn?: string | null; checkOut?: string | null; status: string }>; tasks: Array<{ id: string; title: string; description?: string | null; status: string }> }>(`/admin/employees/${id}`),
    enabled: Boolean(id)
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading employee profile..." />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>

      <section className="panel-strong relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.18),transparent_20%)]" />
        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <img className="h-20 w-20 rounded-[1.7rem] object-cover" src={data.avatar || 'https://placehold.co/120x120'} alt={data.fullName} />
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-300">{data.employeeCode}</p>
              <h3 className="mt-2 font-display text-3xl font-semibold">{data.fullName}</h3>
              <p className="mt-2 text-sm text-slate-300">{data.title} • {data.department} • {data.location}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur"><p className="text-xs uppercase tracking-[0.18em] text-slate-300">Status</p><p className="mt-2 text-lg font-semibold">{data.status}</p></div>
            <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur"><p className="text-xs uppercase tracking-[0.18em] text-slate-300">Performance</p><p className="mt-2 text-lg font-semibold">{data.performanceScore}%</p></div>
            <div className="rounded-[1.4rem] bg-white/10 px-4 py-4 backdrop-blur"><p className="text-xs uppercase tracking-[0.18em] text-slate-300">Manager</p><p className="mt-2 text-lg font-semibold">{data.managerName || 'Not assigned'}</p></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <h3 className="font-display text-xl font-semibold">Attendance history</h3>
          <div className="mt-4 space-y-3">
            {data.attendanceRecords.map((record) => (
              <div key={record.id} className="metric-tile flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{formatDate(record.date)}</p>
                  <p className="text-sm text-muted">{record.checkIn || 'No check-in'} to {record.checkOut || 'No check-out'}</p>
                </div>
                <Badge label={record.status} variant={record.status === 'PRESENT' ? 'success' : record.status === 'REMOTE' ? 'info' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-xl font-semibold">Assigned tasks</h3>
            <div className="mt-4 space-y-3">
              {data.tasks.map((task) => (
                <div key={task.id} className="metric-tile">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{task.title}</p>
                    <Badge label={task.status.replace('_', ' ')} variant={task.status === 'DONE' ? 'success' : 'info'} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{task.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="font-display text-xl font-semibold">Permissions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.permissions.map((permission) => <Badge key={permission} label={permission} variant="info" />)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
