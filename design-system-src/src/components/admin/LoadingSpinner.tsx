import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3'
  };
  
  return (
    <div 
      className={`
        ${sizeStyles[size]}
        border-[var(--blue-electric)]
        border-t-transparent
        rounded-full
        animate-spin
        ${className}
      `}
    />
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingSpinner size="lg" />
      <p className="text-[var(--text-muted)] mt-4">{message}</p>
    </div>
  );
}
