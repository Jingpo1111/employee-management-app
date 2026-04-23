import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

const styles = {
  primary: 'bg-accent text-white hover:opacity-90 dark:text-slate-950',
  secondary: 'bg-accentSoft text-accent hover:bg-accentSoft/80',
  ghost: 'bg-transparent text-text hover:bg-border/50',
  danger: 'bg-danger text-white hover:opacity-90'
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className
      )}
      {...props}
    />
  );
}