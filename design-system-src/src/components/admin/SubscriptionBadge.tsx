import React from 'react';

type SubscriptionPlan = 'killore' | 'broke-haunted' | 'haunted';

interface SubscriptionBadgeProps {
  plan: SubscriptionPlan;
  className?: string;
}

const planConfig = {
  'killore': {
    label: 'Killore',
    bgColor: 'bg-[var(--plan-killore)]/20',
    textColor: 'text-[var(--plan-killore)]',
    borderColor: 'border-[var(--plan-killore)]/30'
  },
  'broke-haunted': {
    label: 'Broke Haunted',
    bgColor: 'bg-[var(--plan-broke-haunted)]/20',
    textColor: 'text-[var(--plan-broke-haunted)]',
    borderColor: 'border-[var(--plan-broke-haunted)]/30'
  },
  'haunted': {
    label: 'Haunted',
    bgColor: 'bg-[var(--plan-haunted)]/20',
    textColor: 'text-[var(--plan-haunted)]',
    borderColor: 'border-[var(--plan-haunted)]/30'
  }
};

export function SubscriptionBadge({ plan, className = '' }: SubscriptionBadgeProps) {
  const config = planConfig[plan];
  
  return (
    <span 
      className={`
        inline-flex items-center px-3 py-1 
        rounded-full 
        border
        ${config.bgColor} 
        ${config.textColor}
        ${config.borderColor}
        text-xs
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
