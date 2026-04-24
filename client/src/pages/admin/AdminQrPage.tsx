import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, PauseCircle, PlayCircle, QrCode, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../lib/api';
import { DailyQrCode, DailyQrCodeResponse } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { formatDate } from '../../lib/utils';

function SectionHero() {
  return (
    <section className="panel-strong relative overflow-hidden p-6 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,138,100,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.18),transparent_20%),radial-gradient(circle_at_75%_78%,rgba(59,130,246,0.16),transparent_25%)]" />
      <div className="relative z-10 max-w-2xl">
        <div className="hero-chip">Daily QR attendance</div>
        <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Generate one QR code per day and let employees enter through Telegram scan.</h3>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">Admin controls whether the QR is active. Employees scan the QR, land on your website, sign in if needed, and claim attendance for today only.</p>
      </div>
    </section>
  );
}

function QrStats({ qrCode, scanCount, dateKey }: { qrCode: DailyQrCode | null; scanCount: number; dateKey: string }) {
  const items = [
    { label: 'Active status', value: qrCode?.isActive ? 'Live' : 'Paused', icon: QrCode },
    { label: 'Today', value: dateKey, icon: CalendarDays },
    { label: 'Scans claimed', value: String(scanCount), icon: Smartphone }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
          </div>
          <div className="rounded-[1.2rem] bg-accentSoft p-3 text-accent"><Icon className="h-5 w-5" /></div>
        </Card>
      ))}
    </div>
  );
}

export function AdminQrAccessPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-qr-code'],
    queryFn: () => apiFetch<DailyQrCodeResponse>('/admin/qr-code')
  });

  const generateMutation = useMutation({
    mutationFn: () => apiFetch<DailyQrCode>('/admin/qr-code', { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-qr-code'] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => apiFetch<DailyQrCode>('/admin/qr-code', { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-qr-code'] });
    }
  });

  if (isLoading || !data) {
    return <LoadingState label="Loading daily QR access..." />;
  }

  const qrUrl = data.qrCode ? `${window.location.origin}/scan/${data.qrCode.token}` : null;

  return (
    <div className="space-y-6">
      <SectionHero />
      <QrStats qrCode={data.qrCode} scanCount={data.stats.scanCount} dateKey={data.dateKey} />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-semibold">Daily QR code</h3>
              <p className="mt-2 text-sm text-muted">Telegram can scan the QR and open the website directly in the employee browser flow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => generateMutation.mutate()}><RefreshCw className="mr-2 h-4 w-4" />Regenerate</Button>
              {data.qrCode ? (
                data.qrCode.isActive ? (
                  <Button variant="danger" onClick={() => toggleMutation.mutate(false)}><PauseCircle className="mr-2 h-4 w-4" />Pause</Button>
                ) : (
                  <Button onClick={() => toggleMutation.mutate(true)}><PlayCircle className="mr-2 h-4 w-4" />Activate</Button>
                )
              ) : (
                <Button onClick={() => generateMutation.mutate()}><QrCode className="mr-2 h-4 w-4" />Generate today QR</Button>
              )}
            </div>
          </div>

          {data.qrCode && qrUrl ? (
            <div className="mt-6 grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-[1.6rem] bg-white p-5 shadow-card">
                <QRCodeSVG value={qrUrl} size={240} className="h-auto w-full" />
              </div>
              <div className="space-y-4">
                <div className="metric-tile">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Scan URL</p>
                  <p className="mt-2 break-all text-sm font-medium">{qrUrl}</p>
                </div>
                <div className="metric-tile">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge label={data.qrCode.isActive ? 'Active' : 'Paused'} variant={data.qrCode.isActive ? 'success' : 'warning'} />
                    <span className="text-sm text-muted">Valid only for {data.dateKey}</span>
                  </div>
                </div>
                <div className="metric-tile">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">How employees use it</p>
                  <ol className="mt-2 space-y-2 text-sm text-muted">
                    <li>1. Open Telegram scanner or any QR scanner.</li>
                    <li>2. Scan the code.</li>
                    <li>3. The website opens and validates today's QR.</li>
                    <li>4. Employee signs in and confirms attendance.</li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <Card className="bg-[linear-gradient(135deg,rgba(255,138,100,0.14),rgba(14,165,140,0.12))]">
                <h4 className="font-display text-xl font-semibold">No QR generated for today yet</h4>
                <p className="mt-2 text-sm text-muted">Generate one QR code at the start of the day. Admin can pause it anytime if access should stop immediately.</p>
              </Card>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-display text-2xl font-semibold">Claim log</h3>
          <p className="mt-2 text-sm text-muted">Employees who scanned successfully today appear here. One claim per employee per QR.</p>
          <div className="mt-5 space-y-3">
            {data.qrCode?.qrLogs.length ? data.qrCode.qrLogs.map((log) => (
              <div key={log.id} className="metric-tile flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{log.employee.fullName}</p>
                  <p className="text-sm text-muted">{log.employee.employeeCode}</p>
                </div>
                <div className="text-right text-sm text-muted">
                  <p>{formatDate(log.scannedAt)}</p>
                  <p>{new Date(log.scannedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            )) : (
              <div className="metric-tile">
                <p className="font-semibold">No attendance claims yet</p>
                <p className="mt-1 text-sm text-muted">Once employees scan and confirm, their names will appear here for admin tracking.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
