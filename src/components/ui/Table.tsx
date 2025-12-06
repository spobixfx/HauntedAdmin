import {
  HTMLAttributes,
  TableHTMLAttributes,
  ThHTMLAttributes,
  TdHTMLAttributes,
} from 'react';

type Align = 'left' | 'center' | 'right';

const alignClass: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#050b19]/50 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
      <table
        className={['w-full border-collapse text-sm', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={['bg-white/5 border-b border-white/10', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={['divide-y divide-white/10', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export function TableRow({
  hoverable = true,
  className,
  ...props
}: TableRowProps) {
  const classes = [
    'bg-transparent',
    hoverable
      ? 'transition-colors duration-150 hover:bg-white/5'
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <tr className={classes} {...props} />;
}

interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function TableHead({
  align = 'left',
  className,
  ...props
}: TableHeadProps) {
  const classes = [
    'px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]',
    alignClass[align],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <th className={classes} {...props} />;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align;
}

export function TableCell({
  align = 'left',
  className,
  ...props
}: TableCellProps) {
  const classes = [
    'px-6 py-4 text-sm text-[var(--text-body)]',
    alignClass[align],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <td className={classes} {...props} />;
}









