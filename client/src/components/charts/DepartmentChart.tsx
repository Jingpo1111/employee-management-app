import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';

const palette = ['#0c4a6e', '#0284c7', '#14b8a6', '#f59e0b', '#ef4444'];

export function DepartmentChart({ data }: { data: Array<{ department: string; count: number }> }) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">Department mix</h3>
        <p className="text-sm text-muted">Headcount allocation across teams and operating units.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="department" innerRadius={64} outerRadius={92} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.department} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {data.map((item, index) => (
          <div key={item.department} className="rounded-2xl border border-border px-3 py-3">
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