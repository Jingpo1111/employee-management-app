import { DashboardStat } from '../../types';
import { Card } from '../ui/Card';

const accents = [
  'from-[#ff8a64] to-[#f59e0b]',
  'from-[#14b8a6] to-[#0ea5e9]',
  'from-[#2563eb] to-[#38bdf8]',
  'from-[#ef4444] to-[#f97316]'
];

export function StatCard({ stat, index = 0 }: { stat: DashboardStat; index?: number }) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-x-5 top-0 h-1 rounded-full bg-gradient-to-r ${accents[index % accents.length]}`} />
      <div className="space-y-3 pt-2">
        <p className="text-sm font-semibold text-muted">{stat.label}</p>
        <div className="flex items-end justify-between gap-4">
          <p className="font-display text-3xl font-semibold">{stat.value}</p>
          <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">{stat.delta}</span>
        </div>
      </div>
    </Card>
  );
}
