import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onDismiss, className = '' }: ErrorBannerProps) {
  return (
    <div 
      className={`
        flex items-center gap-3 p-4 
        bg-[var(--status-error)]/10 
        border border-[var(--status-error)]/30
        rounded-lg
        ${className}
      `}
    >
      <AlertCircle className="w-5 h-5 text-[var(--status-error)] flex-shrink-0" />
      <p className="text-sm text-[var(--status-error)] flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-[var(--status-error)] hover:text-[var(--status-error-light)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
