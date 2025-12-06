import React from 'react';
import { Clock, Lock } from 'lucide-react';
import { Button } from '../admin/Button';

interface SessionExpiredProps {
  onLogin?: () => void;
}

export function SessionExpired({ onLogin }: SessionExpiredProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-md">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] mb-6 relative">
          <Lock className="w-10 h-10 text-[var(--text-muted)]" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--status-warning)] flex items-center justify-center border-2 border-[var(--bg-primary)]">
            <Clock className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3">
          Session expired
        </h1>

        {/* Description */}
        <p className="mb-8" style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}>
          Your session has expired due to inactivity. Please log in again to continue accessing the admin dashboard.
        </p>

        {/* Action Button */}
        <Button
          variant="primary"
          onClick={onLogin}
          className="w-full sm:w-auto"
        >
          Go to Login
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
