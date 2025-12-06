import React, { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';

interface AuthTestMenuProps {
  onTriggerSessionExpired?: () => void;
  onTriggerAccessDenied?: () => void;
  onTrigger404?: () => void;
}

export function AuthTestMenu({
  onTriggerSessionExpired,
  onTriggerAccessDenied,
  onTrigger404,
}: AuthTestMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-elevated)] transition-colors shadow-lg"
        >
          <Settings className="w-4 h-4 text-[var(--blue-electric)]" />
          <span className="text-sm text-[var(--text-secondary)]">Auth Test</span>
          <ChevronDown 
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-[var(--border-default)]">
              <p className="text-xs text-[var(--text-muted)]">Test auth states:</p>
            </div>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onTriggerSessionExpired?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Session Expired
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onTriggerAccessDenied?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Access Denied (403)
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onTrigger404?.();
              }}
              className="w-full px-4 py-2 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Not Found (404)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
