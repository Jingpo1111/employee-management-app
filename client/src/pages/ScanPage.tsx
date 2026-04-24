import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCircle2, QrCode, ShieldAlert } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingState } from '../components/ui/LoadingState';

export function ScanPage() {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['scan-status', token],
    queryFn: () => apiFetch<{ valid: boolean; message: string; dateKey?: string }>(`/employee/scan/${token}`),
    enabled: Boolean(token),
    retry: false
  });

  const claimMutation = useMutation({
    mutationFn: () => apiFetch<{ message: string; alreadyClaimed: boolean }>(`/employee/scan/${token}/claim`, { method: 'POST' })
  });

  if (isLoading) {
    return <LoadingState label="Validating QR code..." />;
  }

  const message = error instanceof Error ? error.message : data?.message || 'Invalid QR code.';
  const redirect = `/scan/${token}`;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 sm:p-10">
      <Card className="w-full max-w-2xl overflow-hidden">
        <div className="panel-strong relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.18),transparent_20%),radial-gradient(circle_at_75%_78%,rgba(59,130,246,0.16),transparent_25%)]" />
          <div className="relative z-10">
            <div className="hero-chip">Telegram QR landing</div>
            <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Daily employee check-in</h1>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">Scan opens your website, validates today's QR, and lets the employee complete attendance with admin control.</p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {data?.valid ? (
            <div className="space-y-5">
              <div className="metric-tile flex items-start gap-4">
                <div className="rounded-[1rem] bg-success/15 p-3 text-success"><CheckCircle2 className="h-5 w-5" /></div>
                <div>
                  <p className="font-display text-2xl font-semibold">QR code is valid for today</p>
                  <p className="mt-2 text-sm text-muted">Date: {data.dateKey}. This code can be claimed only by an employee account and only while admin keeps it active.</p>
                </div>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <Card className="bg-[linear-gradient(135deg,rgba(255,138,100,0.14),rgba(14,165,140,0.12))]">
                    <p className="font-semibold">Sign in to continue</p>
                    <p className="mt-2 text-sm text-muted">Employees need to sign in before attendance can be recorded. After login, you will come back to this same QR page automatically.</p>
                  </Card>
                  <Link to={`/login?redirect=${encodeURIComponent(redirect)}`}><Button className="w-full">Employee sign in</Button></Link>
                </div>
              ) : user.role !== 'EMPLOYEE' ? (
                <div className="metric-tile flex items-start gap-4">
                  <div className="rounded-[1rem] bg-warning/15 p-3 text-warning"><ShieldAlert className="h-5 w-5" /></div>
                  <div>
                    <p className="font-semibold">Admin accounts cannot claim attendance</p>
                    <p className="mt-2 text-sm text-muted">Please use an employee account to complete the attendance check-in flow.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="rounded-[1rem] bg-accentSoft p-3 text-accent"><QrCode className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold">Ready to record attendance</p>
                        <p className="mt-2 text-sm text-muted">Tap once to claim today's attendance. If you already claimed it earlier, the system will tell you and keep your record unchanged.</p>
                      </div>
                    </div>
                  </Card>
                  <Button className="w-full" onClick={() => claimMutation.mutate()} disabled={claimMutation.isPending}>{claimMutation.isPending ? 'Recording attendance...' : 'Confirm attendance for today'}</Button>
                  {claimMutation.data ? <Card className="bg-[linear-gradient(135deg,rgba(20,184,166,0.14),rgba(59,130,246,0.12))]"><p className="font-semibold">{claimMutation.data.message}</p></Card> : null}
                  {claimMutation.error instanceof Error ? <Card className="bg-danger/10"><p className="font-semibold text-danger">{claimMutation.error.message}</p></Card> : null}
                </div>
              )}
            </div>
          ) : (
            <div className="metric-tile flex items-start gap-4">
              <div className="rounded-[1rem] bg-danger/15 p-3 text-danger"><ShieldAlert className="h-5 w-5" /></div>
              <div>
                <p className="font-display text-2xl font-semibold">QR code unavailable</p>
                <p className="mt-2 text-sm text-muted">{message}</p>
                <p className="mt-3 text-sm text-muted">Admin may have paused it, or the day has already changed.</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link to={user ? '/' : '/login'} className="text-sm font-semibold text-accent">Return to website</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
