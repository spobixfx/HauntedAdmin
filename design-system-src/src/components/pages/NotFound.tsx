import React from 'react';
import { Ghost, ArrowLeft } from 'lucide-react';
import { Button } from '../admin/Button';

interface NotFoundProps {
  onBackToDashboard?: () => void;
}

export function NotFound({ onBackToDashboard }: NotFoundProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--blue-electric)] opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Content */}
      <div className="relative text-center max-w-md">
        {/* Ghost Icon - Haunted themed */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] mb-6">
          <Ghost className="w-10 h-10 text-[var(--blue-electric)]" />
        </div>

        {/* Error Code */}
        <div className="text-sm text-[var(--text-muted)] mb-2 tracking-wider">
          ERROR 404
        </div>

        {/* Title */}
        <h1 className="mb-3">
          Page not found
        </h1>

        {/* Description */}
        <p className="mb-8" style={{ fontSize: 'var(--text-body)', fontWeight: 'var(--font-weight-normal)', lineHeight: 'var(--line-height-body)', color: 'var(--text-body)' }}>
          The page you're looking for doesn't exist or has been moved. It's vanished into the digital haunted realm.
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
