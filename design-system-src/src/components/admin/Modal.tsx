import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`
          relative w-full ${sizeStyles[size]}
          bg-[var(--bg-secondary)]
          border border-[var(--border-default)]
          rounded-lg
          shadow-2xl
          max-h-[90vh]
          overflow-hidden
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[var(--border-default)]">
          <div>
            <h2 className="text-[var(--text-primary)]">{title}</h2>
            {subtitle && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
