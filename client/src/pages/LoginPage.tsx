import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, MonitorSmartphone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@acmehr.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.22),transparent_28%)]" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.26em] text-cyan-300">Employee OS</p>
          <h1 className="mt-4 max-w-lg font-display text-5xl font-semibold leading-tight">High-signal employee operations with a calmer admin workflow.</h1>
        </div>
        <div className="relative grid gap-4">
          {[
            { icon: ShieldCheck, title: 'Role-aware access', description: 'Admin and employee workspaces are separated by route guards and API guards.' },
            { icon: MonitorSmartphone, title: 'Responsive dashboard shell', description: 'Mobile-first layout, keyboard focus states, and dark mode included.' },
            { icon: LockKeyhole, title: 'Operational clarity', description: 'Search, filter, export, and profile actions are placed where they reduce friction.' }
          ].map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <Icon className="h-5 w-5 text-cyan-300" />
              <p className="mt-4 font-semibold">{title}</p>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md">
          <p className="text-sm uppercase tracking-[0.26em] text-accent">Welcome back</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Sign in to Employee OS</h2>
          <p className="mt-2 text-sm text-muted">Demo credentials are pre-filled. Switch to an employee account after seeding if needed.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Field label="Email">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input className="pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </div>
            </Field>
            <Field label="Password">
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input className="pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
            </Field>
            {error ? <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p> : null}
            <Button type="submit" className="w-full">{loading ? 'Signing in...' : 'Sign in'}</Button>
          </form>

          <div className="mt-6 rounded-2xl bg-accentSoft p-4 text-sm text-accent">
            <p className="font-semibold">Demo accounts</p>
            <p className="mt-1">Admin: `admin@acmehr.com / Admin@123`</p>
            <p className="mt-1">Employee: `sokha.chan@acmehr.com / Employee@123`</p>
          </div>
        </Card>
      </section>
    </div>
  );
}