import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../admin/Button';

interface AccessDeniedProps {
  onBackToDashboard?: () => void;
}

export function AccessDenied({ onBackToDashboard }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--status-error)] opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--status-error)] opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--status-error)]/30 mb-6">
          <ShieldX className="w-10 h-10 text-[var(--status-error)]" />
        </div>

        {/* Error Code */}
        <div className="text-sm text-[var(--text-muted)] mb-2 tracking-wider">
          ERROR 403
        </div>

        {/* Title */}
        <h1 className="mb-3">
          Access denied
        </h1>

        {/* Description */}
        <p className="mb-2" style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}>
          You don't have permission to view this page.
        </p>
        <p className="mb-8" style={{ fontSize: 'var(--text-secondary)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-secondary)', color: 'var(--text-muted)' }}>
          If you think this is a mistake, contact the Owner.
        </p>

        {/* Action Button */}
        <Button
          variant="primary"
          onClick={onBackToDashboard}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Button>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-xs text-[var(--text-muted)]">
            Haunted Family © 2024 • Internal Use Only
          </p>
        </div>
      </div>
    </div>
  );
}
