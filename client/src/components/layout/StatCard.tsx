import { DashboardStat } from '../../types';
import { Card } from '../ui/Card';

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-muted">{stat.label}</p>
      <div className="flex items-end justify-between gap-4">
        <p className="font-display text-3xl font-semibold">{stat.value}</p>
        <span className="rounded-full bg-accentSoft px-3 py-1 text-xs font-semibold text-accent">{stat.delta}</span>
      </div>
    </Card>
  );
}