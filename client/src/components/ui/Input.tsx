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
        'w-full rounded-2xl border border-border/90 bg-white/80 px-4 py-3 text-sm text-text shadow-sm backdrop-blur placeholder:text-muted dark:bg-surface/80',
        className
      )}
      {...props}
    />
  );
});
