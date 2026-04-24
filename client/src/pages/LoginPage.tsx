import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BriefcaseBusiness, LockKeyhole, Mail, MonitorSmartphone, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate(searchParams.get('redirect') || '/');
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-canvas lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#14213d_0%,#0f2747_35%,#123c55_100%)] p-6 text-white sm:p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,138,100,0.28),transparent_22%),radial-gradient(circle_at_85%_18%,rgba(45,212,191,0.18),transparent_18%),radial-gradient(circle_at_72%_78%,rgba(59,130,246,0.22),transparent_24%)]" />
        <div className="absolute -left-16 top-24 h-44 w-44 rounded-full bg-[#ff8a64]/20 blur-3xl" />
        <div className="absolute bottom-12 right-0 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="hero-chip">Modern employee operations</div>
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Colorful, responsive people management that still feels precise.</h1>
          <p className="mt-5 max-w-xl text-base text-slate-200 sm:text-lg">A brighter visual system, clearer hierarchy, and faster mobile interactions inspired by modern SaaS admin products without inheriting their flatness.</p>
        </div>

        <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Role-aware flows', description: 'Admin and employee journeys separate heavy controls from daily self-service.' },
            { icon: MonitorSmartphone, title: 'Mobile usable', description: 'Navigation, tables, and actions collapse without becoming cramped.' },
            { icon: BriefcaseBusiness, title: 'Signal-first layout', description: 'Cards, charts, and next actions surface the right information in the right order.' }
          ].map(({ icon: Icon, title, description }, index) => (
            <div key={title} className={`rounded-[1.7rem] border border-white/10 bg-white/8 p-5 backdrop-blur ${index === 1 ? 'lg:-translate-y-4' : ''}`}>
              <div className="inline-flex rounded-2xl bg-white/10 p-3 text-[#ffb38f]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold">{title}</p>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-lg overflow-hidden p-0">
          <div className="gradient-stroke p-[1px]">
            <div className="rounded-[calc(1.75rem-1px)] bg-surface px-6 py-7 sm:px-8 sm:py-9">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-accent">Welcome back</p>
                  <h2 className="mt-3 font-display text-3xl font-semibold">Sign in to Employee OS</h2>
                </div>
                <div className="rounded-2xl bg-accentSoft p-3 text-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-3 text-sm text-muted">Enter the email and password assigned by your administrator. Passwords are never displayed on this page.</p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input className="pl-11" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                  </div>
                </Field>
                <Field label="Password">
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input className="pl-11" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
                  </div>
                </Field>
                {error ? <p className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p> : null}
                <Button type="submit" className="w-full">{loading ? 'Signing in...' : 'Sign in'}</Button>
              </form>

              <div className="mt-7 rounded-2xl border border-border/70 bg-white/65 p-4 text-sm text-muted dark:bg-white/5">
                Admin can create employee accounts from the dashboard and assign private login passwords during employee setup.
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
