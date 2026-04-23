import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';

const palette = ['#ff8a64', '#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444'];

export function DepartmentChart({ data }: { data: Array<{ department: string; count: number }> }) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">Department mix</h3>
        <p className="text-sm text-muted">Headcount allocation with a faster visual scan for team balance.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="department" innerRadius={64} outerRadius={92} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.department} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid rgba(228,214,199,0.7)', background: 'rgba(255,255,255,0.92)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.department} className="rounded-2xl border border-border/70 bg-white/60 px-3 py-3 dark:bg-white/5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              {item.department}
            </div>
            <p className="mt-1 text-2xl font-semibold">{item.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
