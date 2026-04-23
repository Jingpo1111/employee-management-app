import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text shadow-sm placeholder:text-muted transition',
        className
      )}
      {...props}
    />
  );
});