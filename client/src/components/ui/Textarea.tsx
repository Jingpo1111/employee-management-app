import { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-28 w-full rounded-2xl border border-border/90 bg-white/80 px-4 py-3 text-sm text-text backdrop-blur dark:bg-surface/80', className)} {...props} />;
}
