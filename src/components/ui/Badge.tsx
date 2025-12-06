'use client';

import { HTMLAttributes } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const baseClasses =
  'inline-flex items-center w-fit whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide';

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-[var(--muted)]/60 text-[var(--text-secondary)] border-[var(--border-default)]',
  success:
    'bg-[var(--status-success)]/15 text-[var(--status-success)] border-[var(--status-success)]/30',
  warning:
    'bg-[var(--status-warning)]/15 text-[var(--status-warning)] border-[var(--status-warning)]/30',
  error:
    'bg-[var(--status-error)]/15 text-[var(--status-error)] border-[var(--status-error)]/30',
  info:
    'bg-[var(--blue-electric)]/15 text-[var(--blue-electric)] border-[var(--blue-electric)]/30',
};

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const classes = [baseClasses, variantStyles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

