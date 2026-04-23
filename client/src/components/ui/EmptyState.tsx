import { PropsWithChildren } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  title,
  description,
  action,
  children
}: PropsWithChildren<{
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}>) {
  return (
    <div className="panel flex min-h-48 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-2xl bg-accentSoft p-3 text-accent">
        <Inbox className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 max-w-md text-sm text-muted">{description}</p>
      </div>
      {children}
      {action ? <Button onClick={action.onClick}>{action.label}</Button> : null}
    </div>
  );
}