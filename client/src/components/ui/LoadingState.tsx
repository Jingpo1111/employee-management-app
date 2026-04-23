import { LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Loading data...' }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center gap-3 rounded-panel border border-dashed border-border bg-surface/70 p-6 text-sm text-muted">
      <LoaderCircle className="h-5 w-5 animate-spin" />
      <span>{label}</span>
    </div>
  );
}