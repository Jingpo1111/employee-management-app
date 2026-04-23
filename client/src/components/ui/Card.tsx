import { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn('panel p-5 sm:p-6', className)}>{children}</section>;
}
