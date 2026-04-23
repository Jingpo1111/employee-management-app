import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Download, Pencil, Plus, Search, ShieldCheck, Trash2, UserRoundPlus } from 'lucide-react';
import { apiFetch, downloadFile } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { AdminDashboardResponse, Employee, PaginatedEmployees } from '../../types';
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

const defaultForm = {
  fullName: '',
  email: '',
  title: '',
  department: '',
  team: '',
  phone: '',
  location: '',
  status: 'Active',
  bio: '',
  avatar: '',
  performanceScore: 85,
  managerName: '',
  permissions: ['profile:view', 'profile:edit', 'tasks:view', 'attendance:view'],
  startDate: new Date().toISOString().slice(0, 10)
};

function EmployeeForm({
  initialValue,
  onSubmit,
  submitting
}: {
  initialValue?: Partial<typeof defaultForm>;
  onSubmit: (payload: typeof defaultForm) => void;
  submitting?: boolean;
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
      <Field label="Job title" error={errors.title}><Input value={form.title} onChange={(event) => update('title', event.target.value)} /></Field>
      <Field label="Department" error={errors.department}><Input value={form.department} onChange={(event) => update('department', event.target.value)} /></Field>
      <Field label="Team" error={errors.team}><Input value={form.team} onChange={(event) => update('team', event.target.value)} /></Field>
      <Field label="Location" error={errors.location}><Input value={form.location} onChange={(event) => update('location', event.target.value)} /></Field>
      <Field label="Phone"><Input value={form.phone} onChange={(event) => update('phone', event.target.value)} /></Field>
      <Field label="Manager"><Input value={form.managerName} onChange={(event) => update('managerName', event.target.value)} /></Field>
      <Field label="Status"><Input value={form.status} onChange={(event) => update('status', event.target.value)} /></Field>
      <Field label="Start date"><Input type="date" value={form.startDate} onChange={(event) => update('startDate', event.target.value)} /></Field>
      <Field label="Performance score" error={errors.performanceScore}><Input type="number" min={0} max={100} value={form.performanceScore} onChange={(event) => update('performanceScore', Number(event.target.value))} /></Field>
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
      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {data.stats.map((stat) => <StatCard key={stat.label} stat={stat} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <AttendanceTrendChart data={data.attendanceTrend} />
        <DepartmentChart data={data.employeesByDepartment} />
      </div>
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Fast management patterns</h3>
          <p className="text-sm text-muted">Use segmented filters, progressive disclosure, and export actions close to the table to reduce admin friction.</p>
        </div>
        <Link to="/admin/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
          Open employee directory <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
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
      <Card className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Employee directory</h3>
          <p className="text-sm text-muted">Search by name, role, code, or email. Keep destructive actions separated from edit actions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => downloadFile('/admin/employees/export?format=csv', 'employees.csv')}><Download className="mr-2 h-4 w-4" />CSV</Button>
          <Button variant="secondary" onClick={() => downloadFile('/admin/employees/export?format=pdf', 'employees.pdf')}><Download className="mr-2 h-4 w-4" />PDF</Button>
          <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add employee</Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-11" placeholder="Search employees" value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} />
          </div>
          <select className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm" value={department} onChange={(event) => { setPage(1); setDepartment(event.target.value); }}>
            <option value="">All departments</option>
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="fullName">Name</option>
            <option value="department">Department</option>
            <option value="performanceScore">Performance</option>
            <option value="startDate">Start date</option>
            <option value="status">Status</option>
          </select>
          <select className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'asc' | 'desc')}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {isLoading ? <LoadingState label="Loading employee directory..." /> : null}

        {!isLoading && data?.data.length ? (
          <div className="overflow-x-auto">
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
                        <img className="h-11 w-11 rounded-2xl object-cover" src={employee.avatar || 'https://placehold.co/80x80'} alt={employee.fullName} />
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
          onSubmit={(payload) => editingEmployee ? updateMutation.mutate(payload) : createMutation.mutate(payload)}
        />
      </Modal>
    </div>
  );
}

export function AdminAnalyticsPage() {
  return <AdminOverviewPage />;
}

export function AdminEmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['employee-detail', id],
    queryFn: () => apiFetch<Employee & { attendanceRecords: any[]; tasks: any[]; notifications: any[] }>(`/admin/employees/${id}`),
    enabled: Boolean(id)
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading employee profile..." />;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
      <Card className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <img className="h-20 w-20 rounded-3xl object-cover" src={data.avatar || 'https://placehold.co/120x120'} alt={data.fullName} />
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">{data.employeeCode}</p>
            <h3 className="font-display text-3xl font-semibold">{data.fullName}</h3>
            <p className="text-muted">{data.title} • {data.department} • {data.location}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Status</p><p className="mt-2 text-lg font-semibold">{data.status}</p></div>
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Performance</p><p className="mt-2 text-lg font-semibold">{data.performanceScore}%</p></div>
          <div className="rounded-2xl border border-border px-4 py-3"><p className="text-xs uppercase tracking-[0.2em] text-muted">Manager</p><p className="mt-2 text-lg font-semibold">{data.managerName || 'Not assigned'}</p></div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h3 className="font-display text-lg font-semibold">Attendance history</h3>
          <div className="mt-4 space-y-3">
            {data.attendanceRecords.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                <div>
                  <p className="font-medium">{formatDate(record.date)}</p>
                  <p className="text-sm text-muted">{record.checkIn || 'No check-in'} to {record.checkOut || 'No check-out'}</p>
                </div>
                <Badge label={record.status} variant={record.status === 'PRESENT' ? 'success' : record.status === 'REMOTE' ? 'info' : 'warning'} />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-display text-lg font-semibold">Assigned tasks</h3>
            <div className="mt-4 space-y-3">
              {data.tasks.map((task: any) => (
                <div key={task.id} className="rounded-2xl border border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge label={task.status.replace('_', ' ')} variant={task.status === 'DONE' ? 'success' : 'info'} />
                  </div>
                  <p className="mt-2 text-sm text-muted">{task.description}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-display text-lg font-semibold">Permissions</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.permissions.map((permission) => <Badge key={permission} label={permission} variant="info" />)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}