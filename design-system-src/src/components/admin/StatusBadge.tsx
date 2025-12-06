import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Snowflake, Zap } from 'lucide-react';

type Status = 'active' | 'expired' | 'expiring-soon' | 'frozen' | 'trial';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  'active': {
    label: 'Active',
    icon: CheckCircle,
    bgColor: 'bg-[var(--status-success)]/20',
    textColor: 'text-[var(--status-success)]',
    borderColor: 'border-[var(--status-success)]/30'
  },
  'expired': {
    label: 'Expired',
    icon: XCircle,
    bgColor: 'bg-[var(--status-error)]/20',
    textColor: 'text-[var(--status-error)]',
    borderColor: 'border-[var(--status-error)]/30'
  },
  'expiring-soon': {
    label: 'Expiring Soon',
    icon: AlertCircle,
    bgColor: 'bg-[var(--status-warning)]/20',
    textColor: 'text-[var(--status-warning)]',
    borderColor: 'border-[var(--status-warning)]/30'
  },
  'frozen': {
    label: 'Frozen',
    icon: Snowflake,
    bgColor: 'bg-[var(--blue-electric)]/20',
    textColor: 'text-[var(--blue-electric)]',
    borderColor: 'border-[var(--blue-electric)]/30'
  },
  'trial': {
    label: 'Trial',
    icon: Zap,
    bgColor: 'bg-purple-500/20',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30'
  }
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 
        rounded-full 
        border
        ${config.bgColor} 
        ${config.textColor}
        ${config.borderColor}
        text-xs
        ${className}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
