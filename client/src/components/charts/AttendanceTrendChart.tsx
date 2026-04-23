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
    <Card>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">Attendance trend</h3>
        <p className="text-sm text-muted">Daily status distribution for the current reporting window.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={Object.values(grouped)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.16)" />
            <XAxis dataKey="date" stroke="currentColor" fontSize={12} />
            <YAxis stroke="currentColor" fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="present" stroke="#0f766e" strokeWidth={3} />
            <Line type="monotone" dataKey="remote" stroke="#0284c7" strokeWidth={3} />
            <Line type="monotone" dataKey="leave" stroke="#d97706" strokeWidth={3} />
            <Line type="monotone" dataKey="absent" stroke="#dc2626" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}