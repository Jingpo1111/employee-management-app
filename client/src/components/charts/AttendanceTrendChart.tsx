import { ResponsiveContainer, CartesianGrid, LineChart, Line, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { Card } from '../ui/Card';

export function AttendanceTrendChart({ data }: { data: Array<{ date: string; status: string; count: number }> }) {
  const grouped = data.reduce<Record<string, { date: string; present: number; remote: number; leave: number; absent: number }>>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { date: item.date, present: 0, remote: 0, leave: 0, absent: 0 };
    }

    const key = item.status.toLowerCase() as 'present' | 'remote' | 'leave' | 'absent';
    acc[item.date][key] = item.count;
    return acc;
  }, {});

  return (
    <Card className="overflow-hidden">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Attendance trend</h3>
          <p className="text-sm text-muted">Daily movement across office, remote, leave, and absence states.</p>
        </div>
        <div className="hero-chip hidden bg-[rgba(32,46,78,0.9)] sm:inline-flex">Weekly signal</div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Object.values(grouped)}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(142, 156, 180, 0.2)" />
            <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
            <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid rgba(228,214,199,0.7)', background: 'rgba(255,255,255,0.92)' }} />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#14b8a6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="remote" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="leave" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
