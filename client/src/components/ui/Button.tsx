import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

const styles = {
  primary: 'gradient-stroke p-[1px] text-white shadow-glow [&>span]:bg-[rgb(32,46,78)] [&>span]:text-white dark:[&>span]:bg-[rgb(255,125,92)] dark:[&>span]:text-slate-950',
  secondary: 'bg-accentSoft text-accent border border-accent/10 hover:bg-accent hover:text-white',
  ghost: 'bg-transparent text-text border border-border hover:bg-surface/80',
  danger: 'bg-danger text-white border border-danger/30 hover:shadow-glow'
};

export function Button({ className, variant = 'primary', children, ...props }: ButtonProps) {
  if (variant === 'primary') {
    return (
      <button className={cn('inline-flex rounded-2xl text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60', styles.primary, className)} {...props}>
        <span className="inline-flex w-full items-center justify-center rounded-[calc(1rem-1px)] px-4 py-2.5">{children}</span>
      </button>
    );
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
