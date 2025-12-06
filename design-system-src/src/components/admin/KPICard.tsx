import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  subtitle?: string;
  className?: string;
}

export function KPICard({ title, value, icon: Icon, trend, subtitle, className = '' }: KPICardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;
  const trendColor = trend?.direction === 'up' ? 'text-[var(--status-success)]' : 'text-[var(--status-error)]';
  
  return (
    <div 
      className={`
        bg-[var(--bg-tertiary)] 
        border border-[var(--border-default)]
        rounded-lg
        p-6
        ${className}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
          <Icon className="w-6 h-6 text-[var(--blue-electric)]" />
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 ${trendColor}`} style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)' }}>
            <TrendIcon className="w-4 h-4" />
            {trend.value}
          </div>
        )}
      </div>
      
      <div style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }} className="mb-1">
        {title}
      </div>
      {subtitle && (
        <p
          className="mb-2"
          style={{ fontSize: 'var(--text-secondary)', lineHeight: 'var(--line-height-secondary)', color: 'var(--text-muted)' }}
        >
          {subtitle}
        </p>
      )}
      
      <div style={{ fontSize: 'var(--text-page-title)', fontWeight: 'var(--font-weight-semibold)', lineHeight: 'var(--line-height-page-title)', color: 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
