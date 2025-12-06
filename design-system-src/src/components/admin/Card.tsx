import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  return (
    <div 
      className={`
        bg-[var(--bg-tertiary)] 
        border border-[var(--border-default)]
        rounded-lg
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h2>{title}</h2>
        {subtitle && (
          <p className="mt-1" style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)', color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
