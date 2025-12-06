import { HTMLAttributes, ReactNode } from 'react';

type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

const paddingMap: Record<CardPadding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const classes = [
    'rounded-3xl border border-white/5 bg-gradient-to-b from-[#0b1020] via-[#050b19] to-[#030712] shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
    paddingMap[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
  ...props
}: CardHeaderProps) {
  const classes = [
    'mb-4 flex items-start justify-between gap-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      <div>
        <h2>{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = ['space-y-4', className].filter(Boolean).join(' ');

  return <div className={classes} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const classes = [
    'mt-6 flex items-center justify-end gap-3 border-t border-[var(--border-default)] pt-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}









