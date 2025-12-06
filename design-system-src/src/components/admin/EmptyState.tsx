import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      
      <h3 className="text-[var(--text-primary)] mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-[var(--text-muted)] text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && <div>{action}</div>}
    </div>
  );
}
