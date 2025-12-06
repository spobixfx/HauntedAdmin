import React from 'react';
import { AlertTriangle, DollarSign } from 'lucide-react';

interface PaymentAlertProps {
  type: 'no-payment' | 'overdue';
  lastPaymentDate?: string;
  planDuration?: string;
}

export function PaymentAlert({ type, lastPaymentDate, planDuration }: PaymentAlertProps) {
  const config = {
    'no-payment': {
      icon: AlertTriangle,
      title: 'No payment recorded',
      description: 'This member has no payment history. Add payment record to track revenue.',
      bgColor: 'bg-[var(--status-warning)]/10',
      borderColor: 'border-[var(--status-warning)]/30',
      iconColor: 'text-[var(--status-warning)]'
    },
    'overdue': {
      icon: DollarSign,
      title: 'Payment may be overdue',
      description: `Last payment was on ${lastPaymentDate}, exceeding the ${planDuration} plan period.`,
      bgColor: 'bg-[var(--status-error)]/10',
      borderColor: 'border-[var(--status-error)]/30',
      iconColor: 'text-[var(--status-error)]'
    }
  };
  
  const alert = config[type];
  const Icon = alert.icon;
  
  return (
    <div 
      className={`
        flex items-start gap-3 p-4 
        ${alert.bgColor}
        border ${alert.borderColor}
        rounded-lg
      `}
    >
      <Icon className={`w-5 h-5 ${alert.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <div className={`text-sm ${alert.iconColor}`}>
          {alert.title}
        </div>
        <div className="text-xs text-[var(--text-muted)] mt-1">
          {alert.description}
        </div>
      </div>
    </div>
  );
}
