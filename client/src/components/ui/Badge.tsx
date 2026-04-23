import { cn } from '../../lib/utils';

const variants = {
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
  danger: 'bg-danger/15 text-danger border border-danger/20',
  neutral: 'bg-border/65 text-text border border-border/80',
  info: 'bg-accentSoft text-accent border border-accent/15'
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: keyof typeof variants }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', variants[variant])}>{label}</span>;
}
