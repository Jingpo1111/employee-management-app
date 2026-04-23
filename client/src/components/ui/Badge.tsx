import { cn } from '../../lib/utils';

const variants = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  neutral: 'bg-border text-text',
  info: 'bg-accentSoft text-accent'
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: keyof typeof variants }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', variants[variant])}>{label}</span>;
}