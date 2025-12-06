import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return (
    <thead className={`border-b border-[var(--border-strong)] ${className}`}>
      {children}
    </thead>
  );
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function TableRow({ children, className = '', hoverable = true }: TableRowProps) {
  return (
    <tr 
      className={`
        border-b border-[var(--border-default)]
        ${hoverable ? 'hover:bg-[var(--bg-elevated)] transition-colors duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableHead({ children, className = '', align = 'left' }: TableHeadProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <th 
      className={`
        px-6 py-4
        uppercase
        tracking-wider
        ${alignClass[align]}
        ${className}
      `}
      style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}
    >
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, className = '', align = 'left' }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td 
      className={`
        px-6 py-4
        ${alignClass[align]}
        ${className}
      `}
      style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}
    >
      {children}
    </td>
  );
}
